/* global GOGA_CONFIG, GOGA_PROJECTS, GOGA_PATHWAY_STATS */

const DEFAULT_YEAR = (window.GOGA_CONFIG && window.GOGA_CONFIG.defaultYear) || "2026";
const DEFAULT_FILTER = (window.GOGA_CONFIG && window.GOGA_CONFIG.defaultFilter) || "all";
const INACTIVITY_LIMIT_MS = (window.GOGA_CONFIG && window.GOGA_CONFIG.inactivityLimitMs) || 300000;
const FEATURED_INTERVAL_MS = 9500;
const CARD_GRID_GAP = 12;
const ESTIMATED_CARD_HEIGHT = 178;

const I18N = {
  en: {
    htmlLang: "en",
    pathwayInfo: "Pathway Info",
    backToExhibit: "Back to Exhibit",
    backToSpotlight: "← Back to Exhibit",
    year: "Year",
    showcaseSubtitle: "Gallery of Gateway Art",
    featuredProjects: "Featured Projects",
    museumSpotlight: "Museum Spotlight Wall",
    browseExhibit: "Browse the Exhibit",
    browseTitle: "Choose a gallery room or find a student.",
    allProjects: "All Projects",
    allProjectsSmall: "The full exhibition",
    websiteGallery: "Website Gallery",
    websiteGallerySmall: "Student sites",
    gameArcade: "Game Arcade",
    gameArcadeSmall: "CodeHS games",
    creativeLab: "Creative Coding Lab",
    creativeLabSmall: "Graphics and experiments",
    search: "Search",
    searchPlaceholder: "Search student or project...",
    student: "Student",
    allStudents: "All students",
    reset: "Reset",
    designedBy: "Designed by Mr. Re",
    footerHint: "Tap a project to view it. CodeHS projects open in a new tab.",
    dark: "Dark",
    light: "Light",
    wallLabel: "Project Info",
    gallery: "Gallery",
    course: "Course",
    openProject: "Open Project →",
    galleryRoom: "Gallery Room",
    searchResults: "Search Results",
    matchingProjects: "Matching Student Projects",
    selectedStudent: "Selected Student",
    studentProjects: "{student}'s Projects",
    noProjectsTitle: "No projects match this view.",
    noProjectsBody: "Try another gallery room, clear the search, or select a different student.",
    project: "project",
    projects: "projects",
    pageOf: "Page {page} of {total}",
    previous: "Previous",
    next: "Next",
    viewerTitle: "This project could not be displayed inside the gallery.",
    viewerBody: "This project may need to open in a separate browser tab.",
    codeHsKicker: "CodeHS Project",
    codeHsNote: "This CodeHS project opens best in its own browser tab. Click below to launch the student project directly in CodeHS.",
    openCodeHs: "Open CodeHS Project →",
    statsKicker: "Pathway Impact",
    statsTitle: "Inside the Software Engineering Pathway",
    codeHsData: "CodeHS data",
    didYouKnow: "Did You Know?",
    aiHeadline: "Gateway Tech is adding Foundations of Artificial Intelligence.",
    aiBody: "This new junior-year Software Engineering course uses Python to explore data science, statistics, linear algebra, machine learning, and AI.",
    totalHours: "Total Coding Hours",
    studentsRepresented: "Lines of Code",
    avgPerStudent: "Avg Per Student",
    linesUnit: "lines",
    aiSequenceCode: "SE11 (Beginning 2026-2027)",
    timeByCourse: "Time Spent Coding by Course",
    hoursByGrade: "Coding Hours by Grade",
    pathwaySequence: "Pathway Sequence",
    behindNumbers: "Behind the Numbers",
    behindText: "SE10 meets once per day; SE11 and SE12 meet twice per day. Total coding hours reflect both student work and available class time.",
    sophomore: "Sophomore",
    junior: "Junior",
    senior: "Senior",
    hrs: "hrs",
    students: "students",
    websiteNote: "A student-created website submitted during the Web Design portion of the Software Engineering pathway. It is presented here as a snapshot of student work from this course.",
    gameNote: "A student-created {assignment}game submitted during the Game Development portion of the Software Engineering pathway. CodeHS games open best in a separate tab.",
    otherNote: "A student-created creative coding project submitted during the Software Engineering pathway. This project uses graphics, animation, or drawing commands.",
    se10Text: "AP Computer Science Principles introduces foundational computing and programming.",
    se11Text: "Web Design and Game Development emphasizes websites, games, and interactive projects.",
    aiText: "Foundations of Artificial Intelligence adds Python-based data science, statistics, linear algebra, machine learning, and AI.",
    se12Text: "AP Computer Science A focuses on Java and object-oriented programming."
  },
  es: {
    htmlLang: "es",
    pathwayInfo: "Info del Programa",
    backToExhibit: "Volver a la Exhibición",
    backToSpotlight: "← Volver a la Exhibición",
    year: "Año",
    showcaseSubtitle: "Gallery of Gateway Art",
    featuredProjects: "Proyectos Destacados",
    museumSpotlight: "Muro Destacado del Museo",
    browseExhibit: "Explorar la Exhibición",
    browseTitle: "Elige una sala o busca a un estudiante.",
    allProjects: "Todos",
    allProjectsSmall: "Toda la exhibición",
    websiteGallery: "Galería Web",
    websiteGallerySmall: "Sitios de estudiantes",
    gameArcade: "Sala de Juegos",
    gameArcadeSmall: "Juegos de CodeHS",
    creativeLab: "Laboratorio Creativo",
    creativeLabSmall: "Gráficos y experimentos",
    search: "Buscar",
    searchPlaceholder: "Buscar estudiante o proyecto...",
    student: "Estudiante",
    allStudents: "Todos los estudiantes",
    reset: "Reiniciar",
    designedBy: "Diseñado por Mr. Re",
    footerHint: "Toca un proyecto para verlo. CodeHS abre en una pestaña nueva.",
    dark: "Oscuro",
    light: "Claro",
    wallLabel: "Información del Proyecto",
    gallery: "Galería",
    course: "Curso",
    openProject: "Abrir Proyecto →",
    galleryRoom: "Sala de Galería",
    searchResults: "Resultados",
    matchingProjects: "Proyectos Encontrados",
    selectedStudent: "Estudiante Seleccionado",
    studentProjects: "Proyectos de {student}",
    noProjectsTitle: "No hay proyectos que coincidan.",
    noProjectsBody: "Prueba otra sala, borra la búsqueda o selecciona otro estudiante.",
    project: "proyecto",
    projects: "proyectos",
    pageOf: "Página {page} de {total}",
    previous: "Anterior",
    next: "Siguiente",
    viewerTitle: "Este proyecto no se pudo mostrar dentro de la galería.",
    viewerBody: "Algunos sitios externos bloquean la vista integrada. Los proyectos de CodeHS funcionan mejor en una pestaña nueva.",
    codeHsKicker: "Proyecto de CodeHS",
    codeHsNote: "Este proyecto de CodeHS funciona mejor en su propia pestaña. Haz clic abajo para abrirlo directamente en CodeHS.",
    openCodeHs: "Abrir Proyecto de CodeHS →",
    statsKicker: "Impacto del Programa",
    statsTitle: "Dentro del Programa de Software Engineering",
    codeHsData: "Datos de CodeHS",
    didYouKnow: "¿Sabías que?",
    aiHeadline: "Gateway Tech está agregando Foundations of Artificial Intelligence.",
    aiBody: "Este nuevo curso de junior usa Python para explorar ciencia de datos, estadística, álgebra lineal, machine learning e inteligencia artificial.",
    totalHours: "Horas Totales de Programación",
    studentsRepresented: "Líneas de Código",
    avgPerStudent: "Promedio por Estudiante",
    linesUnit: "líneas",
    aiSequenceCode: "SE11 (desde 2026-2027)",
    timeByCourse: "Tiempo Programando por Curso",
    hoursByGrade: "Horas por Grado",
    pathwaySequence: "Secuencia del Programa",
    behindNumbers: "Detrás de los Números",
    behindText: "SE10 se reúne una vez al día; SE11 y SE12 se reúnen dos veces. Las horas totales reflejan trabajo estudiantil y tiempo de clase disponible.",
    sophomore: "10.º grado",
    junior: "11.º grado",
    senior: "12.º grado",
    hrs: "hrs",
    students: "estudiantes",
    websiteNote: "Un sitio web creado por un estudiante durante la parte de Web Design del programa de Software Engineering. Se presenta como una muestra del trabajo estudiantil de este curso.",
    gameNote: "Un juego de {assignment}creado por un estudiante durante la parte de Game Development del programa. Los juegos de CodeHS funcionan mejor en una pestaña nueva.",
    otherNote: "Un proyecto creativo de programación creado por un estudiante durante el programa de Software Engineering. Este proyecto usa gráficos, animación o comandos de dibujo.",
    se10Text: "AP Computer Science Principles introduce computación y programación fundamentales.",
    se11Text: "Web Design and Game Development enfatiza sitios web, juegos y proyectos interactivos.",
    aiText: "Foundations of Artificial Intelligence agrega ciencia de datos, estadística, álgebra lineal, machine learning e inteligencia artificial con Python.",
    se12Text: "AP Computer Science A se enfoca en Java y programación orientada a objetos."
  }
};

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
  activeProject: null,
  lang: localStorage.getItem("gogaLang") || "en"
};

