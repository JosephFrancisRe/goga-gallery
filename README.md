# GOGA Gallery Site - Curated Titles, Descriptions, and Featured Work

This package includes updated gallery files plus a curated `students.js`.

## Included changes

- Project titles cleaned up.
- Parent-facing card descriptions added.
- Featured selections changed from "everyone" to a curated set of 12 projects.
- Cards now display a short description under the student name.
- The existing dark-mode/default toggle behavior is preserved.
- The existing responsive pagination behavior is preserved.

## Upload to GitHub

Upload/replace these files in the root of your GitHub Pages repository:

```text
index.html
styles.css
script.js
students.js
README.md
assets/gateway-logo.png
```

Do not delete the existing `student-sites/` folder.


## Pathway Stats Update

This version includes `pathway-stats.js`, which powers the Pathway Stats view in the kiosk. The stats use CodeHS time tracking exports and display the public-facing label "Time Spent Coding."

Project records in `students.js` now store `submissionYear`, `classCode`, `className`, `courseComponent`, `gradeAtSubmission`, and `gradeLabelAtSubmission` so historical projects can keep the class/grade context from the year they were submitted.
