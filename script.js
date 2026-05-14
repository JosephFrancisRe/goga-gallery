/* global GOGA_CONFIG, GOGA_PROJECTS, GOGA_PATHWAY_STATS */

const DEFAULT_YEAR = (window.GOGA_CONFIG && window.GOGA_CONFIG.defaultYear) || "2026";
const DEFAULT_FILTER = (window.GOGA_CONFIG && window.GOGA_CONFIG.defaultFilter) || "all";
const INACTIVITY_LIMIT_MS = (window.GOGA_CONFIG && window.GOGA_CONFIG.inactivityLimitMs) || 300000;
const MAX_PROJECT_ROWS = 3;
const ESTIMATED_CARD_HEIGHT = 136;
const CARD_GRID_GAP = 10;
const FEATURED_INTERVAL_MS = 8500;

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

function renderFeaturedCarousel() {
  const list = featuredProjects();

  if (!els.featuredShowcase || !els.featuredTrack) return;

  if (state.mode === "stats" || list.length === 0) {
    els.featuredShowcase.hidden = true;
    stopFeaturedTimer();
    return;
  }

  els.featuredShowcase.hidden = false;

  const middleBase = list.length > 1 ? list.length * 2 : 0;
  const safeMin = middleBase;
  const safeMax = middleBase + list.length - 1;

  if (list.length > 1) {
    if (!Number.isFinite(state.featuredIndex) || state.featuredIndex < safeMin || state.featuredIndex > safeMax) {
      state.featuredIndex = middleBase;
    }
  } else {
    state.featuredIndex = 0;
  }

  const displayList = list.length > 1 ? [...list, ...list, ...list, ...list, ...list] : list;
  els.featuredTrack.innerHTML = displayList.map((project, displayIndex) => {
    const originalIndex = list.length > 1 ? displayIndex % list.length : displayIndex;
    return featuredCard(project, displayIndex, originalIndex);
  }).join("");

  els.featuredTrack.querySelectorAll("[data-featured-index]").forEach(card => {
    const open = () => {
      if (state.carouselWasDragged) return;
      openViewer(list[Number(card.dataset.featuredOriginalIndex)]);
    };

    card.addEventListener("click", open);
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openViewer(list[Number(card.dataset.featuredOriginalIndex)]);
      }
    });
  });

  setupCarouselGestures();

  requestAnimationFrame(() => scrollFeaturedToIndex(state.featuredIndex, "auto"));
  updateFeaturedPosition(list.length);
  startFeaturedTimer();
}

function featuredCard(project, displayIndex, originalIndex = displayIndex) {
  const type = project.projectType || "Project";
  const description = project.description || "A featured student project from the GOGA Software Engineering Showcase.";
  return `
    <article class="featured-card" data-featured-index="${displayIndex}" data-featured-original-index="${originalIndex}" role="button" tabindex="0" aria-label="View ${escapeHtml(getTitle(project))} by ${escapeHtml(project.studentDisplayName || "Student")}">
      <div class="featured-card-topline">Selected Highlight</div>
      <h3>${escapeHtml(getTitle(project))}</h3>
      <p class="featured-student">${escapeHtml(project.studentDisplayName || "Student")}</p>
      <p class="featured-description">${escapeHtml(description)}</p>
      <div class="featured-card-bottom">
        <div class="featured-badges">
          <span>${escapeHtml(type)}</span>
          ${project.classCode ? `<span>${escapeHtml(project.classCode)}</span>` : ""}
          ${project.gradeLabelAtSubmission ? `<span>${escapeHtml(project.gradeLabelAtSubmission)}</span>` : ""}
        </div>
        <span class="card-open-cue" aria-hidden="true">Open Project →</span>
      </div>
    </article>
  `;
}

function scrollFeaturedToIndex(index, behavior = "smooth") {
  if (!els.featuredTrack) return;
  const card = els.featuredTrack.querySelectorAll(".featured-card")[index];
  if (!card) return;
  els.featuredTrack.scrollTo({ left: card.offsetLeft, behavior });
}

