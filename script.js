/* global GOGA_CONFIG, GOGA_PROJECTS, GOGA_PATHWAY_STATS */

const DEFAULT_YEAR = (window.GOGA_CONFIG && window.GOGA_CONFIG.defaultYear) || "2026";
const DEFAULT_FILTER = (window.GOGA_CONFIG && window.GOGA_CONFIG.defaultFilter) || "all";
const INACTIVITY_LIMIT_MS = (window.GOGA_CONFIG && window.GOGA_CONFIG.inactivityLimitMs) || 300000;
const FEATURED_INTERVAL_MS = 9500;
const CARD_GRID_GAP = 12;
const ESTIMATED_CARD_HEIGHT = 210;

const state = {
  year: DEFAULT_YEAR,
  search: "",
  student: "",
  filter: DEFAULT_FILTER,
  mode: "home",
  page: 1,
  featuredIndex: 0,
  featuredTimer: null,
  inactivityTimer: null,
  activeProject: null
};

const els = {
  yearSelect: document.getElementById("yearSelect"),
  searchInput: document.getElementById("searchInput"),
  studentSelect: document.getElementById("studentSelect"),
  filterButtons: document.querySelectorAll(".filter"),
  resetButton: document.getElementById("resetButton"),
  statsButton: document.getElementById("statsButton"),
  spotlightWall: document.getElementById("spotlightWall"),
  spotlightArtwork: document.getElementById("spotlightArtwork"),
  wallLabel: document.getElementById("wallLabel"),
  featuredTrack: document.getElementById("featuredTrack"),
  featuredPrev: document.getElementById("featuredPrev"),
  featuredNext: document.getElementById("featuredNext"),
  featuredPosition: document.getElementById("featuredPosition"),
  browsePanel: document.getElementById("browsePanel"),
  galleryPanel: document.getElementById("galleryPanel"),
  statsPanel: document.getElementById("statsPanel"),
  statsContent: document.getElementById("statsContent"),
  statsYearPill: document.getElementById("statsYearPill"),
  projectGrid: document.getElementById("projectGrid"),
  projectCount: document.getElementById("projectCount"),
  pageLabel: document.getElementById("pageLabel"),
  prevButton: document.getElementById("prevButton"),
  nextButton: document.getElementById("nextButton"),
  modeLabel: document.getElementById("modeLabel"),
  galleryTitle: document.getElementById("galleryTitle"),
  backHomeButton: document.getElementById("backHomeButton"),
  statsBackButton: document.getElementById("statsBackButton"),
  viewer: document.getElementById("viewer"),
  closeViewer: document.getElementById("closeViewer"),
  viewerTitle: document.getElementById("viewerTitle"),
  viewerStudent: document.getElementById("viewerStudent"),
  projectFrame: document.getElementById("projectFrame"),
  viewerNote: document.getElementById("viewerNote"),
  themeToggle: document.getElementById("themeToggle"),
  themeToggleLabel: document.getElementById("themeToggleLabel")
};

