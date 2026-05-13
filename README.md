# GOGA Software Engineering Showcase

This is a free static website designed for GitHub Pages.

## Files

- `index.html` - main webpage
- `styles.css` - all visual styling
- `script.js` - search, filtering, project viewer, inactivity reset
- `students.js` - the only file you usually need to edit
- `assets/gateway-logo.png` - Gateway logo used in the header and footer

## How to upload to GitHub Pages

1. Open your `goga-gallery` GitHub repository.
2. Upload or replace these files in the root of the repository:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `students.js`
   - `assets/gateway-logo.png`
3. Commit the changes.
4. Wait for GitHub Pages to rebuild.
5. Refresh your GitHub Pages URL.

## How to add student projects

Open `students.js` and add projects to the `window.GOGA_PROJECTS` list.

Example:

```js
{
  studentDisplayName: "Maria R.",
  projectTitle: "Space Dodger",
  projectType: "Game",
  projectLink: "https://codehs.com/share/...",
  featured: true,
  year: "2026",
  thumbnail: ""
}
```

Use first name + last initial for student names.

## Project title behavior

If `projectTitle` is blank, the site will automatically display a generic title based on the project type:

- `Student Game Project`
- `Student Website Project`
- `Student Digital Project`

## Future years

The site is already archive-ready.

For 2027 projects, add:

```js
year: "2027"
```

To make the site open to 2027 by default, change this line in `students.js`:

```js
defaultYear: "2026"
```

to:

```js
defaultYear: "2027"
```

## Inactivity reset

The site resets after 5 minutes of inactivity.

To change that time, edit this line in `students.js`:

```js
inactivityLimitMs: 300000
```

Examples:

- 2 minutes: `120000`
- 5 minutes: `300000`
- 10 minutes: `600000`

## Embedded project viewer

The site opens student projects inside an overlay viewer rather than a new browser tab.

Important note: some external websites block embedded viewing. CodeHS Sandbox embed links are the most reliable option. If a CodeHS link does not load, try using the CodeHS embed link or adding `/embed` to the end of the shared CodeHS URL.

## Recommended event setup

On each laptop:

1. Open the GitHub Pages URL.
2. Set browser zoom to 100% or 110%.
3. Put the browser in full-screen mode.
4. Test the search box.
5. Test at least one CodeHS project.
6. Leave the page on the homepage before the event begins.
