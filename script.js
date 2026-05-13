/* global GOGA_CONFIG, GOGA_PROJECTS */

const DEFAULT_YEAR = (window.GOGA_CONFIG && window.GOGA_CONFIG.defaultYear) || "2026";
const INACTIVITY_LIMIT_MS = (window.GOGA_CONFIG && window.GOGA_CONFIG.inactivityLimitMs) || 300000;
const PROJECTS_PER_PAGE = 12;

const state = {
  year: DEFAULT_YEAR,
  search: "",
  student: "",
  filter: "all",
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
  modeLabel: document.getElementById("modeLabel"),
  galleryTitle: document.getElementById("galleryTitle"),
  viewer: document.getElementById("viewer"),
  closeViewer: document.getElementById("closeViewer"),
  viewerTitle: document.getElementById("viewerTitle"),
  viewerStudent: document.getElementById("viewerStudent"),
  projectFrame: document.getElementById("projectFrame"),
  viewerNote: document.getElementById("viewerNote")
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

function matches(project) {
  if (getYear(project) !== state.year) return false;

  const search = normalize(state.search);
  const haystack = [
    project.studentDisplayName,
    getTitle(project),
    project.projectType,
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
  renderCards();
}

function renderCards() {
  const list = filteredProjects();
  const totalPages = Math.max(1, Math.ceil(list.length / PROJECTS_PER_PAGE));

  if (state.page > totalPages) state.page = totalPages;
  if (state.page < 1) state.page = 1;

  const start = (state.page - 1) * PROJECTS_PER_PAGE;
  const visible = list.slice(start, start + PROJECTS_PER_PAGE);

  const word = list.length === 1 ? "project" : "projects";
  els.projectCount.textContent = `${list.length} ${word}`;
  els.pageLabel.textContent = `Page ${state.page} of ${totalPages}`;
  els.prevButton.disabled = state.page <= 1;
  els.nextButton.disabled = state.page >= totalPages;

  updateHeading(list.length);

  if (visible.length === 0) {
    els.projectGrid.innerHTML = `<div class="empty">No projects match this search. Press Reset to return to the full gallery.</div>`;
    return;
  }

  els.projectGrid.innerHTML = visible.map(projectCard).join("");
  els.projectGrid.querySelectorAll("[data-project-index]").forEach(button => {
    button.addEventListener("click", () => {
      openViewer(projects()[Number(button.dataset.projectIndex)]);
    });
  });
}

function updateHeading(count) {
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
  if (project.featured) classes.push("featured");

  return `
    <article class="${classes.join(" ")}">
      <h3>${escapeHtml(getTitle(project))}</h3>
      <p class="student">${escapeHtml(project.studentDisplayName || "Student")}</p>
      <div class="badges">
        <span class="badge">${escapeHtml(type)}</span>
        <span class="badge">${escapeHtml(getYear(project))}</span>
        ${project.featured ? `<span class="badge featured-badge">Featured</span>` : ""}
      </div>
      <button type="button" data-project-index="${index}">View Project</button>
    </article>
  `;
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
  state.filter = "all";
  state.page = 1;

  els.searchInput.value = "";
  els.studentSelect.value = "";
  els.yearSelect.value = DEFAULT_YEAR;

  els.filterButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.filter === "all");
  });

  closeProjectViewer();
  render();
}

function bindEvents() {
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

      els.filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

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

bindEvents();
render();
resetInactivityTimer();
