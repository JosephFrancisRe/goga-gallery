/* global GOGA_CONFIG, GOGA_PROJECTS */

const DEFAULT_YEAR = (window.GOGA_CONFIG && window.GOGA_CONFIG.defaultYear) || "2026";
const INACTIVITY_LIMIT_MS = (window.GOGA_CONFIG && window.GOGA_CONFIG.inactivityLimitMs) || 300000;
const PROJECTS_PER_PAGE = 6;

const state = {
  activeYear: DEFAULT_YEAR,
  search: "",
  student: "",
  type: "",
  featuredOnly: false,
  page: 1,
  viewerProject: null,
  inactivityTimer: null
};

const els = {
  yearButtons: document.getElementById("yearButtons"),
  searchInput: document.getElementById("searchInput"),
  studentSelect: document.getElementById("studentSelect"),
  filterButtons: document.querySelectorAll(".filter-button"),
  homeButton: document.getElementById("homeButton"),
  resetButton: document.getElementById("resetButton"),
  featuredRow: document.getElementById("featuredRow"),
  projectGrid: document.getElementById("projectGrid"),
  resultCount: document.getElementById("resultCount"),
  pageLabel: document.getElementById("pageLabel"),
  prevPage: document.getElementById("prevPage"),
  nextPage: document.getElementById("nextPage"),
  modeLabel: document.getElementById("modeLabel"),
  galleryTitle: document.getElementById("galleryTitle"),
  viewerOverlay: document.getElementById("viewerOverlay"),
  viewerClose: document.getElementById("viewerClose"),
  viewerTitle: document.getElementById("viewerTitle"),
  viewerStudent: document.getElementById("viewerStudent"),
  projectFrame: document.getElementById("projectFrame"),
  viewerFallback: document.getElementById("viewerFallback"),
  retryViewer: document.getElementById("retryViewer")
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

function renderYears() {
  els.yearButtons.innerHTML = getYears().map(year => {
    const active = year === state.activeYear ? " active" : "";
    return `<button type="button" class="year-button${active}" data-year="${escapeHtml(year)}">${escapeHtml(year)}</button>`;
  }).join("");

  els.yearButtons.querySelectorAll("[data-year]").forEach(button => {
    button.addEventListener("click", () => {
      state.activeYear = button.dataset.year;
      resetFilters(false);
      render();
    });
  });
}

function populateStudentSelect() {
  const students = uniqueSorted(projects()
    .filter(project => getYear(project) === state.activeYear)
    .map(project => project.studentDisplayName));

  els.studentSelect.innerHTML = `<option value="">All students</option>` + students.map(student => {
    return `<option value="${escapeHtml(student)}">${escapeHtml(student)}</option>`;
  }).join("");

  if (students.includes(state.student)) {
    els.studentSelect.value = state.student;
  }
}

function matches(project) {
  if (getYear(project) !== state.activeYear) return false;

  const search = normalize(state.search);
  const haystack = [
    project.studentDisplayName,
    getTitle(project),
    project.projectType,
    project.featured ? "featured" : ""
  ].map(normalize).join(" ");

  const searchMatches = !search || haystack.includes(search);
  const studentMatches = !state.student || project.studentDisplayName === state.student;
  const typeMatches = !state.type || normalize(project.projectType) === normalize(state.type);
  const featuredMatches = !state.featuredOnly || Boolean(project.featured);

  return searchMatches && studentMatches && typeMatches && featuredMatches;
}

function getFilteredProjects() {
  return projects()
    .filter(matches)
    .slice()
    .sort((a, b) => {
      const studentCompare = String(a.studentDisplayName || "").localeCompare(String(b.studentDisplayName || ""));
      if (studentCompare !== 0) return studentCompare;
      return getTitle(a).localeCompare(getTitle(b));
    });
}

function renderFeaturedRow() {
  const featured = projects()
    .filter(project => getYear(project) === state.activeYear && Boolean(project.featured))
    .slice(0, 3);

  if (featured.length === 0) {
    els.featuredRow.innerHTML = `
      <div class="empty-state">No featured projects have been added yet.</div>
    `;
    return;
  }

  els.featuredRow.innerHTML = featured.map(project => {
    const index = projects().indexOf(project);
    return `
      <article class="feature-mini">
        <div class="feature-title">
          <strong>${escapeHtml(getTitle(project))}</strong>
          <span>${escapeHtml(project.studentDisplayName || "Student")} · ${escapeHtml(project.projectType || "Project")}</span>
        </div>
        <button type="button" data-project-index="${index}">View Featured Project</button>
      </article>
    `;
  }).join("");

  attachViewerButtons(els.featuredRow);
}

function renderProjectGrid() {
  const filtered = getFilteredProjects();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PROJECTS_PER_PAGE));

  if (state.page > totalPages) state.page = totalPages;
  if (state.page < 1) state.page = 1;

  const start = (state.page - 1) * PROJECTS_PER_PAGE;
  const visible = filtered.slice(start, start + PROJECTS_PER_PAGE);

  const projectWord = filtered.length === 1 ? "project" : "projects";
  els.resultCount.textContent = `${filtered.length} ${projectWord}`;
  els.pageLabel.textContent = `Page ${state.page} of ${totalPages}`;
  els.prevPage.disabled = state.page <= 1;
  els.nextPage.disabled = state.page >= totalPages;

  if (state.featuredOnly) {
    els.modeLabel.textContent = "Featured Work";
    els.galleryTitle.textContent = "Featured projects";
  } else if (state.student) {
    els.modeLabel.textContent = "Selected Student";
    els.galleryTitle.textContent = `${state.student}'s projects`;
  } else if (state.type) {
    els.modeLabel.textContent = state.type;
    els.galleryTitle.textContent = `${state.type} projects`;
  } else {
    els.modeLabel.textContent = "Student Gallery";
    els.galleryTitle.textContent = "Select a student project";
  }

  if (visible.length === 0) {
    els.projectGrid.innerHTML = `
      <div class="empty-state">
        No projects match this search. Press Reset to return to the full gallery.
      </div>
    `;
    return;
  }

  els.projectGrid.innerHTML = visible.map(projectCard).join("");
  attachViewerButtons(els.projectGrid);
}