function projects() {
  return Array.isArray(window.GOGA_PROJECTS) ? window.GOGA_PROJECTS : [];
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getYear(project) {
  return String(project.year || project.submissionYear || DEFAULT_YEAR);
}

function getTitle(project) {
  const title = String(project.projectTitle || "").trim();
  if (title) return title;

  const type = normalize(project.projectType);
  if (type.includes("game")) return "Student Game Project";
  if (type.includes("web")) return "Student Website Project";
  return "Student Digital Project";
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function getYears() {
  const years = uniqueSorted(projects().map(getYear));
  if (!years.includes(DEFAULT_YEAR)) years.push(DEFAULT_YEAR);
  return years.sort((a, b) => Number(b) - Number(a));
}

function circularIndex(index, total) {
  return ((index % total) + total) % total;
}

function projectKind(project) {
  const type = normalize(project.projectType);
  if (type.includes("web")) return "website";
  if (type.includes("game")) return "game";
  return "other";
}

function galleryName(projectOrFilter) {
  const value = typeof projectOrFilter === "string" ? projectOrFilter : projectKind(projectOrFilter);

  if (value === "website") return "Website Gallery";
  if (value === "game") return "Game Arcade";
  if (value === "other") return "Creative Coding Lab";
  return "All Projects";
}

function courseLabel(project) {
  return project.className || "Software Engineering";
}

function neutralProjectNote(project) {
  const kind = projectKind(project);
  const assignment = String(project.codehsAssignment || project.projectTitle || "").trim();

  if (kind === "website") {
    return "A student-created website submitted during the Web Design portion of the Software Engineering pathway. It is presented here as a snapshot of student work from this course.";
  }

  if (kind === "game") {
    const gameName = assignment ? `${assignment} ` : "";
    return `A student-created ${gameName}game submitted during the Game Development portion of the Software Engineering pathway. CodeHS games open best in a separate tab.`;
  }

  return "A student-created creative coding project submitted during the Software Engineering pathway. This project uses graphics, animation, or drawing commands.";
}

function featuredProjects() {
  const list = projects()
    .filter(project => getYear(project) === state.year && project.featured)
    .slice()
    .sort((a, b) => getTitle(a).localeCompare(getTitle(b)));

  if (list.length > 0) return list;

  return projects()
    .filter(project => getYear(project) === state.year)
    .slice(0, 12);
}

function matches(project) {
  if (getYear(project) !== state.year) return false;

  const search = normalize(state.search);
  const haystack = [
    project.studentDisplayName,
    getTitle(project),
    project.projectType,
    project.classCode,
    project.className,
    project.gradeLabelAtSubmission,
    project.codehsAssignment,
    project.featured ? "featured" : ""
  ].map(normalize).join(" ");

  if (search && !haystack.includes(search)) return false;
  if (state.student && project.studentDisplayName !== state.student) return false;

  const kind = projectKind(project);
  if (state.filter !== "all" && kind !== state.filter) return false;

  return true;
}

function filteredProjects() {
  return projects()
    .filter(matches)
    .slice()
    .sort((a, b) => {
      const kindCompare = galleryName(projectKind(a)).localeCompare(galleryName(projectKind(b)));
      if (state.filter === "all" && kindCompare !== 0) return kindCompare;

      const studentCompare = String(a.studentDisplayName || "").localeCompare(String(b.studentDisplayName || ""));
      if (studentCompare !== 0) return studentCompare;

      return getTitle(a).localeCompare(getTitle(b));
    });
}

function setupYears() {
  els.yearSelect.innerHTML = getYears().map(year => `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`).join("");
  els.yearSelect.value = state.year;
}

function setupStudents() {
  const students = uniqueSorted(projects()
    .filter(project => getYear(project) === state.year)
    .map(project => project.studentDisplayName));

  els.studentSelect.innerHTML = `<option value="">All students</option>` + students
    .map(student => `<option value="${escapeHtml(student)}">${escapeHtml(student)}</option>`)
    .join("");

  if (students.includes(state.student)) {
    els.studentSelect.value = state.student;
  } else {
    state.student = "";
    els.studentSelect.value = "";
  }
}

function setupFilterButtons() {
  els.filterButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.filter === state.filter);
  });
}

function render() {
  document.body.classList.toggle("mode-home", state.mode === "home");
  document.body.classList.toggle("mode-gallery", state.mode === "gallery");
  document.body.classList.toggle("mode-stats", state.mode === "stats");

  setupYears();
  setupStudents();
  setupFilterButtons();
  setupStatsButton();

  els.spotlightWall.hidden = state.mode !== "home";
  els.browsePanel.hidden = state.mode === "stats";
  els.galleryPanel.hidden = state.mode !== "gallery";
  els.statsPanel.hidden = state.mode !== "stats";

  if (state.mode === "home") {
    renderSpotlight();
    stopFeaturedTimer();
    startFeaturedTimer();
  } else {
    stopFeaturedTimer();
  }

  if (state.mode === "gallery") renderGallery();
  if (state.mode === "stats") renderPathwayStats();
}

function setupStatsButton() {
  const active = state.mode === "stats";
  els.statsButton.classList.toggle("active", active);
  els.statsButton.setAttribute("aria-pressed", String(active));
  els.statsButton.textContent = active ? "Back to Exhibit" : "Pathway Stats";
}

