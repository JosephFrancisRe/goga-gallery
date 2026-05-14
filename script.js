/* global GOGA_CONFIG, GOGA_PROJECTS, GOGA_PATHWAY_STATS */

const DEFAULT_YEAR = (window.GOGA_CONFIG && window.GOGA_CONFIG.defaultYear) || "2026";
const DEFAULT_FILTER = (window.GOGA_CONFIG && window.GOGA_CONFIG.defaultFilter) || "all";
const INACTIVITY_LIMIT_MS = (window.GOGA_CONFIG && window.GOGA_CONFIG.inactivityLimitMs) || 300000;
const MAX_PROJECT_ROWS = 3;
const ESTIMATED_CARD_HEIGHT = 136;
const CARD_GRID_GAP = 10;
const FEATURED_INTERVAL_MS = 8500;
const FEATURED_MIN_CARD_WIDTH = 380;
const FEATURED_GAP = 16;

const state = {
  year: DEFAULT_YEAR,
  search: "",
  student: "",
  filter: DEFAULT_FILTER,
  mode: "gallery",
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
  featuredShowcase: document.getElementById("featuredShowcase"),
  featuredTrack: document.getElementById("featuredTrack"),
  featuredPrev: document.getElementById("featuredPrev"),
  featuredNext: document.getElementById("featuredNext"),
  featuredPosition: document.getElementById("featuredPosition"),
  projectGrid: document.getElementById("projectGrid"),
  projectCount: document.getElementById("projectCount"),
  pageLabel: document.getElementById("pageLabel"),
  prevButton: document.getElementById("prevButton"),
  nextButton: document.getElementById("nextButton"),
  pager: document.querySelector(".pager"),
  modeLabel: document.getElementById("modeLabel"),
  galleryTitle: document.getElementById("galleryTitle"),
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

function getYear(project) {
  return String(project.year || project.submissionYear || DEFAULT_YEAR);
}

function getTitle(project) {
  const title = String(project.projectTitle || "").trim();
  if (title) return title;

  const type = String(project.projectType || "").toLowerCase();
  if (type.includes("game")) return "Student Game Project";
  if (type.includes("web")) return "Student Website Project";
  return "Student Digital Project";
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function getYears() {
  const years = uniqueSorted(projects().map(getYear));
  if (!years.includes(DEFAULT_YEAR)) years.push(DEFAULT_YEAR);
  return years.sort((a, b) => Number(b) - Number(a));
}

function featuredProjects() {
  return projects()
    .filter(project => getYear(project) === state.year && project.featured)
    .slice()
    .sort((a, b) => getTitle(a).localeCompare(getTitle(b)));
}

function setupYears() {
  els.yearSelect.innerHTML = getYears().map(year => {
    return `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`;
  }).join("");
  els.yearSelect.value = state.year;
}

function setupStudents() {
  const students = uniqueSorted(projects()
    .filter(project => getYear(project) === state.year)
    .map(project => project.studentDisplayName));

  els.studentSelect.innerHTML = `<option value="">All students</option>` + students.map(student => {
    return `<option value="${escapeHtml(student)}">${escapeHtml(student)}</option>`;
  }).join("");

  if (students.includes(state.student)) {
    els.studentSelect.value = state.student;
  } else {
    state.student = "";
  }
}

function setupFilterButtons() {
  els.filterButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.filter === state.filter);
  });
}

function setupStatsButton() {
  if (!els.statsButton) return;
  const active = state.mode === "stats";
  els.statsButton.classList.toggle("active", active);
  els.statsButton.setAttribute("aria-pressed", String(active));
  els.statsButton.textContent = active ? "Back to Gallery" : "Pathway Stats";
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
    project.featured ? "featured" : ""
  ].map(normalize).join(" ");

  if (search && !haystack.includes(search)) return false;
  if (state.student && project.studentDisplayName !== state.student) return false;

  const type = normalize(project.projectType);

  if (state.filter === "game" && !type.includes("game")) return false;
  if (state.filter === "website" && !type.includes("web")) return false;
  if (state.filter === "other" && (type.includes("game") || type.includes("web"))) return false;

  return true;
}