function projectCard(project) {
  const index = projects().indexOf(project);
  const type = project.projectType || "Project";
  const typeClass = normalize(type).includes("web") ? "website" : "game";
  const thumbClasses = ["project-thumb", typeClass];

  if (project.featured) thumbClasses.push("featured");
  if (project.thumbnail) thumbClasses.push("has-image");

  const thumbStyle = project.thumbnail
    ? ` style="background-image: linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.35)), url('${escapeAttribute(project.thumbnail)}');"`
    : "";

  return `
    <article class="project-card">
      <div class="${thumbClasses.join(" ")}"${thumbStyle}>${escapeHtml(type)}</div>
      <div class="project-info">
        <h3>${escapeHtml(getTitle(project))}</h3>
        <p class="student-name">${escapeHtml(project.studentDisplayName || "Student")}</p>
        <div class="badges">
          <span class="badge">${escapeHtml(getYear(project))}</span>
          <span class="badge">${escapeHtml(type)}</span>
          ${project.featured ? `<span class="badge featured">Featured</span>` : ""}
        </div>
        <button class="view-button" type="button" data-project-index="${index}">View Project</button>
      </div>
    </article>
  `;
}

function attachViewerButtons(root) {
  root.querySelectorAll("[data-project-index]").forEach(button => {
    button.addEventListener("click", () => {
      const project = projects()[Number(button.dataset.projectIndex)];
      openViewer(project);
    });
  });
}

function openViewer(project) {
  if (!project) return;

  state.viewerProject = project;
  els.viewerTitle.textContent = getTitle(project);
  els.viewerStudent.textContent = `${project.studentDisplayName || "Student"} · ${project.projectType || "Project"}`;
  els.viewerFallback.hidden = true;

  const link = String(project.projectLink || "").trim();
  if (link) {
    els.projectFrame.src = getEmbedUrl(link);
  } else {
    els.projectFrame.removeAttribute("src");
    els.viewerFallback.hidden = false;
  }

  els.viewerOverlay.classList.add("open");
  els.viewerOverlay.setAttribute("aria-hidden", "false");
  els.viewerClose.focus();
}

function closeViewer() {
  els.viewerOverlay.classList.remove("open");
  els.viewerOverlay.setAttribute("aria-hidden", "true");
  els.projectFrame.removeAttribute("src");
  els.viewerFallback.hidden = true;
  state.viewerProject = null;
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

function setFilterButtonState(clickedButton) {
  els.filterButtons.forEach(button => button.classList.remove("active"));
  clickedButton.classList.add("active");
}

function resetFilters(resetYear = true) {
  if (resetYear) state.activeYear = DEFAULT_YEAR;
  state.search = "";
  state.student = "";
  state.type = "";
  state.featuredOnly = false;
  state.page = 1;

  els.searchInput.value = "";
  els.studentSelect.value = "";

  els.filterButtons.forEach(button => {
    const isAll = !button.dataset.type && !button.dataset.featured;
    button.classList.toggle("active", isAll);
  });
}

function render() {
  renderYears();
  populateStudentSelect();
  renderFeaturedRow();
  renderProjectGrid();
}

function bindEvents() {
  els.searchInput.addEventListener("input", () => {
    state.search = els.searchInput.value;
    state.page = 1;
    renderProjectGrid();
  });

  els.studentSelect.addEventListener("change", () => {
    state.student = els.studentSelect.value;
    state.page = 1;
    renderProjectGrid();
  });

  els.filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      setFilterButtonState(button);
      state.type = button.dataset.type || "";
      state.featuredOnly = button.dataset.featured === "true";
      state.page = 1;
      renderProjectGrid();
    });
  });

  els.prevPage.addEventListener("click", () => {
    state.page -= 1;
    renderProjectGrid();
  });

  els.nextPage.addEventListener("click", () => {
    state.page += 1;
    renderProjectGrid();
  });

  els.homeButton.addEventListener("click", () => {
    resetFilters(true);
    closeViewer();
    render();
  });

  els.resetButton.addEventListener("click", () => {
    resetFilters(true);
    closeViewer();
    render();
  });

  els.viewerClose.addEventListener("click", closeViewer);

  els.viewerOverlay.addEventListener("click", event => {
    if (event.target === els.viewerOverlay) closeViewer();
  });

  els.retryViewer.addEventListener("click", () => {
    if (state.viewerProject) openViewer(state.viewerProject);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeViewer();
  });

  ["click", "keydown", "mousemove", "touchstart"].forEach(eventName => {
    window.addEventListener(eventName, resetInactivityTimer, { passive: true });
  });
}

function resetInactivityTimer() {
  window.clearTimeout(state.inactivityTimer);
  state.inactivityTimer = window.setTimeout(() => {
    resetFilters(true);
    closeViewer();
    render();
  }, INACTIVITY_LIMIT_MS);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'");
}

bindEvents();
render();
resetInactivityTimer();
