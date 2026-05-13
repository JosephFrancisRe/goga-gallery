/* global GOGA_CONFIG, GOGA_PROJECTS */

const DEFAULT_YEAR = (window.GOGA_CONFIG && window.GOGA_CONFIG.defaultYear) || "2026";
const INACTIVITY_LIMIT_MS = (window.GOGA_CONFIG && window.GOGA_CONFIG.inactivityLimitMs) || 300000;

const state = {
  activeYear: DEFAULT_YEAR,
  search: "",
  student: "",
  type: "",
  viewerProject: null,
  inactivityTimer: null
};

const els = {
  activeYearLabel: document.getElementById("activeYearLabel"),
  yearControls: document.getElementById("yearControls"),
  featuredGrid: document.getElementById("featuredGrid"),
  projectGrid: document.getElementById("projectGrid"),
  searchInput: document.getElementById("searchInput"),
  studentSelect: document.getElementById("studentSelect"),
  typeSelect: document.getElementById("typeSelect"),
  resultsSummary: document.getElementById("resultsSummary"),
  backHomeButton: document.getElementById("backHomeButton"),
  resetGalleryButton: document.getElementById("resetGalleryButton"),
  resetGalleryTop: document.getElementById("resetGalleryTop"),
  viewerOverlay: document.getElementById("viewerOverlay"),
  viewerClose: document.getElementById("viewerClose"),
  viewerTitle: document.getElementById("viewerTitle"),
  viewerStudent: document.getElementById("viewerStudent"),
  projectFrame: document.getElementById("projectFrame"),
  viewerMessage: document.getElementById("viewerMessage"),
  retryViewerButton: document.getElementById("retryViewerButton")
};

function projects() {
  return Array.isArray(window.GOGA_PROJECTS) ? window.GOGA_PROJECTS : [];
}

function getProjectYear(project) {
  return String(project.year || DEFAULT_YEAR);
}

function getProjectTitle(project) {
  const rawTitle = (project.projectTitle || "").trim();
  if (rawTitle) return rawTitle;

  const type = (project.projectType || "Project").trim();
  if (type.toLowerCase().includes("game")) return "Student Game Project";
  if (type.toLowerCase().includes("web")) return "Student Website Project";
  return "Student Digital Project";
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function projectMatches(project) {
  const yearMatches = getProjectYear(project) === state.activeYear;
  if (!yearMatches) return false;

  const searchNeedle = normalizeText(state.search);
  const haystack = [
    project.studentDisplayName,
    getProjectTitle(project),
    project.projectType,
    project.featured ? "featured" : ""
  ].map(normalizeText).join(" ");

  const searchMatches = !searchNeedle || haystack.includes(searchNeedle);
  const studentMatches = !state.student || project.studentDisplayName === state.student;
  const typeMatches = !state.type || project.projectType === state.type;

  return searchMatches && studentMatches && typeMatches;
}

function getAvailableYears() {
  const years = uniqueSorted(projects().map(getProjectYear));
  if (!years.includes(DEFAULT_YEAR)) years.unshift(DEFAULT_YEAR);
  return years.sort((a, b) => Number(b) - Number(a));
}

function renderYearControls() {
  const years = getAvailableYears();

  els.yearControls.innerHTML = years.map((year) => {
    const activeClass = year === state.activeYear ? " active" : "";
    const current = year === state.activeYear ? " aria-current=\"true\"" : "";
    return `<button class="year-button${activeClass}" type="button" data-year="${escapeHtml(year)}"${current}>${escapeHtml(year)}</button>`;
  }).join("");

  els.activeYearLabel.textContent = state.activeYear;

  els.yearControls.querySelectorAll("[data-year]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeYear = button.dataset.year;
      resetFiltersOnly();
      renderAll();
      scrollToSection("gallery");
    });
  });
}

function populateFilters() {
  const yearProjects = projects().filter((project) => getProjectYear(project) === state.activeYear);
  const students = uniqueSorted(yearProjects.map((project) => project.studentDisplayName));
  const types = uniqueSorted(yearProjects.map((project) => project.projectType));

  const currentStudent = state.student;
  const currentType = state.type;

  els.studentSelect.innerHTML = `<option value="">All students</option>` + students.map((student) => {
    return `<option value="${escapeHtml(student)}">${escapeHtml(student)}</option>`;
  }).join("");

  els.typeSelect.innerHTML = `<option value="">All project types</option>` + types.map((type) => {
    return `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`;
  }).join("");

  if (students.includes(currentStudent)) els.studentSelect.value = currentStudent;
  if (types.includes(currentType)) els.typeSelect.value = currentType;
}

function renderAll() {
  renderYearControls();
  populateFilters();
  renderFeatured();
  renderGallery();
}

function renderFeatured() {
  const featured = projects()
    .filter((project) => getProjectYear(project) === state.activeYear && Boolean(project.featured))
    .slice()
    .sort((a, b) => getProjectTitle(a).localeCompare(getProjectTitle(b)));

  if (featured.length === 0) {
    els.featuredGrid.innerHTML = `
      <div class="empty-state">
        <strong>No featured projects have been added for ${escapeHtml(state.activeYear)} yet.</strong><br />
        Mark a project with <code>featured: true</code> in <code>students.js</code> to show it here.
      </div>
    `;
    return;
  }

  els.featuredGrid.innerHTML = featured.map((project, index) => projectCard(project, index, true)).join("");
  attachProjectButtons(els.featuredGrid);
}