const els = {
  yearSelect: document.getElementById("yearSelect"),
  yearLabel: document.getElementById("yearLabel"),
  searchInput: document.getElementById("searchInput"),
  studentSelect: document.getElementById("studentSelect"),
  filterButtons: document.querySelectorAll(".filter"),
  resetButton: document.getElementById("resetButton"),
  statsButton: document.getElementById("statsButton"),
  spotlightWall: document.getElementById("spotlightWall"),
  spotlightKicker: document.getElementById("spotlightKicker"),
  spotlightHeading: document.getElementById("spotlightHeading"),
  spotlightArtwork: document.getElementById("spotlightArtwork"),
  wallLabel: document.getElementById("wallLabel"),
  featuredTrack: document.getElementById("featuredTrack"),
  featuredPrev: document.getElementById("featuredPrev"),
  featuredNext: document.getElementById("featuredNext"),
  featuredPosition: document.getElementById("featuredPosition"),
  browsePanel: document.getElementById("browsePanel"),
  browseKicker: document.getElementById("browseKicker"),
  browseTitle: document.getElementById("browseTitle"),
  searchLabel: document.getElementById("searchLabel"),
  studentLabel: document.getElementById("studentLabel"),
  allProjectsLabel: document.getElementById("allProjectsLabel"),
  allProjectsSmall: document.getElementById("allProjectsSmall"),
  websiteGalleryLabel: document.getElementById("websiteGalleryLabel"),
  websiteGallerySmall: document.getElementById("websiteGallerySmall"),
  gameArcadeLabel: document.getElementById("gameArcadeLabel"),
  gameArcadeSmall: document.getElementById("gameArcadeSmall"),
  creativeLabLabel: document.getElementById("creativeLabLabel"),
  creativeLabSmall: document.getElementById("creativeLabSmall"),
  footerLeft: document.getElementById("footerLeft"),
  footerRight: document.getElementById("footerRight"),
  galleryPanel: document.getElementById("galleryPanel"),
  statsPanel: document.getElementById("statsPanel"),
  statsContent: document.getElementById("statsContent"),
  statsYearPill: document.getElementById("statsYearPill"),
  statsKicker: document.getElementById("statsKicker"),
  statsTitle: document.getElementById("statsTitle"),
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
  viewerNoteTitle: document.getElementById("viewerNoteTitle"),
  viewerNoteBody: document.getElementById("viewerNoteBody"),
  themeToggle: document.getElementById("themeToggle"),
  themeToggleLabel: document.getElementById("themeToggleLabel"),
  languageToggle: document.getElementById("languageToggle"),
  brandHomeButton: document.getElementById("brandHomeButton"),
  showcaseSubtitle: document.getElementById("showcaseSubtitle")
};

