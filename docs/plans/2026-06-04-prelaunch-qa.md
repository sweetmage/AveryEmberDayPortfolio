# Plan — Pre-launch QA

**Date:** 2026-06-04
**Status:** In progress

---

## Goal

Run the full pre-launch QA checklist from `TODO.md` so the site is shippable. Fix anything that fails and mark each item complete.

---

## QA Checklist

### 1. Optimize gallery images
**Finding:** `images/myart/Gallery/*.png` files are 5–19 MB each (total ~100 MB+). All have `.webp` equivalents already generated. Only one HTML reference still points to PNG.

**Fix:**
- `gallery/gallery.html:61` — change `Self Portrait Series - In Love - Final.png` → `.webp`
- Delete unused large PNGs from `images/myart/Gallery/` (all have webp dupes; recoverable from git history)
- Verify no other HTML references large PNGs before deleting

**Files:** `gallery/gallery.html`, `images/myart/Gallery/*.png` (delete)

---

### 2. Confirm all links resolve — no 404s
**Scope:** All internal `href` and `src` paths in:
- `index.html`
- `projects/history-of-mistrust.html`
- `projects/brand-avery-ember-day.html`
- `projects/patriots-low-thirds.html`
- `gallery/gallery.html`
- `resume/AveryEmberDay_Resume_2026_Brand.html`

**Method:** Node script that parses each HTML file, extracts relative paths, checks file existence from repo root.

**Expected issues to fix:**
- None expected (nav/footer were unified in Phase 1 structural fixes)
- `resume/AveryEmberDay_Resume_2026_Brand.html` exists and is referenced correctly
- Patriots page is a skeleton (WIP badge already applied)

---

### 3. Spell-check all body copy
**Scope:** Visible text across all HTML pages above.

**Method:** Extract text nodes from HTML, run against a basic English word list + proper names (Avery, Ember, etc.). Flag obvious typos.

---

### 4. Keyboard nav test: tab order, skip link, focus rings visible
**Checks:**
- Every page has `<a href="#main" class="skip-link">`
- `.skip-link` is the first focusable element and unhides on `:focus`
- Nav links, project cards, theme toggle, return-to-top button are all in logical tab order
- `:focus-visible` rings are visible (brand.css defines them)

**Method:** Playwright automated tab-through on `index.html`, `history-of-mistrust.html`, and `gallery.html`.

---

### 5. Visual review at 4 widths — no clipping/overflow/awkward whitespace
**Breakpoints:** 360px, 768px, 1024px, 1440px
**Pages:** `index.html`, `projects/history-of-mistrust.html`, `gallery/gallery.html`

**Method:** Playwright screenshots at each breakpoint. Review for:
- Hero text clipping
- Project cards overflowing grid
- Gallery grid breaking
- Footer/nav awkward wrapping
- History-of-mistrust slideshow/lightbox layout

---

### 6. Final screenshot — recruiter 3-second impression check
**Method:** Playwright screenshot of `index.html` hero section at 1440px (desktop) and 390px (mobile). Ensure logo, name, tagline are immediately readable.

---

## Files to Touch

| File | Change |
|---|---|
| `gallery/gallery.html` | Fix one image src to `.webp` |
| `images/myart/Gallery/*.png` | Delete unused large PNGs |
| `TODO.md` | Mark Pre-launch QA items complete |
| `LOGBOOK.md` | Add entry for prelaunch QA cycle |

---

## Verification

1. `node` link-check script returns 0 unresolved paths
2. Playwright screenshots generated and reviewed
3. Spell-check passes with 0 typos
4. Keyboard nav script completes through all focusable elements
5. Gallery HTML loads the webp; no 404s in network

---

## Risks

- **Deleting PNGs:** If any PNG is referenced from a file we didn't scan (CSS `background-image`, JS dynamic load, markdown doc), it will 404. Mitigation: grep for each PNG filename before deleting.
- **Playwright availability:** If Playwright/Chromium isn't installed, visual checks may need to be manual. Mitigation: try `npx playwright` first; fall back to headed browser if needed.
- **Spell-check noise:** Proper names and domain-specific terms (medical citations in History of Mistrust) will flag false positives. Mitigation: only fix clear English typos, ignore names/citations.