function renderGallery() {
  const filtered = projects()
    .filter(projectMatches)
    .slice()
    .sort((a, b) => {
      const nameCompare = String(a.studentDisplayName || "").localeCompare(String(b.studentDisplayName || ""));
      if (nameCompare !== 0) return nameCompare;
      return getProjectTitle(a).localeCompare(getProjectTitle(b));
    });

  const totalForYear = projects().filter((project) => getProjectYear(project) === state.activeYear).length;
  const resultWord = filtered.length === 1 ? "project" : "projects";
  els.resultsSummary.textContent = `Showing ${filtered.length} of ${totalForYear} ${state.activeYear} ${resultWord}.`;

  if (filtered.length === 0) {
    els.projectGrid.innerHTML = `
      <div class="empty-state">
        <strong>No projects match the current search.</strong><br />
        Try clearing the search, changing the student dropdown, or selecting all project types.
      </div>
    `;
    return;
  }

  els.projectGrid.innerHTML = filtered.map((project, index) => projectCard(project, index, false)).join("");
  attachProjectButtons(els.projectGrid);
}

function projectCard(project, index, forceFeaturedStyle) {
  const title = getProjectTitle(project);
  const student = project.studentDisplayName || "Student";
  const type = project.projectType || "Project";
  const featured = Boolean(project.featured);
  const cardClasses = ["project-card"];
  if (featured || forceFeaturedStyle) cardClasses.push("featured-card");

  const thumbnailStyle = project.thumbnail
    ? ` style="background-image: linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.42)), url('${escapeAttribute(project.thumbnail)}');"`
    : "";

  const thumbClasses = ["project-thumb", cssSafeType(type)];
  if (featured || forceFeaturedStyle) thumbClasses.push("featured");
  if (project.thumbnail) thumbClasses.push("has-image");

  const projectIndex = projects().indexOf(project);

  return `
    <article class="${cardClasses.join(" ")}">
      <div class="${thumbClasses.join(" ")}"${thumbnailStyle}>
        <span class="project-type-chip">${escapeHtml(type)}</span>
      </div>
      <div class="project-content">
        <h3>${escapeHtml(title)}</h3>
        <p class="project-student">${escapeHtml(student)}</p>
        <div class="project-badges" aria-label="Project labels">
          <span class="badge">${escapeHtml(getProjectYear(project))}</span>
          <span class="badge">${escapeHtml(type)}</span>
          ${featured ? `<span class="badge featured-badge">Featured Work</span>` : ""}
        </div>
        <button class="card-button" type="button" data-project-index="${projectIndex}">View Project</button>
      </div>
    </article>
  `;
}

function cssSafeType(type) {
  const text = normalizeText(type);
  if (text.includes("web")) return "website";
  if (text.includes("game")) return "game";
  return "project";
}

function attachProjectButtons(root) {
  root.querySelectorAll("[data-project-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const project = projects()[Number(button.dataset.projectIndex)];
      openProjectViewer(project);
    });
  });
}

function openProjectViewer(project) {
  if (!project) return;

  state.viewerProject = project;

  els.viewerTitle.textContent = getProjectTitle(project);
  els.viewerStudent.textContent = `${project.studentDisplayName || "Student"} · ${project.projectType || "Project"}`;
  els.viewerMessage.hidden = true;

  const projectUrl = (project.projectLink || "").trim();

  if (!projectUrl) {
    els.projectFrame.removeAttribute("src");
    els.viewerMessage.hidden = false;
  } else {
    els.projectFrame.src = getEmbedUrl(projectUrl);
  }

  els.viewerOverlay.classList.add("open");
  els.viewerOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("viewer-is-open");
  els.viewerClose.focus();

  window.setTimeout(() => {
    if (els.viewerOverlay.classList.contains("open")) {
      els.viewerMessage.hidden = true;
    }
  }, 2500);
}

function closeProjectViewer() {
  els.viewerOverlay.classList.remove("open");
  els.viewerOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("viewer-is-open");
  els.projectFrame.removeAttribute("src");
  state.viewerProject = null;
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

function resetFiltersOnly() {
  state.search = "";
  state.student = "";
  state.type = "";
  els.searchInput.value = "";
  els.studentSelect.value = "";
  els.typeSelect.value = "";
}

function resetGallery() {
  resetFiltersOnly();
  closeProjectViewer();
  state.activeYear = DEFAULT_YEAR;
  renderAll();
  scrollToSection("home");
}

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function bindEvents() {
  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => scrollToSection(button.dataset.scrollTarget));
  });

  els.searchInput.addEventListener("input", () => {
    state.search = els.searchInput.value;
    renderGallery();
  });

  els.studentSelect.addEventListener("change", () => {
    state.student = els.studentSelect.value;
    renderGallery();
  });

  els.typeSelect.addEventListener("change", () => {
    state.type = els.typeSelect.value;
    renderGallery();
  });

  els.backHomeButton.addEventListener("click", () => scrollToSection("home"));
  els.resetGalleryButton.addEventListener("click", resetGallery);
  els.resetGalleryTop.addEventListener("click", resetGallery);

  els.viewerClose.addEventListener("click", closeProjectViewer);

  els.viewerOverlay.addEventListener("click", (event) => {
    if (event.target === els.viewerOverlay) closeProjectViewer();
  });

  els.retryViewerButton.addEventListener("click", () => {
    if (state.viewerProject) openProjectViewer(state.viewerProject);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.viewerOverlay.classList.contains("open")) {
      closeProjectViewer();
    }
  });

  ["click", "keydown", "mousemove", "touchstart", "scroll"].forEach((eventName) => {
    window.addEventListener(eventName, resetInactivityTimer, { passive: true });
  });
}

function resetInactivityTimer() {
  window.clearTimeout(state.inactivityTimer);
  state.inactivityTimer = window.setTimeout(resetGallery, INACTIVITY_LIMIT_MS);
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
renderAll();
resetInactivityTimer();
