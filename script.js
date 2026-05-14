/* global GOGA_CONFIG, GOGA_PROJECTS, GOGA_PATHWAY_STATS */

const DEFAULT_YEAR = (window.GOGA_CONFIG && window.GOGA_CONFIG.defaultYear) || "2026";
const DEFAULT_FILTER = (window.GOGA_CONFIG && window.GOGA_CONFIG.defaultFilter) || "featured";
const INACTIVITY_LIMIT_MS = (window.GOGA_CONFIG && window.GOGA_CONFIG.inactivityLimitMs) || 300000;
const MAX_PROJECT_ROWS = 4;
const ESTIMATED_CARD_HEIGHT = 168;
const CARD_GRID_GAP = 10;

const state = {
  year: DEFAULT_YEAR,
  search: "",
  student: "",
  filter: DEFAULT_FILTER,
  page: 1,
  inactivityTimer: null,
  activeProject: null
};

const els = {
  yearSelect: document.getElementById("yearSelect"),
  searchInput: document.getElementById("searchInput"),
  studentSelect: document.getElementById("studentSelect"),
  filterButtons: document.querySelectorAll(".filter"),
  resetButton: document.getElementById("resetButton"),
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
  return String(project.year || DEFAULT_YEAR);
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

  if (state.filter === "featured" && !project.featured) return false;
  if (state.filter === "game" && !type.includes("game")) return false;
  if (state.filter === "website" && !type.includes("web")) return false;

  return true;
}

function filteredProjects() {
  return projects()
    .filter(matches)
    .slice()
    .sort((a, b) => {
      const nameCompare = String(a.studentDisplayName || "").localeCompare(String(b.studentDisplayName || ""));
      if (nameCompare !== 0) return nameCompare;
      return getTitle(a).localeCompare(getTitle(b));
    });
}

function render() {
  setupYears();
  setupStudents();
  setupFilterButtons();
  renderCards();
}


function getProjectsPerPage() {
  const width = window.innerWidth;
  const gridHeight = els.projectGrid ? els.projectGrid.getBoundingClientRect().height : 0;

  let columns = 1;

  if (width > 1300) {
    columns = 4;
  } else if (width > 900) {
    columns = 3;
  }

  if (width <= 900) {
    return 12;
  }

  const rowsFromHeight = gridHeight > 0
    ? Math.floor((gridHeight + CARD_GRID_GAP) / (ESTIMATED_CARD_HEIGHT + CARD_GRID_GAP))
    : 3;

  const rows = Math.max(2, Math.min(MAX_PROJECT_ROWS, rowsFromHeight));

  return columns * rows;
}

function renderCards() {
  if (state.filter === "stats") {
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
    els.projectGrid.innerHTML = `<div class="empty">No projects match this search. Press Reset to return to the featured gallery.</div>`;
    return;
  }

  els.projectGrid.innerHTML = visible.map(projectCard).join("");
  els.projectGrid.querySelectorAll("[data-project-index]").forEach(button => {
    button.addEventListener("click", () => {
      openViewer(projects()[Number(button.dataset.projectIndex)]);
    });
  });
}