function renderSpotlight() {
  const list = featuredProjects();

  if (!list.length) {
    els.spotlightArtwork.innerHTML = `<div class="empty">No featured projects are available for this year.</div>`;
    els.wallLabel.innerHTML = "";
    els.featuredTrack.innerHTML = "";
    return;
  }

  state.featuredIndex = circularIndex(state.featuredIndex, list.length);
  const project = list[state.featuredIndex];

  els.spotlightArtwork.innerHTML = `
    <div class="art-frame">
      ${previewMarkup(project, "spotlight")}
    </div>
    <div class="art-caption">
      <div>
        <p>${escapeHtml(galleryName(projectKind(project)))}</p>
        <h3>${escapeHtml(getTitle(project))}</h3>
        <span>${escapeHtml(project.studentDisplayName || "Student")} · ${escapeHtml(project.projectType || "Project")}</span>
      </div>
      <button type="button" class="spotlight-open">Open Project →</button>
    </div>
  `;

  els.spotlightArtwork.querySelector(".spotlight-open").addEventListener("click", event => {
    event.stopPropagation();
    openViewer(project);
  });

  els.spotlightArtwork.onclick = event => {
    if (event.target.closest("button")) return;
    openViewer(project);
  };

  els.wallLabel.innerHTML = `
    <p class="wall-label-kicker">Wall Label</p>
    <h3>${escapeHtml(getTitle(project))}</h3>
    <dl>
      <div><dt>Student</dt><dd>${escapeHtml(project.studentDisplayName || "Student")}</dd></div>
      <div><dt>Gallery</dt><dd>${escapeHtml(galleryName(projectKind(project)))}</dd></div>
      <div><dt>Course</dt><dd>${escapeHtml(courseLabel(project))}</dd></div>
      <div><dt>Year</dt><dd>${escapeHtml(getYear(project))}</dd></div>
    </dl>
    <p class="wall-label-note">${escapeHtml(neutralProjectNote(project))}</p>
  `;

  const maxThumbs = Math.min(7, list.length);
  const thumbs = Array.from({ length: maxThumbs }, (_, offset) => {
    const originalIndex = circularIndex(state.featuredIndex + offset, list.length);
    return { project: list[originalIndex], originalIndex };
  });

  els.featuredTrack.innerHTML = thumbs.map(item => {
    const active = item.originalIndex === state.featuredIndex ? " active" : "";
    return `
      <button type="button" class="rail-card${active}" data-featured-index="${item.originalIndex}">
        ${previewMarkup(item.project, "thumb")}
        <span>${escapeHtml(getTitle(item.project))}</span>
      </button>
    `;
  }).join("");

  els.featuredTrack.querySelectorAll("[data-featured-index]").forEach(button => {
    button.addEventListener("click", () => {
      state.featuredIndex = Number(button.dataset.featuredIndex);
      renderSpotlight();
    });
  });

  if (els.featuredPosition) els.featuredPosition.textContent = `${state.featuredIndex + 1} of ${list.length}`;
}

function advanceFeatured(step) {
  const list = featuredProjects();
  if (!list.length) return;
  state.featuredIndex = circularIndex(state.featuredIndex + step, list.length);
  renderSpotlight();
}

function startFeaturedTimer() {
  stopFeaturedTimer();
  state.featuredTimer = window.setInterval(() => {
    if (state.mode === "home" && !state.activeProject) advanceFeatured(1);
  }, FEATURED_INTERVAL_MS);
}

function stopFeaturedTimer() {
  if (state.featuredTimer) window.clearInterval(state.featuredTimer);
  state.featuredTimer = null;
}

function getProjectsPerPage() {
  const width = window.innerWidth;
  const gridHeight = els.projectGrid ? els.projectGrid.getBoundingClientRect().height : 0;

  let columns = 2;
  if (width >= 1380) columns = 5;
  else if (width >= 1050) columns = 4;
  else if (width >= 760) columns = 3;

  if (width < 760) {
    els.projectGrid.style.removeProperty("--gallery-columns");
    els.projectGrid.style.removeProperty("--gallery-rows");
    return 8;
  }

  const rowsFromHeight = gridHeight > 0
    ? Math.floor((gridHeight + CARD_GRID_GAP) / (ESTIMATED_CARD_HEIGHT + CARD_GRID_GAP))
    : 2;

  const rows = Math.max(1, Math.min(2, rowsFromHeight || 2));
  els.projectGrid.style.setProperty("--gallery-columns", String(columns));
  els.projectGrid.style.setProperty("--gallery-rows", String(rows));

  return columns * rows;
}