function updateFeaturedPosition(total) {
  if (els.featuredPosition) {
    els.featuredPosition.textContent = `${((state.featuredIndex % total) + total) % total + 1} of ${total}`;
  }
}

function normalizeFeaturedIndex() {
  const list = featuredProjects();
  if (!els.featuredTrack || list.length <= 1) return;

  const cards = [...els.featuredTrack.querySelectorAll(".featured-card")];
  if (cards.length === 0) return;

  let nearestIndex = state.featuredIndex;
  let nearestDistance = Infinity;

  cards.forEach((card, index) => {
    const distance = Math.abs(card.offsetLeft - els.featuredTrack.scrollLeft);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  const normalized = ((nearestIndex % list.length) + list.length) % list.length;
  const middleIndex = list.length * 2 + normalized;

  state.featuredIndex = middleIndex;

  if (nearestIndex < list.length * 2 || nearestIndex >= list.length * 3) {
    scrollFeaturedToIndex(middleIndex, "auto");
  }
}

function advanceFeatured(step) {
  const list = featuredProjects();
  if (list.length === 0) return;

  state.featuredIndex += step;
  scrollFeaturedToIndex(state.featuredIndex);
  updateFeaturedPosition(list.length);
  window.setTimeout(normalizeFeaturedIndex, 520);
}

let featuredGestureReady = false;
let featuredScrollTimer = null;

function setupCarouselGestures() {
  if (!els.featuredTrack || featuredGestureReady) return;
  featuredGestureReady = true;

  let dragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let moved = false;

  const pauseAndNormalize = () => {
    stopFeaturedTimer();
    window.clearTimeout(featuredScrollTimer);
    featuredScrollTimer = window.setTimeout(() => {
      normalizeFeaturedIndex();
      startFeaturedTimer();
    }, 650);
  };

  els.featuredTrack.addEventListener("wheel", event => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      els.featuredTrack.scrollLeft += event.deltaY;
    } else {
      els.featuredTrack.scrollLeft += event.deltaX;
    }
    pauseAndNormalize();
  }, { passive: false });

  els.featuredTrack.addEventListener("pointerdown", event => {
    dragging = true;
    moved = false;
    state.carouselWasDragged = false;
    startX = event.clientX;
    startScrollLeft = els.featuredTrack.scrollLeft;
    els.featuredTrack.classList.add("dragging");
    els.featuredTrack.setPointerCapture(event.pointerId);
    stopFeaturedTimer();
  });

  els.featuredTrack.addEventListener("pointermove", event => {
    if (!dragging) return;
    const dx = event.clientX - startX;
    if (Math.abs(dx) > 5) moved = true;
    els.featuredTrack.scrollLeft = startScrollLeft - dx;
  });

  function endDrag(event) {
    if (!dragging) return;
    dragging = false;
    state.carouselWasDragged = moved;
    els.featuredTrack.classList.remove("dragging");
    try { els.featuredTrack.releasePointerCapture(event.pointerId); } catch {}
    window.setTimeout(() => {
      normalizeFeaturedIndex();
      startFeaturedTimer();
      window.setTimeout(() => { state.carouselWasDragged = false; }, 80);
    }, moved ? 250 : 0);
  }

  els.featuredTrack.addEventListener("pointerup", endDrag);
  els.featuredTrack.addEventListener("pointercancel", endDrag);
  els.featuredTrack.addEventListener("scroll", pauseAndNormalize, { passive: true });
}


function startFeaturedTimer() {
  stopFeaturedTimer();
  state.featuredTimer = window.setInterval(() => {
    if (state.mode === "gallery" && !state.activeProject) advanceFeatured(1);
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
  const cleanUrl = String(url || "").trim();
  if (!cleanUrl) return "";

  try {
    const parsed = new URL(cleanUrl);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("codehs.com") && !parsed.pathname.endsWith("/embed")) {
      parsed.pathname = parsed.pathname.replace(/\/$/, "") + "/embed";
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
