# Remove Self Portrait Series, Hope, Mermaid + Collapse Gallery Sections

## Goal
Remove the self portrait series, Hope, and Mermaid from the gallery. Remove the "Digital Art" and "Traditional Art" section headings and merge all remaining items into one cohesive gallery grid.

## Files to touch
- `gallery/gallery.html` — Remove 4 self-portrait `<figure>` entries, remove `Hope`, remove `Mermaid`. Remove `<h2>Digital Art</h2>` and `<h2>Traditional Art</h2>` headings. Merge all remaining `<figure>` items into a single `<section class="gallery-grid" aria-label="Art gallery">`.
- `images/myart/Gallery/SelfPortraitSeries/` — Delete entire directory and 4 `.webp` files inside it.
- `images/myart/Gallery/Hope-Final.webp` — Delete.
- `images/myart/Gallery/mermaidFinal.webp` — Delete.
- `TODO.md` — Remove completed self-portrait-series task line (line 194).
- `docs/sync/local-tasks.json` — Remove self-portrait-series task entry.
- `LOGBOOK.md` — Add entry documenting this removal and gallery collapse.

## Verification
- Run link-check script to confirm no 404s from remaining gallery items.
- Confirm `SelfPortraitSeries` directory, `Hope-Final.webp`, and `mermaidFinal.webp` are gone.
- Confirm gallery page has one cohesive grid with 10 items (no section headings).

## Risks
- None; the removed items are standalone blocks. Collapsing the two sections into one does not affect the CSS grid layout — `.gallery-grid` is the same class used in both original sections.