function updateHeading() {
  if (state.filter === "stats") {
    els.modeLabel.textContent = "Pathway Impact";
    els.galleryTitle.textContent = "Time Spent Coding Across the Software Engineering Pathway";
    return;
  }

  if (state.student) {
    els.modeLabel.textContent = "Selected Student";
    els.galleryTitle.textContent = `${state.student}'s Projects`;
    return;
  }

  if (state.filter === "featured") {
    els.modeLabel.textContent = "Featured Work";
    els.galleryTitle.textContent = "Featured Student Projects";
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

  els.modeLabel.textContent = "All Projects";
  els.galleryTitle.textContent = "Student Project Gallery";
}

function projectCard(project) {
  const index = projects().indexOf(project);
  const type = project.projectType || "Project";
  const isWebsite = normalize(type).includes("web");
  const classes = ["card"];
  if (isWebsite) classes.push("website");
  if (project.featured && state.filter !== "featured") classes.push("featured");

  const description = project.description || "A student-created website submitted for the GOGA Software Engineering Showcase.";

  return `
    <article class="${classes.join(" ")}">
      <h3>${escapeHtml(getTitle(project))}</h3>
      <p class="student">${escapeHtml(project.studentDisplayName || "Student")}</p>
      <p class="project-description">${escapeHtml(description)}</p>
      <div class="badges">
        <span class="badge">${escapeHtml(type)}</span>
        <span class="badge">${escapeHtml(getYear(project))}</span>
        ${project.classCode ? `<span class="badge">${escapeHtml(project.classCode)}</span>` : ""}
        ${project.gradeLabelAtSubmission ? `<span class="badge">${escapeHtml(project.gradeLabelAtSubmission)}</span>` : ""}
        ${project.featured && state.filter !== "featured" ? `<span class="badge featured-badge">Featured</span>` : ""}
      </div>
      <button type="button" data-project-index="${index}">View Project</button>
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

  const kpis = [
    {
      value: formatNumber(totals.totalHoursRounded || Math.round((totals.totalSeconds || 0) / 3600)),
      label: "Total Hours",
      detail: "Time spent coding across the pathway"
    },
    {
      value: formatNumber(totals.uniqueStudents || 0),
      label: "Students",
      detail: "Unique students represented in CodeHS exports"
    },
    {
      value: formatNumber(totals.se11HoursRounded || Math.round((totals.se11Seconds || 0) / 3600)),
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
          <h3>Students have logged ${formatNumber(totals.totalHoursRounded || Math.round((totals.totalSeconds || 0) / 3600))} hours of time spent coding.</h3>
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

        <div class="stats-note-card">
          <div class="stats-section-heading">
            <span>Pathway Context</span>
            <strong>Three-Year Sequence</strong>
          </div>
          <ul>
            <li><strong>SE10:</strong> AP Computer Science Principles introduces foundational computing and programming.</li>
            <li><strong>SE11:</strong> Web Design and Game Development combines first-semester web projects with second-semester games.</li>
            <li><strong>SE12:</strong> AP Computer Science A focuses on Java and object-oriented programming.</li>
          </ul>
          ${se11 ? `<p class="stats-callout">SE11 alone accounts for <strong>${formatNumber(se11.totalHoursRounded || Math.round(se11.totalHours || 0))} hours</strong> of time spent coding across web and game development.</p>` : ""}
        </div>
      </div>
    </section>
  `;
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
  if (link) {
    els.projectFrame.src = getEmbedUrl(link);
  } else {
    els.projectFrame.removeAttribute("src");
    els.viewerNote.hidden = false;
  }

  els.viewer.classList.add("open");
  els.viewer.setAttribute("aria-hidden", "false");
  els.closeViewer.focus();
}

function closeProjectViewer() {
  els.viewer.classList.remove("open");
  els.viewer.setAttribute("aria-hidden", "true");
  els.projectFrame.removeAttribute("src");
  els.viewerNote.hidden = true;
  state.activeProject = null;
}

function getEmbedUrl(url) {
  const clean = String(url || "").trim();
  if (!clean) return "";

  try {
    const parsed = new URL(clean);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("codehs.com") && !parsed.pathname.endsWith("/embed")) {
      parsed.pathname = parsed.pathname.replace(/\/$/, "") + "/embed";
      return parsed.toString();
    }

    return parsed.toString();
  } catch {
    return clean;
  }
}

function resetAll() {
  state.year = DEFAULT_YEAR;
  state.search = "";
  state.student = "";
  state.filter = DEFAULT_FILTER;
  state.page = 1;

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

function bindEvents() {
  if (els.themeToggle) {
    els.themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.contains("dark-mode");
      applyTheme(isDark ? "light" : "dark");
    });
  }

  els.yearSelect.addEventListener("change", () => {
    state.year = els.yearSelect.value;
    state.page = 1;
    state.student = "";
    render();
  });

  els.searchInput.addEventListener("input", () => {
    state.search = els.searchInput.value;
    state.page = 1;
    renderCards();
  });

  els.studentSelect.addEventListener("change", () => {
    state.student = els.studentSelect.value;
    state.page = 1;
    renderCards();
  });

  els.filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      state.page = 1;
      setupFilterButtons();
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
