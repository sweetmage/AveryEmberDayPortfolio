# Plan: All Slides — Full-Width Stacked Sets

**Date:** 2026-06-03
**Scope:** `projects/history-of-mistrust.html` — "All Slides" section layout: each set image takes full section width, stacked vertically.

---

## Goal

Ensure the "All Slides" section displays each set image (set-1.webp, set-2.webp, set-3.webp) at full section width, stacked top-to-bottom, with no grid side-by-side layout and no width constraints that shrink the images below the available section width.

## Current State

- `.project-section` has `max-width: 1200px` + `padding: 0 24px 80px`
- `.all-sets-full` uses `flex-direction: column; gap: 24px` (vertical stack)
- `.all-sets-full .carousel-set` has `width: 100%`
- Images have `width: 100%; height: auto`
- Layout is functionally correct but lacks visual polish (no border-radius, no overflow hidden on container)

## Changes

1. **CSS adjustments:**
   - Ensure `.all-sets-full` has `width: 100%` explicitly
   - Add `overflow: hidden` + `border-radius: var(--brand-radius-lg)` to `.all-sets-full .carousel-set` for visual consistency with other section cards
   - Add `border: 1px solid var(--brand-border)` and `background: var(--brand-surface-1)` to match `.slide-card` style
   - Add `cursor: pointer` via CSS (currently set by JS)
   - Add a subtle hover/focus style for the clickable sets

2. **Remove dead code:**
   - Remove `.slide-grid.all-slides-grid` media query (line 232) since it's never used
   - Remove `.slide-grid` CSS entirely if it has no other consumers (check)

3. **Verify:**
   - Responsive at 360px, 768px, 1200px, 1440px
   - Light/dark theme rendering
   - Lightbox click wiring still works
   - Labels remain correctly positioned

## Files Touched

- `projects/history-of-mistrust.html` (embedded CSS + HTML only)

## Result

All changes applied to `projects/history-of-mistrust.html`:

- `.all-sets-full` — added `width: 100%` explicitly
- `.all-sets-full .carousel-set` — added `border-radius`, `overflow: hidden`, `border`, `background`, `cursor: pointer`, hover/focus styles
- Removed dead `.slide-grid` and `.all-slides-grid` CSS + responsive overrides
- Changed `.carousel-set img` cursor from `zoom-in` to `pointer` in JS

Layout unchanged in structure — sets remain stacked vertically at full section width. Visual polish added to match `.slide-card` and `.supporting-card` styles.
