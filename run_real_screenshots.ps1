# GOGA one-click real screenshot generator
# Put this file in the ROOT of your GOGA repo, then run:
# powershell -ExecutionPolicy Bypass -File .\run_real_screenshots.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "GOGA real website screenshot generator" -ForegroundColor Cyan
Write-Host "--------------------------------------" -ForegroundColor Cyan

# 1. Confirm repo root.
if (!(Test-Path ".\students.js") -or !(Test-Path ".\index.html")) {
    Write-Host ""
    Write-Host "ERROR: This script must be run from the root of your GOGA website repo." -ForegroundColor Red
    Write-Host "I expected to find students.js and index.html in the current folder." -ForegroundColor Red
    Write-Host ""
    Write-Host "Current folder:" -ForegroundColor Yellow
    Get-Location
    Write-Host ""
    Write-Host "Move run_real_screenshots.ps1 into the same folder as students.js and index.html, then run it again." -ForegroundColor Yellow
    exit 1
}

# 2. Create tools folder.
if (!(Test-Path ".\tools")) {
    New-Item -ItemType Directory -Path ".\tools" | Out-Null
}

# 3. Confirm Python.
$python = Get-Command python -ErrorAction SilentlyContinue
if ($null -eq $python) {
    Write-Host ""
    Write-Host "ERROR: Python was not found." -ForegroundColor Red
    Write-Host "Install Python from https://www.python.org/downloads/ and check the box that says Add Python to PATH." -ForegroundColor Yellow
    exit 1
}

Write-Host "Using Python:" $python.Source -ForegroundColor Green

# 4. Install dependencies.
Write-Host ""
Write-Host "Installing/updating required Python packages..." -ForegroundColor Cyan
python -m pip install --upgrade pip
python -m pip install playwright pillow

# 5. Install Playwright Chromium.
Write-Host ""
Write-Host "Installing Playwright Chromium browser if needed..." -ForegroundColor Cyan
python -m playwright install chromium

# 6. Backup current files.
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = ".\screenshot-backup-$timestamp"
New-Item -ItemType Directory -Path $backupDir | Out-Null

Copy-Item ".\students.js" "$backupDir\students.js"