function renderGallery() {
  const list = filteredProjects();
  const perPage = getProjectsPerPage();
  const totalPages = Math.max(1, Math.ceil(list.length / perPage));

  state.page = Math.max(1, Math.min(state.page, totalPages));

  const start = (state.page - 1) * perPage;
  const visible = list.slice(start, start + perPage);

  updateGalleryHeading(list.length, totalPages);

  if (!visible.length) {
    els.projectGrid.innerHTML = `
      <div class="empty gallery-empty">
        <h3>No projects match this view.</h3>
        <p>Try another gallery room, clear the search, or select a different student.</p>
      </div>
    `;
    return;
  }

  els.projectGrid.innerHTML = visible.map(projectCard).join("");

  els.projectGrid.querySelectorAll("[data-project-index]").forEach(card => {
    const open = () => openViewer(projects()[Number(card.dataset.projectIndex)]);
    card.addEventListener("click", open);
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

function updateGalleryHeading(count, totalPages) {
  let title = galleryName(state.filter);
  let label = "Gallery Room";

  if (state.student) {
    title = `${state.student}'s Projects`;
    label = "Selected Student";
  } else if (state.search) {
    title = "Matching Student Projects";
    label = "Search Results";
  }

  els.modeLabel.textContent = label;
  els.galleryTitle.textContent = title;
  els.projectCount.textContent = `${count} ${count === 1 ? "project" : "projects"}`;
  els.pageLabel.textContent = `Page ${state.page} of ${totalPages}`;
  els.prevButton.disabled = state.page <= 1;
  els.nextButton.disabled = state.page >= totalPages;
}

function projectCard(project) {
  const index = projects().indexOf(project);
  return `
    <article class="project-card ${escapeHtml(projectKind(project))}" data-project-index="${index}" role="button" tabindex="0" aria-label="View ${escapeHtml(getTitle(project))} by ${escapeHtml(project.studentDisplayName || "Student")}">
      ${previewMarkup(project, "card")}
      <div class="project-card-info">
        <div>
          <p>${escapeHtml(galleryName(projectKind(project)))}</p>
          <h3>${escapeHtml(getTitle(project))}</h3>
          <span>${escapeHtml(project.studentDisplayName || "Student")}</span>
        </div>
        <span class="open-corner" aria-hidden="true">↗</span>
      </div>
    </article>
  `;
}

function previewMarkup(project, size) {
  const kind = projectKind(project);
  const seed = hashProject(project);
  const hue = seed % 360;
  const title = getTitle(project);
  const assignment = normalize(project.codehsAssignment || title);
  const cssVars = `--hue:${hue}; --hue2:${(hue + 42) % 360};`;

  if (kind === "website") {
    return `
      <div class="preview preview-website preview-${size}" style="${cssVars}">
        <div class="browser-bar"><i></i><i></i><i></i></div>
        <div class="website-canvas">
          <div class="website-hero">
            <strong>${escapeHtml(shortPreviewTitle(title))}</strong>
            <span></span>
          </div>
          <div class="website-layout">
            <b></b><b></b><b></b>
          </div>
        </div>
      </div>
    `;
  }

  if (assignment.includes("breakout") || assignment.includes("collision")) {
    return `
      <div class="preview preview-game preview-breakout preview-${size}" style="${cssVars}">
        <div class="game-hud"><span></span><span></span><span></span></div>
        <div class="bricks">${Array.from({ length: 20 }, () => "<i></i>").join("")}</div>
        <b class="ball"></b><b class="paddle"></b>
      </div>
    `;
  }

  if (assignment.includes("snake") || assignment.includes("finishing touches")) {
    return `
      <div class="preview preview-game preview-snake preview-${size}" style="${cssVars}">
        <div class="snake-grid"></div>
        <b class="snake s1"></b><b class="snake s2"></b><b class="snake s3"></b><b class="food"></b>
      </div>
    `;
  }

  if (assignment.includes("tic") || assignment.includes("toe")) {
    return `
      <div class="preview preview-game preview-tictactoe preview-${size}" style="${cssVars}">
        <div class="ttt-board"><span>×</span><span>○</span><span>×</span><span></span><span>×</span><span>○</span><span>○</span><span></span><span>×</span></div>
      </div>
    `;
  }

  if (assignment.includes("helicopter")) {
    return `
      <div class="preview preview-game preview-heli preview-${size}" style="${cssVars}">
        <div class="cave top"></div><div class="cave bottom"></div><b class="heli"></b><i></i><i></i><i></i>
      </div>
    `;
  }

  if (kind === "game") {
    return `
      <div class="preview preview-game preview-arcade preview-${size}" style="${cssVars}">
        <div class="arcade-grid"></div><b></b><i></i><i></i><i></i>
      </div>
    `;
  }

  return `
    <div class="preview preview-other preview-${size}" style="${cssVars}">
      <span></span><span></span><span></span><span></span>
      <div class="code-lines"><i></i><i></i><i></i></div>
    </div>
  `;
}

function shortPreviewTitle(title) {
  const text = String(title || "Student Project").trim();
  if (text.length <= 24) return text;
  return `${text.slice(0, 22)}…`;
}

function hashProject(project) {
  const text = `${project.studentDisplayName || ""}|${getTitle(project)}|${project.projectType || ""}`;
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function renderPathwayStats() {
  const stats = window.GOGA_PATHWAY_STATS;

  if (!stats || !stats.totals) {
    els.statsContent.innerHTML = `<div class="empty">Pathway statistics are not available yet.</div>`;
    return;
  }

  const courses = Array.isArray(stats.courses) ? stats.courses : [];
  const totals = stats.totals;
  const maxHours = Math.max(...courses.map(course => Number(course.totalHours) || 0), 1);
  const totalHours = totals.totalHoursRounded || Math.round((totals.totalSeconds || 0) / 3600);
  const se11Hours = totals.se11HoursRounded || Math.round((totals.se11Seconds || 0) / 3600);
  const gradeStats = buildGradeStats(courses);
  const pieStyle = buildPieStyle(gradeStats);

  els.statsYearPill.textContent = `${escapeHtml(stats.year || state.year)} stats`;

  els.statsContent.innerHTML = `
    <div class="stats-hero">
      <div>
        <p>Gateway Tech Software Engineering</p>
        <h3>${formatNumber(totalHours)} hours of time spent coding</h3>
        <span>Based on CodeHS activity across AP CSP, Web Design, Game Development, and AP CSA.</span>
      </div>
      <strong>${escapeHtml(stats.year || state.year)}</strong>
    </div>

    <div class="stats-kpi-grid">
      <article><strong>${formatNumber(totalHours)}</strong><span>Total Hours</span></article>
      <article><strong>${formatNumber(totals.uniqueStudents || 0)}</strong><span>Students</span></article>
      <article><strong>${formatNumber(se11Hours)}</strong><span>SE11 Hours</span></article>
      <article><strong>${formatNumber(totals.courseSections || courses.length)}</strong><span>Course Sections</span></article>
    </div>

    <div class="stats-detail-grid">
      <article class="stats-card stats-bars-card">
        <div class="stats-section-heading"><p>Course Breakdown</p><h3>Time Spent Coding</h3></div>
        <div class="stats-bars">
          ${courses.map(course => {
            const hours = Number(course.totalHours) || 0;
            const width = Math.max(8, Math.round((hours / maxHours) * 100));
            return `
              <div class="stats-bar-row">
                <div><strong>${escapeHtml(course.displayName || course.className)}</strong><span>${escapeHtml(course.gradeLabel || "")} · ${formatNumber(course.studentCount || 0)} students</span></div>
                <div class="stats-bar-track"><b style="--bar-width:${width}%"></b></div>
                <em>${formatNumber(Math.round(hours))} hrs</em>
              </div>
            `;
          }).join("")}
        </div>
      </article>

      <article class="stats-card stats-grade-card">
        <div class="stats-section-heading"><p>Grade-Level Share</p><h3>Hours by Grade</h3></div>
        <div class="stats-pie-wrap">
          <div class="stats-pie" style="${escapeHtml(pieStyle)}" aria-hidden="true"></div>
          <div class="stats-pie-legend">
            ${gradeStats.map(item => `
              <div><span style="--key-color:${escapeHtml(item.color)}"></span><strong>${escapeHtml(item.label)}</strong><em>${formatNumber(Math.round(item.hours))} hrs</em></div>
            `).join("")}
          </div>
        </div>
      </article>

      <article class="stats-card stats-note-card">
        <div class="stats-section-heading"><p>Pathway Context</p><h3>Three-Year Sequence</h3></div>
        <ul>
          <li><strong>SE10:</strong> AP Computer Science Principles introduces foundational computing and programming for sophomores.</li>
          <li><strong>SE11:</strong> Web Design and Game Development combines first-semester websites with second-semester games.</li>
          <li><strong>SE12:</strong> AP Computer Science A focuses on Java and object-oriented programming.</li>
        </ul>
      </article>
    </div>
  `;
}

function buildGradeStats(courses) {
  const byGrade = new Map();

  courses.forEach(course => {
    const label = course.gradeLabel || "Other";
    const seconds = Number(course.totalSeconds) || 0;
    byGrade.set(label, (byGrade.get(label) || 0) + seconds);
  });

  const colors = {
    Sophomore: "var(--red)",
    Junior: "#8f242b",
    Senior: "#747474",
    Other: "#999999"
  };

  return [...byGrade.entries()]
    .map(([label, seconds]) => ({ label, seconds, hours: seconds / 3600, color: colors[label] || colors.Other }))
    .sort((a, b) => {
      const order = { Sophomore: 1, Junior: 2, Senior: 3, Other: 4 };
      return (order[a.label] || 99) - (order[b.label] || 99);
    });
}

function buildPieStyle(items) {
  const total = items.reduce((sum, item) => sum + item.seconds, 0) || 1;
  let cursor = 0;

  const parts = items.map(item => {
    const start = cursor;
    const end = cursor + (item.seconds / total) * 100;
    cursor = end;
    return `${item.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
  });

  return `background: conic-gradient(${parts.join(", ")});`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

function enterGallery(filter = state.filter) {
  state.mode = "gallery";
  state.filter = filter;
  state.page = 1;
  render();
}

function returnHome() {
  state.mode = "home";
  state.page = 1;
  closeProjectViewer();
  render();
}

function openViewer(project) {
  if (!project) return;

  state.activeProject = project;
  els.viewerTitle.textContent = getTitle(project);
  els.viewerStudent.textContent = `${project.studentDisplayName || "Student"} · ${project.projectType || "Project"}`;
  els.viewerNote.hidden = true;

  const link = String(project.projectLink || "").trim();

  if (!link) {
    els.projectFrame.removeAttribute("src");
    els.projectFrame.removeAttribute("srcdoc");
    els.viewerNote.hidden = false;
  } else if (isCodeHsProject(link)) {
    els.projectFrame.removeAttribute("src");
    els.projectFrame.srcdoc = codeHsLaunchScreen(project, link);
  } else {
    els.projectFrame.removeAttribute("srcdoc");
    els.projectFrame.src = getEmbedUrl(link);
  }

  els.viewer.classList.add("open");
  els.viewer.setAttribute("aria-hidden", "false");
  els.closeViewer.focus();
}

function closeProjectViewer() {
  els.viewer.classList.remove("open");
  els.viewer.setAttribute("aria-hidden", "true");
  els.projectFrame.removeAttribute("src");
  els.projectFrame.removeAttribute("srcdoc");
  els.viewerNote.hidden = true;
  state.activeProject = null;
}

function isCodeHsProject(url) {
  try {
    return new URL(String(url || "").trim()).hostname.toLowerCase().includes("codehs.com");
  } catch {
    return String(url || "").toLowerCase().includes("codehs.com");
  }
}

function getEmbedUrl(url) {
  const cleanUrl = String(url || "").trim();
  if (!cleanUrl) return "";

  try {
    const parsed = new URL(cleanUrl);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("codehs.com")) return parsed.toString();

    return parsed.toString();
  } catch {
    return cleanUrl;
  }
}

function codeHsLaunchScreen(project, link) {
  const title = escapeHtml(getTitle(project));
  const student = escapeHtml(project.studentDisplayName || "Student");
  const type = escapeHtml(project.projectType || "Project");
  const safeLink = escapeHtml(link);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        html, body { width: 100%; height: 100%; margin: 0; font-family: Arial, Helvetica, sans-serif; background: #111; color: #fff; }
        body { display: grid; place-items: center; padding: 24px; box-sizing: border-box; }
        .launch-card { width: min(760px, 92vw); border: 1px solid rgba(255,255,255,.18); border-radius: 22px; background: linear-gradient(135deg, rgba(237,28,36,.22), rgba(255,255,255,.06)); box-shadow: 0 18px 44px rgba(0,0,0,.45); padding: 34px; text-align: center; }
        .kicker { margin: 0 0 10px; color: #ff5a62; font-size: .85rem; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; }
        h1 { margin: 0; font-size: clamp(2rem, 5vw, 3.4rem); line-height: .98; letter-spacing: -.05em; }
        .student { margin: 14px 0 0; color: rgba(255,255,255,.78); font-size: 1.15rem; font-weight: 800; }
        .note { max-width: 580px; margin: 24px auto 28px; color: rgba(255,255,255,.72); font-size: 1.05rem; line-height: 1.45; }
        a { display: inline-flex; align-items: center; justify-content: center; min-height: 52px; border-radius: 999px; background: #ed1c24; color: #fff; padding: 0 26px; font-size: 1.05rem; font-weight: 950; text-decoration: none; }
        a:hover, a:focus { background: #ff5a62; outline: none; }
      </style>
    </head>
    <body>
      <main class="launch-card">
        <p class="kicker">CodeHS Project</p>
        <h1>${title}</h1>
        <p class="student">${student} · ${type}</p>
        <p class="note">This CodeHS project opens best in its own browser tab. Click below to launch the student project directly in CodeHS.</p>
        <a href="${safeLink}" target="_blank" rel="noopener noreferrer">Open CodeHS Project →</a>
      </main>
    </body>
    </html>
  `;
}

function resetAll() {
  state.year = DEFAULT_YEAR;
  state.search = "";
  state.student = "";
  state.filter = DEFAULT_FILTER;
  state.mode = "home";
  state.page = 1;
  state.featuredIndex = 0;

  els.searchInput.value = "";
  els.studentSelect.value = "";
  els.yearSelect.value = DEFAULT_YEAR;

  closeProjectViewer();
  render();
}

function applyTheme(theme) {
  const isDark = theme !== "light";
  document.body.classList.toggle("dark-mode", isDark);

  if (els.themeToggle) {
    els.themeToggle.setAttribute("aria-pressed", String(isDark));
    els.themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  if (els.themeToggleLabel) {
    els.themeToggleLabel.textContent = isDark ? "Dark" : "Light";
  }

  localStorage.setItem("gogaTheme", isDark ? "dark" : "light");
}

function setupTheme() {
  applyTheme(localStorage.getItem("gogaTheme") || "dark");
}

function bindEvents() {
  if (els.themeToggle) {
    els.themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.contains("dark-mode");
      applyTheme(isDark ? "light" : "dark");
    });
  }

  els.statsButton.addEventListener("click", () => {
    if (state.mode === "stats") {
      returnHome();
      return;
    }

    state.mode = "stats";
    render();
  });

  els.featuredPrev.addEventListener("click", () => advanceFeatured(-1));
  els.featuredNext.addEventListener("click", () => advanceFeatured(1));

  els.filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      enterGallery(button.dataset.filter || "all");
    });
  });

  els.searchInput.addEventListener("input", () => {
    state.search = els.searchInput.value;
    state.page = 1;
    if (state.search && state.mode !== "gallery") state.mode = "gallery";
    render();
  });

  els.studentSelect.addEventListener("change", () => {
    state.student = els.studentSelect.value;
    state.page = 1;
    if (state.student && state.mode !== "gallery") state.mode = "gallery";
    render();
  });

  els.yearSelect.addEventListener("change", () => {
    state.year = els.yearSelect.value;
    state.page = 1;
    state.student = "";
    state.search = "";
    state.featuredIndex = 0;
    els.searchInput.value = "";
    render();
  });

  els.resetButton.addEventListener("click", resetAll);
  els.backHomeButton.addEventListener("click", returnHome);
  els.statsBackButton.addEventListener("click", returnHome);

  els.prevButton.addEventListener("click", () => {
    state.page -= 1;
    renderGallery();
  });

  els.nextButton.addEventListener("click", () => {
    state.page += 1;
    renderGallery();
  });

  els.closeViewer.addEventListener("click", closeProjectViewer);

  els.viewer.addEventListener("click", event => {
    if (event.target === els.viewer) closeProjectViewer();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeProjectViewer();
    if (state.mode === "home" && event.key === "ArrowLeft") advanceFeatured(-1);
    if (state.mode === "home" && event.key === "ArrowRight") advanceFeatured(1);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopFeaturedTimer();
    else if (state.mode === "home") startFeaturedTimer();
  });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (state.mode === "gallery") renderGallery();
    }, 150);
  });

  ["click", "keydown", "mousemove", "touchstart"].forEach(eventName => {
    window.addEventListener(eventName, resetInactivityTimer, { passive: true });
  });
}

function resetInactivityTimer() {
  window.clearTimeout(state.inactivityTimer);
  state.inactivityTimer = window.setTimeout(resetAll, INACTIVITY_LIMIT_MS);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

setupTheme();
bindEvents();
render();
resetInactivityTimer();
