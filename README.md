# GOGA Software Engineering Showcase - Kiosk Version

This version is designed for the event laptops.

## Design goal

The homepage behaves like a single-screen exhibit kiosk:

- No normal website scrolling on laptops
- Large GOGA branding
- Simple 3-step instructions
- Search/select student on the left
- Featured projects and project cards on the right
- Pagination instead of scrolling
- Project opens inside a large overlay viewer
- X closes the project and returns to the gallery
- 5-minute inactivity reset

## Files

- `index.html`
- `styles.css`
- `script.js`
- `students.js`
- `assets/gateway-logo.png`

## How to add projects

Edit `students.js`.

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

## If a project does not load in the viewer

Some websites block embedded viewing. CodeHS embed links should be the most reliable.

For CodeHS links, the script tries to add `/embed` automatically, but the best workflow is to use the official CodeHS embed/share link whenever possible.

## Future years

Add `year: "2027"` to future project entries.

To make the site open to 2027 first, edit:

```js
defaultYear: "2026"
```

and change it to:

```js
defaultYear: "2027"
```

## Event setup

Recommended laptop setup:

1. Open the GitHub Pages URL.
2. Set browser zoom to 100%.
3. Use full-screen mode.
4. Confirm there is no page scrolling on the event laptops.
5. Test search, dropdown, featured cards, and project viewer.