function filteredProjects() {
  const defaultBrowse = state.mode === "gallery" && !state.student && !state.search && state.filter === "all";

  return projects()
    .filter(matches)
    .slice()
    .sort((a, b) => {
      if (defaultBrowse && a.featured !== b.featured) return a.featured ? 1 : -1;

      const nameCompare = String(a.studentDisplayName || "").localeCompare(String(b.studentDisplayName || ""));
      if (nameCompare !== 0) return nameCompare;
      return getTitle(a).localeCompare(getTitle(b));
    });
}

function render() {
  document.body.classList.toggle("stats-view", state.mode === "stats");
  setupYears();
  setupStudents();
  setupFilterButtons();
  setupStatsButton();
  renderFeaturedCarousel();
  renderCards();
}

function getProjectsPerPage() {
  const width = window.innerWidth;
  const gridHeight = els.projectGrid ? els.projectGrid.getBoundingClientRect().height : 0;

  let columns = 1;

  if (width > 1800) columns = 5;
  else if (width > 1300) columns = 4;
  else if (width > 900) columns = 3;

  if (width <= 900) {
    if (els.projectGrid) els.projectGrid.style.removeProperty("--gallery-rows");
    return 12;
  }

  const rowsFromHeight = gridHeight > 0
    ? Math.floor((gridHeight + CARD_GRID_GAP) / (ESTIMATED_CARD_HEIGHT + CARD_GRID_GAP))
    : 3;

  const rows = Math.max(2, Math.min(MAX_PROJECT_ROWS, rowsFromHeight));
  if (els.projectGrid) {
    els.projectGrid.style.setProperty("--gallery-rows", String(rows));
    els.projectGrid.style.setProperty("--gallery-columns", String(columns));
  }

  return columns * rows;
}

function circularIndex(index, total) {
  return ((index % total) + total) % total;
}

function projectGalleryName(project) {
  const type = normalize(project.projectType);
  if (type.includes("web")) return "Website Gallery";
  if (type.includes("game")) return "Game Arcade";
  return "Creative Coding Lab";
}

function neutralProjectNote(project) {
  const explicit = String(project.description || "").trim();
  if (explicit) return explicit;

  const type = normalize(project.projectType);
  if (type.includes("web")) return "A student-created website from the web design portion of the Software Engineering pathway.";
  if (type.includes("game")) return "A student-created CodeHS game from the game development portion of the Software Engineering pathway.";
  return "A student-created creative coding project from the Software Engineering pathway.";
}

function renderFeaturedCarousel() {
  const list = featuredProjects();

  if (!els.featuredShowcase || !els.featuredTrack) return;

  const spotlightMain = document.getElementById("spotlightMain");
  const spotlightLabel = document.getElementById("spotlightLabel");

  if (state.mode === "stats" || list.length === 0) {
    els.featuredShowcase.hidden = true;
    stopFeaturedTimer();
    return;
  }

  els.featuredShowcase.hidden = false;

  if (!Number.isFinite(state.featuredIndex)) state.featuredIndex = 0;
  state.featuredIndex = circularIndex(state.featuredIndex, list.length);

  const project = list[state.featuredIndex];
  const galleryName = projectGalleryName(project);
  const note = neutralProjectNote(project);

  if (spotlightMain) {
    spotlightMain.innerHTML = `
      <p class="spotlight-kicker">${escapeHtml(galleryName)}</p>
      <h3>${escapeHtml(getTitle(project))}</h3>
      <p class="spotlight-student">${escapeHtml(project.studentDisplayName || "Student")} · ${escapeHtml(project.projectType || "Project")}</p>
      <div class="spotlight-meta">
        ${project.classCode ? `<span>${escapeHtml(project.classCode)}</span>` : ""}
        ${project.gradeLabelAtSubmission ? `<span>${escapeHtml(project.gradeLabelAtSubmission)}</span>` : ""}
        <span>${escapeHtml(getYear(project))}</span>
      </div>
      <button type="button" class="spotlight-open">Open Project →</button>
    `;

    const openButton = spotlightMain.querySelector(".spotlight-open");
    if (openButton) openButton.addEventListener("click", () => openViewer(project));

    spotlightMain.onclick = event => {
      if (event.target.closest("button")) return;
      openViewer(project);
    };
  }

  if (spotlightLabel) {
    spotlightLabel.innerHTML = `
      <p class="wall-label-kicker">Wall Label</p>
      <h3>${escapeHtml(getTitle(project))}</h3>
      <dl>
        <div><dt>Student</dt><dd>${escapeHtml(project.studentDisplayName || "Student")}</dd></div>
        <div><dt>Gallery</dt><dd>${escapeHtml(galleryName)}</dd></div>
        <div><dt>Course</dt><dd>${escapeHtml(project.className || "Software Engineering")}</dd></div>
      </dl>
      <p class="wall-label-note">${escapeHtml(note)}</p>
    `;
  }

  const thumbnailCount = Math.min(6, list.length);
  const thumbnails = Array.from({ length: thumbnailCount }, (_, offset) => {
    const originalIndex = circularIndex(state.featuredIndex + offset, list.length);
    return { project: list[originalIndex], originalIndex };
  });

  els.featuredTrack.innerHTML = thumbnails.map(item => {
    const active = item.originalIndex === state.featuredIndex ? " active" : "";
    return `
      <button type="button" class="spotlight-thumb${active}" data-featured-original-index="${item.originalIndex}">
        <strong>${escapeHtml(getTitle(item.project))}</strong>
        <span>${escapeHtml(item.project.studentDisplayName || "Student")}</span>
      </button>
    `;
  }).join("");

  els.featuredTrack.querySelectorAll("[data-featured-original-index]").forEach(button => {
    button.addEventListener("click", () => {
      state.featuredIndex = Number(button.dataset.featuredOriginalIndex);
      renderFeaturedCarousel();
    });
  });

  updateFeaturedPosition(list.length);
  startFeaturedTimer();
}

