# GOGA Software Engineering Showcase

This package contains the updated GOGA kiosk site.

## Major updates

- Replaced the unofficial black-background logo with official Gateway logo assets.
- Added official logo variants in `assets/`:
  - `gateway-logo-icon.png`
  - `gateway-logo-white-fill.png`
  - `gateway-logo-white-outline.png`
- Reworked the header:
  - `Gateway Tech` appears in red.
  - `GOGA` and `Gallery of Gateway Art` are left-aligned as a brand lockup.
  - `Software Engineering Showcase` is now the centered kiosk title.
  - `Pathway Stats` moved to the header instead of the filter row.
  - Year label is centered above the year dropdown.
- Added a premium Featured Showcase carousel.
- Removed Featured as a gallery filter.
- Gallery filters are now: All, Games, Websites, Other.
- Pathway Stats remains a separate dashboard view.
- Grade/class metadata remains stored on projects at time of submission.

## Upload to GitHub

Upload/replace the files in your GitHub Pages repo with this package. Do not delete `student-sites/`.

## Latest visual update

- Featured Showcase now uses larger premium carousel cards.
- The gallery no longer shows featured projects first by default, reducing immediate duplication.
- The entire featured/project card is clickable; View Project buttons were replaced with an open cue.
- Cards now have hover/focus/active visual feedback.
- Dark/light mode toggle moved from the header to the center of the footer.
- Header logo assets were normalized so logo sizing is consistent.
- Red theme color now matches the current official logo red used in the header logo.
- Search/Student labels are centered over their fields and search row spacing was tightened.


## Latest carousel/stats polish

- Filter buttons and Reset are vertically aligned.
- Card open cues now sit at the bottom right.
- Featured carousel supports wheel scrolling and click-drag scrolling.
- Featured carousel uses large left/right edge arrows instead of a small top-right counter.
- Featured carousel loops seamlessly using a repeated middle-track strategy.
- AP CSP pathway stats now correctly label SE10 as Sophomore.
- Pathway Stats hides the search/featured rows and uses the full remaining viewport height.
- Added a grade-level pie chart for time spent coding.
- Gallery cards now use equal-height rows and dynamically fill the available gallery space.


## Final layout polish update

- Featured cards are larger than gallery cards.
- Gallery uses up to five columns and three dynamic rows on wide screens.
- Filter buttons now have a FILTER label and align with the student dropdown row.
- Gallery card metadata and Open Project cue share the same bottom row.
- Pager controls are centered using a balanced grid.
- Header side columns were balanced so the main title centers visually.
- The main title has stronger visual weight.
- Featured carousel uses a five-copy middle-track loop for smoother endless navigation.


## Featured Projects / Stats final polish

- Renamed Featured Showcase to FEATURED PROJECTS.
- Increased the main title subtitle size.
- Softened the red used in dark mode to reduce eye strain while keeping Gateway branding.
- Made the stats view use the full remaining viewport height.
- Kept the stats footer pinned to the bottom through stats-specific app row sizing.
- Enlarged Pathway Stats section headings.
- Adjusted the grade-level pie chart so the chart is left-aligned and the legend is right-aligned.


## Circular carousel + stats-space utilization update

- The carousel now uses true circular data rotation: pressing left from the first card shows the last card immediately.
- Removed the duplicated-track scroll jump behavior.
- Wheel and drag gestures now rotate the carousel one card at a time.
- Pathway Stats cards now use available vertical space more aggressively.
- Course bars, pie chart, legend, and pathway context text scale up to reduce unused whitespace.


## Featured Projects dynamic-width update

- Featured Project cards now calculate how many full cards fit in the carousel.
- The carousel displays only full-width cards, so no card is ever partially visible at the edge.
- Left/right carousel arrows now animate the incoming cards from the correct direction.
- Wheel and drag gestures still rotate the carousel as a circular list.


## True featured carousel slide update

- Featured card count is now calculated from available carousel width and minimum card width.
- Wider browsers now show more featured cards while still avoiding partial cards.
- Arrow navigation now animates the actual track moving from source to destination.
- The carousel uses one temporary offscreen card during movement, then rotates the circular data after the slide completes.
