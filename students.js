/* 
  GOGA project data.

  Required fields for each project:
  - studentDisplayName: first name + last initial, e.g. "Maria R."
  - projectTitle: use "" if no title is available; the site will create a generic title.
  - projectType: "Game" or "Website"
  - projectLink: CodeHS share/embed link or student website link
  - featured: true or false

  Optional fields:
  - year: defaults to "2026" if omitted
  - thumbnail: image path, e.g. "assets/thumbnails/maria-r-space-dodger.png"

  To add 2027 projects later:
  - Add year: "2027" to those project objects.
  - Change defaultYear below to "2027" when you want the site to open to 2027 first.
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
    year: "2026",
    thumbnail: ""
  },
  {
    studentDisplayName: "Example B.",
    projectTitle: "Personal Portfolio",
    projectType: "Website",
    projectLink: "https://codehs.com/",
    featured: true,
    year: "2026",
    thumbnail: ""
  },
  {
    studentDisplayName: "Example C.",
    projectTitle: "",
    projectType: "Game",
    projectLink: "https://codehs.com/",
    featured: false,
    year: "2026",
    thumbnail: ""
  }
];
