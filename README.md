# GOGA Software Engineering Showcase - Compact Version

This version keeps the simplified layout but fixes the oversized-card problem.

## Changes in this version

- Featured is selected by default.
- Reset returns to Featured, not All.
- Cards are compact directory tiles.
- Cards no longer stretch vertically to fill the screen.
- The page still uses pagination instead of scrolling.
- Projects still open inside the same-page viewer.

## Files to upload

Upload these files to the root of your GitHub Pages repository:

- `index.html`
- `styles.css`
- `script.js`
- `students.js`
- `assets/gateway-logo.png`

## Editing projects

Edit `students.js`.

Example:

```js
{
  studentDisplayName: "Maria R.",
  projectTitle: "Space Dodger",
  projectType: "Game",
  projectLink: "https://codehs.com/share/...",
  featured: true,
  year: "2026"
}
```

## Changing the default tab

In `students.js`, change:

```js
defaultFilter: "featured"
```

Options:

```js
defaultFilter: "all"
defaultFilter: "featured"
defaultFilter: "game"
defaultFilter: "website"
```