function scrollFeaturedToIndex(index, behavior = "smooth") {
  // Museum spotlight mode does not use track scrolling.
}

function updateFeaturedPosition(total) {
  if (els.featuredPosition) {
    els.featuredPosition.textContent = `${state.featuredIndex + 1} of ${total}`;
  }
}

function advanceFeatured(step) {
  const list = featuredProjects();
  if (list.length === 0) return;
  state.featuredIndex = circularIndex(state.featuredIndex + step, list.length);
  renderFeaturedCarousel();
}


function startFeaturedTimer() {
  stopFeaturedTimer();
  state.featuredTimer = window.setInterval(() => {
    if (state.mode === "gallery" && !state.activeProject && !state.featuredAnimating) {
      advanceFeatured(1);
    }
  }, FEATURED_INTERVAL_MS);
}

function stopFeaturedTimer() {
  if (state.featuredTimer) window.clearInterval(state.featuredTimer);
  state.featuredTimer = null;
}

function renderCards() {
  if (state.mode === "stats") {
    renderPathwayStats();
    return;
  }

  if (els.pager) els.pager.hidden = false;
  els.projectGrid.classList.remove("stats-mode");

  const list = filteredProjects();
  const projectsPerPage = getProjectsPerPage();
  const totalPages = Math.max(1, Math.ceil(list.length / projectsPerPage));

  if (state.page > totalPages) state.page = totalPages;
  if (state.page < 1) state.page = 1;

  const start = (state.page - 1) * projectsPerPage;
  const visible = list.slice(start, start + projectsPerPage);

  const word = list.length === 1 ? "project" : "projects";
  els.projectCount.textContent = `${list.length} ${word}`;
  els.pageLabel.textContent = `Page ${state.page} of ${totalPages}`;
  els.prevButton.disabled = state.page <= 1;
  els.nextButton.disabled = state.page >= totalPages;

  updateHeading();

  if (visible.length === 0) {
    els.projectGrid.innerHTML = `<div class="empty">No projects match this search. Press Reset to return to the full gallery.</div>`;
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

function updateHeading() {
  if (state.mode === "stats") {
    els.modeLabel.textContent = "Pathway Impact";
    els.galleryTitle.textContent = "Time Spent Coding Across the Software Engineering Pathway";
    return;
  }

  if (state.student) {
    els.modeLabel.textContent = "Selected Student";
    els.galleryTitle.textContent = `${state.student}'s Projects`;
    return;
  }

  if (state.search) {
    els.modeLabel.textContent = "Search Results";
    els.galleryTitle.textContent = "Matching Student Projects";
    return;
  }

  if (state.filter === "game") {
    els.modeLabel.textContent = "Games";
    els.galleryTitle.textContent = "Student Game Projects";
    return;
  }

  if (state.filter === "website") {
    els.modeLabel.textContent = "Websites";
    els.galleryTitle.textContent = "Student Website Projects";
    return;
  }

  if (state.filter === "other") {
    els.modeLabel.textContent = "Other Projects";
    els.galleryTitle.textContent = "Miscellaneous Student Projects";
    return;
  }

  els.modeLabel.textContent = "Gallery";
  els.galleryTitle.textContent = "Student Project Gallery";
}

function projectCard(project) {
  const index = projects().indexOf(project);
  const type = project.projectType || "Project";
  const isWebsite = normalize(type).includes("web");
  const classes = ["card"];
  if (isWebsite) classes.push("website");
  if (project.featured) classes.push("featured");

  const description = project.description || "A student-created project submitted for the GOGA Software Engineering Showcase.";

  return `
    <article class="${classes.join(" ")}" data-project-index="${index}" role="button" tabindex="0" aria-label="View ${escapeHtml(getTitle(project))} by ${escapeHtml(project.studentDisplayName || "Student")}">
      <h3>${escapeHtml(getTitle(project))}</h3>
      <p class="student">${escapeHtml(project.studentDisplayName || "Student")}</p>
      <p class="project-description">${escapeHtml(description)}</p>

      <div class="card-bottom">
        <div class="badges">
          <span class="badge">${escapeHtml(type)}</span>
          <span class="badge">${escapeHtml(getYear(project))}</span>
          ${project.classCode ? `<span class="badge">${escapeHtml(project.classCode)}</span>` : ""}
          ${project.gradeLabelAtSubmission ? `<span class="badge">${escapeHtml(project.gradeLabelAtSubmission)}</span>` : ""}
          ${project.featured ? `<span class="badge featured-badge">Featured</span>` : ""}
        </div>

        <span class="card-open-cue" aria-hidden="true">Open Project →</span>
      </div>
    </article>
  `;
}

function renderPathwayStats() {
  const stats = window.GOGA_PATHWAY_STATS;
  updateHeading();

  if (els.pager) els.pager.hidden = true;
  els.projectGrid.classList.add("stats-mode");

  if (!stats || !stats.totals) {
    els.projectCount.textContent = "No stats";
    els.projectGrid.innerHTML = `<div class="empty">Pathway statistics are not available yet.</div>`;
    return;
  }

  const courses = Array.isArray(stats.courses) ? stats.courses : [];
  const maxHours = Math.max(...courses.map(course => Number(course.totalHours) || 0), 1);
  const totals = stats.totals;

  els.projectCount.textContent = `${escapeHtml(stats.year || state.year)} stats`;
  els.pageLabel.textContent = "Pathway Stats";
  els.prevButton.disabled = true;
  els.nextButton.disabled = true;

  const se11 = Array.isArray(stats.aggregateClasses)
    ? stats.aggregateClasses.find(item => item.classCode === "SE11")
    : null;

  const totalHours = totals.totalHoursRounded || Math.round((totals.totalSeconds || 0) / 3600);
  const se11Hours = totals.se11HoursRounded || Math.round((totals.se11Seconds || 0) / 3600);
  const gradeStats = buildGradeStats(courses);
  const pieStyle = buildPieStyle(gradeStats);

  const kpis = [
    {
      value: formatNumber(totalHours),
      label: "Total Hours",
      detail: "Time spent coding across the pathway"
    },
    {
      value: formatNumber(totals.uniqueStudents || 0),
      label: "Students",
      detail: "Unique students represented in CodeHS exports"
    },
    {
      value: formatNumber(se11Hours),
      label: "SE11 Hours",
      detail: "Web Design + Game Development"
    },
    {
      value: formatNumber(totals.courseSections || courses.length),
      label: "Course Sections",
      detail: "AP CSP, Web Design, Game Design, AP CSA"
    }
  ];

  els.projectGrid.innerHTML = `
    <section class="stats-dashboard" aria-label="Software engineering pathway statistics">
      <div class="stats-hero">
        <div>
          <p class="stats-kicker">Gateway Tech Software Engineering</p>
          <h3>Students have logged ${formatNumber(totalHours)} hours of time spent coding.</h3>
          <p>These totals come from CodeHS activity across AP Computer Science Principles, Web Design, Game Development, and AP Computer Science A.</p>
        </div>
        <div class="stats-year-pill">${escapeHtml(stats.year || state.year)}</div>
      </div>

      <div class="stats-kpi-grid">
        ${kpis.map(kpi => `
          <article class="stats-kpi">
            <strong>${escapeHtml(kpi.value)}</strong>
            <span>${escapeHtml(kpi.label)}</span>
            <p>${escapeHtml(kpi.detail)}</p>
          </article>
        `).join("")}
      </div>

      <div class="stats-content-grid">
        <div class="stats-bars-card">
          <div class="stats-section-heading">
            <span>Course Breakdown</span>
            <strong>Time Spent Coding</strong>
          </div>
          <div class="stats-bars">
            ${courses.map(course => {
              const hours = Number(course.totalHours) || 0;
              const width = Math.max(8, Math.round((hours / maxHours) * 100));
              return `
                <div class="stats-bar-row">
                  <div class="stats-bar-label">
                    <strong>${escapeHtml(course.displayName || course.className)}</strong>
                    <span>${escapeHtml(course.gradeLabel || "")} · ${formatNumber(course.studentCount || 0)} students</span>
                  </div>
                  <div class="stats-bar-track" aria-hidden="true">
                    <div class="stats-bar-fill" style="--bar-width: ${width}%"></div>
                  </div>
                  <div class="stats-bar-value">${formatNumber(Math.round(hours))} hrs</div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <div class="stats-grade-card">
          <div class="stats-section-heading">
            <span>Grade-Level Share</span>
            <strong>Hours by Grade</strong>
          </div>
          <div class="stats-pie-wrap">
            <div class="stats-pie" style="${escapeHtml(pieStyle)}" aria-hidden="true"></div>
            <div class="stats-pie-legend">
              ${gradeStats.map(item => `
                <div class="stats-pie-legend-row">
                  <span class="stats-pie-key" style="--key-color: ${escapeHtml(item.color)}"></span>
                  <strong>${escapeHtml(item.label)}</strong>
                  <em>${formatNumber(Math.round(item.hours))} hrs</em>
                </div>
              `).join("")}
            </div>
          </div>
        </div>

        <div class="stats-note-card">
          <div class="stats-section-heading">
            <span>Pathway Context</span>
            <strong>Three-Year Sequence</strong>
          </div>
          <ul>
            <li><strong>SE10:</strong> AP Computer Science Principles introduces foundational computing and programming for sophomores.</li>
            <li><strong>SE11:</strong> Web Design and Game Development combines first-semester web projects with second-semester games.</li>
            <li><strong>SE12:</strong> AP Computer Science A focuses on Java and object-oriented programming.</li>
          </ul>
          ${se11 ? `<p class="stats-callout">SE11 alone accounts for <strong>${formatNumber(se11.totalHoursRounded || Math.round(se11.totalHours || 0))} hours</strong> of time spent coding across web and game development.</p>` : ""}
        </div>
      </div>
    </section>
  `;
}

function buildGradeStats(courses) {
  const byGrade = new Map();

  courses.forEach(course => {
    const label = course.gradeLabel || "Other";
    const seconds = Number(course.totalSeconds) || 0;
    const existing = byGrade.get(label) || 0;
    byGrade.set(label, existing + seconds);
  });

  const colors = {
    Sophomore: "var(--red)",
    Junior: "#7a1f24",
    Senior: "#666666",
    Other: "#999999"
  };

  return [...byGrade.entries()]
    .map(([label, seconds]) => ({
      label,
      seconds,
      hours: seconds / 3600,
      color: colors[label] || colors.Other
    }))
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

function isCodeHsProject(url) {
  try {
    return new URL(String(url || "").trim()).hostname.toLowerCase().includes("codehs.com");
  } catch {
    return String(url || "").toLowerCase().includes("codehs.com");
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
        html, body {
          width: 100%;
          height: 100%;
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #111111;
          color: #ffffff;
        }

        body {
          display: grid;
          place-items: center;
          padding: 24px;
          box-sizing: border-box;
        }

        .launch-card {
          width: min(760px, 92vw);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(237, 28, 36, 0.22), rgba(255, 255, 255, 0.06));
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.45);
          padding: 34px;
          text-align: center;
        }

        .kicker {
          margin: 0 0 10px;
          color: #ff5a62;
          font-size: 0.85rem;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(2rem, 5vw, 3.4rem);
          line-height: 0.98;
          letter-spacing: -0.05em;
        }

        .student {
          margin: 14px 0 0;
          color: rgba(255, 255, 255, 0.78);
          font-size: 1.15rem;
          font-weight: 800;
        }

        .note {
          max-width: 580px;
          margin: 24px auto 28px;
          color: rgba(255, 255, 255, 0.72);
          font-size: 1.05rem;
          line-height: 1.45;
        }

        a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          border-radius: 999px;
          background: #ed1c24;
          color: #ffffff;
          padding: 0 26px;
          font-size: 1.05rem;
          font-weight: 950;
          text-decoration: none;
        }

        a:hover,
        a:focus {
          background: #ff5a62;
          outline: none;
        }
      </style>
    </head>
    <body>
      <main class="launch-card">
        <p class="kicker">CodeHS Project</p>
        <h1>${title}</h1>
        <p class="student">${student} · ${type}</p>
        <p class="note">This CodeHS project opens best in its own browser tab. Click below to launch the student project directly in CodeHS. Please close the tab when you are done.</p>
        <a href="${safeLink}" target="_blank" rel="noopener noreferrer">Open CodeHS Project →</a>
      </main>
    </body>
    </html>
  `;
}

function closeProjectViewer() {
  els.viewer.classList.remove("open");
  els.viewer.setAttribute("aria-hidden", "true");
  els.projectFrame.removeAttribute("src");
  els.projectFrame.removeAttribute("srcdoc");
  els.viewerNote.hidden = true;
  state.activeProject = null;
}

function getEmbedUrl(url) {
  const cleanUrl = String(url || "").trim();
  if (!cleanUrl) return "";

  try {
    const parsed = new URL(cleanUrl);
    const host = parsed.hostname.toLowerCase();

    // CodeHS share links already have their runnable/public route.
    // Do not append /embed; /share/id/.../run/embed returns Page Not Found.
    if (host.includes("codehs.com")) {
      return parsed.toString();
    }

    return parsed.toString();
  } catch {
    return cleanUrl;
  }
}

function resetAll() {
  state.year = DEFAULT_YEAR;
  state.search = "";
  state.student = "";
  state.filter = DEFAULT_FILTER;
  state.mode = "gallery";
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
  const savedTheme = localStorage.getItem("gogaTheme") || "dark";
  applyTheme(savedTheme);
}

function returnToGallery() {
  state.mode = "gallery";
  state.page = 1;
  render();
}

function bindEvents() {
  if (els.themeToggle) {
    els.themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.contains("dark-mode");
      applyTheme(isDark ? "light" : "dark");
    });
  }

  if (els.statsButton) {
    els.statsButton.addEventListener("click", () => {
      state.mode = state.mode === "stats" ? "gallery" : "stats";
      state.page = 1;
      render();
    });
  }

  if (els.featuredPrev) {
    els.featuredPrev.addEventListener("click", () => advanceFeatured(-1));
  }

  if (els.featuredNext) {
    els.featuredNext.addEventListener("click", () => advanceFeatured(1));
  }

  if (els.featuredTrack) {
    els.featuredTrack.addEventListener("mouseenter", stopFeaturedTimer);
    els.featuredTrack.addEventListener("mouseleave", startFeaturedTimer);
  }

  els.yearSelect.addEventListener("change", () => {
    state.year = els.yearSelect.value;
    state.page = 1;
    state.student = "";
    state.featuredIndex = 0;
    render();
  });

  els.searchInput.addEventListener("input", () => {
    state.search = els.searchInput.value;
    state.page = 1;
    if (state.mode === "stats") state.mode = "gallery";
    renderCards();
    setupStatsButton();
  });

  els.studentSelect.addEventListener("change", () => {
    state.student = els.studentSelect.value;
    state.page = 1;
    if (state.mode === "stats") state.mode = "gallery";
    renderCards();
    setupStatsButton();
  });

  els.filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      state.mode = "gallery";
      state.page = 1;
      setupFilterButtons();
      setupStatsButton();
      renderFeaturedCarousel();
      renderCards();
    });
  });

  els.prevButton.addEventListener("click", () => {
    state.page -= 1;
    renderCards();
  });

  els.nextButton.addEventListener("click", () => {
    state.page += 1;
    renderCards();
  });

  els.resetButton.addEventListener("click", resetAll);
  els.closeViewer.addEventListener("click", closeProjectViewer);

  els.viewer.addEventListener("click", event => {
    if (event.target === els.viewer) closeProjectViewer();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeProjectViewer();
  });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      state.page = 1;
      renderCards();
      renderFeaturedCarousel();
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