if (Test-Path ".\assets\previews") {
    New-Item -ItemType Directory -Path "$backupDir\previews" | Out-Null
    Copy-Item ".\assets\previews\*" "$backupDir\previews\" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Backup created:" $backupDir -ForegroundColor Green

# 7. Write the Python screenshot generator into tools.
$pythonScript = @'
#!/usr/bin/env python3
"""
Generate real browser screenshots for local GOGA student websites.

This script is called by run_real_screenshots.ps1.

It:
- Reads students.js
- Finds local website projects such as student-sites/.../index.html
- Starts a temporary local web server
- Opens each site in Playwright Chromium
- Takes a real screenshot
- Crops/resizes it to 1280 x 720
- Saves it in assets/previews/
- Updates students.js with previewImage paths
"""

from __future__ import annotations

import argparse
import json
import re
import socket
import subprocess
import sys
import time
from pathlib import Path
from typing import Any
from urllib.parse import quote

from PIL import Image
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
STUDENTS_JS = ROOT / "students.js"
PREVIEW_DIR = ROOT / "assets" / "previews"


def slugify(value: str) -> str:
    value = str(value or "").lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or "project"


def parse_students_js() -> tuple[str, list[dict[str, Any]]]:
    text = STUDENTS_JS.read_text(encoding="utf-8")

    config_match = re.search(r"window\.GOGA_CONFIG\s*=\s*({[\s\S]*?});", text)
    projects_match = re.search(r"window\.GOGA_PROJECTS\s*=\s*(\[[\s\S]*?\]);", text)

    if not projects_match:
        raise RuntimeError("Could not find window.GOGA_PROJECTS in students.js")

    config_text = config_match.group(1) if config_match else "{}"
    projects = json.loads(projects_match.group(1))
    return config_text, projects


def write_students_js(config_text: str, projects: list[dict[str, Any]]) -> None:
    STUDENTS_JS.write_text(
        "/*\n"
        "  Curated students.js for GOGA.\n"
        "  Project records include grade/class metadata at the time of submission for historical year-by-year archives.\n"
        "  Local website projects include previewImage screenshots generated from the live page.\n"
        "*/\n\n"
        "window.GOGA_CONFIG = "
        + config_text
        + ";\n\nwindow.GOGA_PROJECTS = "
        + json.dumps(projects, indent=2)
        + ";\n",
        encoding="utf-8",
    )


def is_local_website_project(project: dict[str, Any]) -> bool:
    project_type = str(project.get("projectType", "")).lower()
    link = str(project.get("projectLink", "")).strip().lower()

    return (
        "web" in project_type
        and bool(link)
        and not link.startswith("http://")
        and not link.startswith("https://")
        and link.endswith(".html")
    )


def crop_to_16x9(src: Path, dest: Path) -> None:
    img = Image.open(src).convert("RGB")
    w, h = img.size
    target_ratio = 16 / 9
    current_ratio = w / h

    if current_ratio > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        img = img.crop((left, 0, left + new_w, h))
    elif current_ratio < target_ratio:
        new_h = int(w / target_ratio)
        img = img.crop((0, 0, w, min(new_h, h)))

    img = img.resize((1280, 720), Image.Resampling.LANCZOS)
    img.save(dest, quality=88, optimize=True)


def find_free_port() -> int:
    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.close()
    return port


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--headed", action="store_true", help="Show the browser while screenshots are generated.")
    parser.add_argument("--slow", action="store_true", help="Wait longer before each screenshot.")
    parser.add_argument("--limit", type=int, default=0, help="Only process the first N local website projects.")
    parser.add_argument("--dry-run", action="store_true", help="List projects without changing files.")
    args = parser.parse_args()

    if not STUDENTS_JS.exists():
        raise RuntimeError(f"Could not find students.js at {STUDENTS_JS}")

    config_text, projects = parse_students_js()
    website_projects = [p for p in projects if is_local_website_project(p)]

    if args.limit > 0:
        website_projects = website_projects[: args.limit]

    print(f"Found {len(website_projects)} local website projects.")

    if args.dry_run:
        for project in website_projects:
            print(f"- {project.get('studentDisplayName', 'Student')}: {project.get('projectLink')}")
        return

    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)

    port = find_free_port()
    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1"],
        cwd=str(ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    created = 0
    failed: list[str] = []

    try:
        time.sleep(1)

        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=not args.headed)
            context = browser.new_context(
                viewport={"width": 1440, "height": 900},
                device_scale_factor=1,
                ignore_https_errors=True,
            )
            page = context.new_page()

            for index, project in enumerate(website_projects, start=1):
                student = str(project.get("studentDisplayName", "Student"))
                title = str(project.get("projectTitle", "Website"))
                link = str(project.get("projectLink", "")).strip()

                slug = slugify(f"{student} {title}")
                raw_path = PREVIEW_DIR / f"{slug}-raw.png"
                final_path = PREVIEW_DIR / f"{slug}.jpg"
                url = f"http://127.0.0.1:{port}/{quote(link, safe='/')}"

                print(f"[{index}/{len(website_projects)}] Capturing {student} — {title}")

                try:
                    page.goto(url, wait_until="networkidle", timeout=15000)
                except PlaywrightTimeoutError:
                    print("  networkidle timed out; trying screenshot anyway after short delay")

                page.wait_for_timeout(2200 if args.slow else 900)
                page.evaluate("window.scrollTo(0, 0)")
                page.screenshot(path=str(raw_path), full_page=False)
                crop_to_16x9(raw_path, final_path)
                raw_path.unlink(missing_ok=True)

                project["previewImage"] = f"assets/previews/{final_path.name}"
                created += 1
                print(f"  saved {project['previewImage']}")

            context.close()
            browser.close()

    finally:
        server.terminate()
        try:
            server.wait(timeout=2)
        except Exception:
            server.kill()

    write_students_js(config_text, projects)

    print()
    print(f"Done. Created/updated {created} screenshots.")
    if failed:
        print("Failed:")
        for item in failed:
            print(f"- {item}")


if __name__ == "__main__":
    main()

'@

Set-Content -Path ".\tools\generate_real_website_screenshots.py" -Value $pythonScript -Encoding UTF8

# 8. Run screenshots.
Write-Host ""
Write-Host "Generating real screenshots for local student websites..." -ForegroundColor Cyan
Write-Host "This may take a few minutes. A browser may briefly open if headed mode is enabled." -ForegroundColor DarkGray

python ".\tools\generate_real_website_screenshots.py" --slow

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host ""
Write-Host "Changed files to review/commit:" -ForegroundColor Cyan
Write-Host "  students.js"
Write-Host "  assets/previews/"
Write-Host ""
Write-Host "Backup folder, in case you need to revert:" -ForegroundColor Yellow
Write-Host "  $backupDir"
Write-Host ""
Write-Host "Next step: run/open the website locally or push to your museum branch and preview it." -ForegroundColor Cyan