function t(key, values = {}) {
  let text = (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
  Object.entries(values).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, value);
  });
  return text;
}

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
  if (value === "website") return t("websiteGallery");
  if (value === "game") return t("gameArcade");
  if (value === "other") return t("creativeLab");
  return t("allProjects");
}

function courseLabel(project) {
  return project.className || "Software Engineering";
}

function neutralProjectNote(project) {
  const kind = projectKind(project);
  const assignment = String(project.codehsAssignment || "").trim();
  const assignmentText = assignment ? `${assignment} ` : "";

  if (kind === "website") return t("websiteNote");
  if (kind === "game") return t("gameNote", { assignment: assignmentText });
  return t("otherNote");
}

function featuredProjects() {
  const list = projects()
    .filter(project => getYear(project) === state.year && project.featured)
    .slice()
    .sort((a, b) => getTitle(a).localeCompare(getTitle(b)));

  if (list.length > 0) return list;
  return projects().filter(project => getYear(project) === state.year).slice(0, 12);
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

  els.studentSelect.innerHTML = `<option value="">${escapeHtml(t("allStudents"))}</option>` + students
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

function setupStaticText() {
  document.documentElement.lang = t("htmlLang");

  els.yearLabel.textContent = t("year");
  els.statsButton.textContent = state.mode === "stats" ? t("backToExhibit") : t("pathwayInfo");
  if (els.showcaseSubtitle) els.showcaseSubtitle.textContent = t("showcaseSubtitle");
  els.spotlightKicker.textContent = t("featuredProjects");
  els.spotlightHeading.textContent = t("museumSpotlight");
  els.browseKicker.textContent = t("browseExhibit");
  els.browseTitle.textContent = t("browseTitle");
  els.searchLabel.textContent = t("search");
  els.searchInput.placeholder = t("searchPlaceholder");
  els.studentLabel.textContent = t("student");
  els.resetButton.textContent = t("reset");
  els.allProjectsLabel.textContent = t("allProjects");
  els.allProjectsSmall.textContent = t("allProjectsSmall");
  els.websiteGalleryLabel.textContent = t("websiteGallery");
  els.websiteGallerySmall.textContent = t("websiteGallerySmall");
  els.gameArcadeLabel.textContent = t("gameArcade");
  els.gameArcadeSmall.textContent = t("gameArcadeSmall");
  els.creativeLabLabel.textContent = t("creativeLab");
  els.creativeLabSmall.textContent = t("creativeLabSmall");
  els.backHomeButton.textContent = t("backToSpotlight");
  els.statsBackButton.textContent = t("backToSpotlight");
  els.prevButton.textContent = t("previous");
  els.nextButton.textContent = t("next");
  els.footerLeft.textContent = t("designedBy");
  els.footerRight.textContent = t("footerHint");
  els.viewerNoteTitle.textContent = t("viewerTitle");
  els.viewerNoteBody.textContent = t("viewerBody");
  els.statsKicker.textContent = t("statsKicker");
  els.statsTitle.textContent = t("statsTitle");
  els.statsYearPill.textContent = t("codeHsData");

  els.languageToggle.querySelectorAll("[data-lang]").forEach(button => {
    button.classList.toggle("active", button.dataset.lang === state.lang);
  });
}

function render() {
  document.body.classList.toggle("mode-home", state.mode === "home");
  document.body.classList.toggle("mode-gallery", state.mode === "gallery");
  document.body.classList.toggle("mode-stats", state.mode === "stats");

  setupYears();
  setupStudents();
  setupFilterButtons();
  setupStaticText();
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
  if (state.mode === "stats") renderPathwayInfo();
}

function setupStatsButton() {
  const active = state.mode === "stats";
  els.statsButton.classList.toggle("active", active);
  els.statsButton.setAttribute("aria-pressed", String(active));
  els.statsButton.textContent = active ? t("backToExhibit") : t("pathwayInfo");
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
      <button type="button" class="spotlight-open">${escapeHtml(t("openProject"))}</button>
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
    <p class="wall-label-kicker">${escapeHtml(t("wallLabel"))}</p>
    <h3>${escapeHtml(getTitle(project))}</h3>
    <dl>
      <div><dt>${escapeHtml(t("student"))}</dt><dd>${escapeHtml(project.studentDisplayName || "Student")}</dd></div>
      <div><dt>${escapeHtml(t("gallery"))}</dt><dd>${escapeHtml(galleryName(projectKind(project)))}</dd></div>
      <div><dt>${escapeHtml(t("course"))}</dt><dd>${escapeHtml(courseLabel(project))}</dd></div>
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

function getGalleryLayout(listLength) {
  const width = window.innerWidth;
  const focused = (state.search || state.student) && listLength <= 12;

  let columns = 2;

  if (focused) {
    if (listLength <= 2) columns = listLength || 1;
    else if (listLength <= 9) columns = 3;
    else columns = 4;
  } else if (width >= 1380) {
    columns = 5;
  } else if (width >= 1050) {
    columns = 4;
  } else if (width >= 760) {
    columns = 3;
  } else {
    columns = 1;
  }

  const rows = focused
    ? Math.max(1, Math.ceil(listLength / columns))
    : Math.max(1, Math.min(2, Math.floor(((els.projectGrid && els.projectGrid.getBoundingClientRect().height) || 400) / (ESTIMATED_CARD_HEIGHT + CARD_GRID_GAP)) || 2));

  const perPage = focused ? Math.max(1, listLength) : columns * rows;

  return { columns, rows, perPage };
}

function renderGallery() {
  const list = filteredProjects();
  const layout = getGalleryLayout(list.length);
  const totalPages = Math.max(1, Math.ceil(list.length / layout.perPage));

  state.page = Math.max(1, Math.min(state.page, totalPages));

  els.projectGrid.style.setProperty("--gallery-columns", String(layout.columns));
  els.projectGrid.style.setProperty("--gallery-rows", String(layout.rows));

  const start = (state.page - 1) * layout.perPage;
  const visible = list.slice(start, start + layout.perPage);

  updateGalleryHeading(list.length, totalPages);

  if (!visible.length) {
    els.projectGrid.innerHTML = `
      <div class="empty gallery-empty">
        <h3>${escapeHtml(t("noProjectsTitle"))}</h3>
        <p>${escapeHtml(t("noProjectsBody"))}</p>
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
  let label = t("galleryRoom");

  if (state.student) {
    title = t("studentProjects", { student: state.student });
    label = t("selectedStudent");
  } else if (state.search) {
    title = t("matchingProjects");
    label = t("searchResults");
  }

  els.modeLabel.textContent = label;
  els.galleryTitle.textContent = title;
  els.projectCount.textContent = `${count} ${count === 1 ? t("project") : t("projects")}`;
  els.pageLabel.textContent = t("pageOf", { page: state.page, total: totalPages });
  els.prevButton.disabled = state.page <= 1;
  els.nextButton.disabled = state.page >= totalPages;

  const focused = (state.search || state.student) && count <= 12;
  document.body.classList.toggle("focused-results", Boolean(focused));
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


function didYouKnowHeadlineMarkup() {
  if (state.lang === "es") {
    return 'Gateway Tech está agregando <span class="ai-headline-emphasis">Foundations of Artificial Intelligence</span>.';
  }

  return 'Gateway Tech is adding <span class="ai-headline-emphasis">Foundations of Artificial Intelligence</span>.';
}

function renderPathwayInfo() {
  const stats = window.GOGA_PATHWAY_STATS;

  if (!stats || !stats.totals) {
    els.statsContent.innerHTML = `<div class="empty">Pathway statistics are not available yet.</div>`;
    return;
  }

  const courses = Array.isArray(stats.courses) ? stats.courses : [];
  const totals = stats.totals;
  const maxHours = Math.max(...courses.map(course => Number(course.totalHours) || 0), 1);
  const totalHours = totals.totalHoursRounded || Math.round((totals.totalSeconds || 0) / 3600);
  const uniqueStudents = totals.uniqueStudents || 0;
  const totalLines = Number(totals.totalLinesOfCode || totals.totalLines || totals.linesOfCode || 159322);
  const avgHours = uniqueStudents ? (totalHours / uniqueStudents).toFixed(1) : "0.0";
  const avgLines = uniqueStudents ? Math.round(totalLines / uniqueStudents) : 0;
  const gradeStats = buildGradeStats(courses);
  const totalGradeSeconds = gradeStats.reduce((sum, item) => sum + item.seconds, 0) || 1;
  const pieStyle = buildPieStyle(gradeStats);

  els.statsContent.innerHTML = `
    <section class="did-you-know">
      <div class="did-you-copy">
        <p class="did-you-kicker">${escapeHtml(t("didYouKnow"))}</p>
        <h3>${didYouKnowHeadlineMarkup()}</h3>
        <p class="ai-body-text">${escapeHtml(t("aiBody"))}</p>
      </div>
      <div class="ai-orb" aria-hidden="true">
        <strong>AI</strong>
        <i></i><i></i><i></i>
      </div>
    </section>

    <section class="pathway-dashboard">
      <div class="stats-left-stack">
        <section class="stats-kpi-grid" aria-label="Pathway summary numbers">
          <article><strong>${formatNumber(totalHours)}</strong><span>${escapeHtml(t("totalHours"))}</span></article>
          <article><strong>${formatNumber(totalLines)}</strong><span>${escapeHtml(t("studentsRepresented"))}</span></article>
          <article class="dual-kpi">
            <div class="dual-stat-stack">
              <strong>${escapeHtml(avgHours)}<small>${escapeHtml(t("hrs"))}</small></strong>
              <strong>${formatNumber(avgLines)}<small>${escapeHtml(t("linesUnit"))}</small></strong>
            </div>
            <span>${escapeHtml(t("avgPerStudent"))}</span>
          </article>
        </section>

        <section class="stats-detail-grid">
          <article class="stats-card stats-bars-card">
            <div class="stats-section-heading"><p>${escapeHtml(t("timeByCourse"))}</p></div>
            <div class="stats-bars">
              ${courses.map(course => {
                const hours = Number(course.totalHours) || 0;
                const width = Math.max(8, Math.round((hours / maxHours) * 100));
                return `
                  <div class="stats-bar-row">
                    <div class="course-label">
                      <strong>${escapeHtml(course.displayName || course.className)}</strong>
                      <span class="course-grade">${escapeHtml(localizeGrade(course.gradeLabel || ""))}</span>
                      <span class="course-students">${formatNumber(course.studentCount || 0)} ${escapeHtml(t("students"))}</span>
                    </div>
                    <div class="stats-bar-track"><b style="--bar-width:${width}%"></b></div>
                    <em>${formatNumber(Math.round(hours))} ${escapeHtml(t("hrs"))}</em>
                  </div>
                `;
              }).join("")}
            </div>
          </article>

          <article class="stats-card stats-grade-card">
            <div class="stats-section-heading"><p>${escapeHtml(t("hoursByGrade"))}</p></div>
            <div class="stats-pie-wrap">
              <div class="stats-pie-box">
                <div class="stats-pie" style="${escapeHtml(pieStyle)}" aria-hidden="true"></div>
                ${gradeStats.map(item => {
                  const pct = Math.round((item.seconds / totalGradeSeconds) * 100);
                  const positionClass = `pie-label-${normalize(item.label)}`;
                  return `<span class="pie-percent-label ${positionClass}">${pct}%</span>`;
                }).join("")}
              </div>
              <div class="stats-pie-legend">
                ${gradeStats.map(item => `
                  <div><span style="--key-color:${escapeHtml(item.color)}"></span><strong>${escapeHtml(localizeGrade(item.label))}</strong><em>${formatNumber(Math.round(item.hours))} ${escapeHtml(t("hrs"))}</em></div>
                `).join("")}
              </div>
            </div>
          </article>
        </section>

        <article class="stats-card behind-card">
          <div class="stats-section-heading"><p>${escapeHtml(t("behindNumbers"))}</p></div>
          <p>${escapeHtml(t("behindText"))}</p>
        </article>
      </div>

      <article class="stats-card pathway-card">
        <div class="stats-section-heading"><p>${escapeHtml(t("pathwaySequence"))}</p></div>
        <div class="pathway-sequence">
          <div><strong>SE10</strong><span>AP CSP</span><p>${escapeHtml(t("se10Text"))}</p></div>
          <div><strong>SE11</strong><span>Web + Game</span><p>${escapeHtml(t("se11Text"))}</p></div>
          <div class="ai-step"><strong>${escapeHtml(t("aiSequenceCode"))}</strong><span>Foundations of AI</span><p>${escapeHtml(t("aiText"))}</p></div>
          <div><strong>SE12</strong><span>AP CSA</span><p>${escapeHtml(t("se12Text"))}</p></div>
        </div>
      </article>
    </section>
  `;
}

function localizeGrade(label) {
  if (label === "Sophomore") return t("sophomore");
  if (label === "Junior") return t("junior");
  if (label === "Senior") return t("senior");
  return label;
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
  return new Intl.NumberFormat(state.lang === "es" ? "es-US" : "en-US").format(Number(value) || 0);
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
    <html lang="${escapeHtml(t("htmlLang"))}">
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
        <p class="kicker">${escapeHtml(t("codeHsKicker"))}</p>
        <h1>${title}</h1>
        <p class="student">${student} · ${type}</p>
        <p class="note">${escapeHtml(t("codeHsNote"))}</p>
        <a href="${safeLink}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("openCodeHs"))}</a>
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
    els.themeToggleLabel.textContent = isDark ? t("dark") : t("light");
  }

  localStorage.setItem("gogaTheme", isDark ? "dark" : "light");
}

function setupTheme() {
  applyTheme(localStorage.getItem("gogaTheme") || "dark");
}

function setLanguage(lang) {
  state.lang = lang === "es" ? "es" : "en";
  localStorage.setItem("gogaLang", state.lang);
  render();
  applyTheme(localStorage.getItem("gogaTheme") || "dark");
}

function bindEvents() {
  if (els.themeToggle) {
    els.themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.contains("dark-mode");
      applyTheme(isDark ? "light" : "dark");
    });
  }

  els.languageToggle.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });

  if (els.brandHomeButton) {
    els.brandHomeButton.addEventListener("click", returnHome);
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
