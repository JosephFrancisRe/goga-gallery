/*
  GOGA project data.

  Keep student names as first name + last initial.

  Required fields:
  studentDisplayName: "Maria R."
  projectTitle: "Space Dodger" or "" if unknown
  projectType: "Game" or "Website"
  projectLink: CodeHS share/embed link or student website link
  featured: true or false

  Optional:
  year: "2026", "2027", etc.
*/

window.GOGA_CONFIG = {
  defaultYear: "2026",
  inactivityLimitMs: 300000
};

window.GOGA_PROJECTS = [
  {
    studentDisplayName: "Example A.",
    projectTitle: "Maze Runner",
    projectType: "Game",
    projectLink: "https://codehs.com/",
    featured: true,
    year: "2026"
  },
  {
    studentDisplayName: "Example B.",
    projectTitle: "Personal Portfolio",
    projectType: "Website",
    projectLink: "https://codehs.com/",
    featured: true,
    year: "2026"
  },
  {
    studentDisplayName: "Example C.",
    projectTitle: "Space Dodger",
    projectType: "Game",
    projectLink: "https://codehs.com/",
    featured: true,
    year: "2026"
  },
  {
    studentDisplayName: "Example D.",
    projectTitle: "",
    projectType: "Game",
    projectLink: "https://codehs.com/",
    featured: false,
    year: "2026"
  },
  {
    studentDisplayName: "Example E.",
    projectTitle: "",
    projectType: "Website",
    projectLink: "https://codehs.com/",
    featured: false,
    year: "2026"
  },
  {
    studentDisplayName: "Example F.",
    projectTitle: "Interactive Story",
    projectType: "Game",
    projectLink: "https://codehs.com/",
    featured: false,
    year: "2026"
  },
  {
    studentDisplayName: "Example G.",
    projectTitle: "Creative Website",
    projectType: "Website",
    projectLink: "https://codehs.com/",
    featured: false,
    year: "2026"
  }
];
