# Plan — Bubble System Follow-Up Fixes

**Date:** 2026-06-30  
**Status:** Ready for implementation  
**Depends on:** `docs/plans/2026-06-30-bubble-physics-rework.md` (complete)

---

## Goal

Four targeted fixes to the bubble physics system:

1. **Transparent logo text** — `bubbleLogo-black.svg` has an embedded white PNG inside a clipPath; replace with a mask so the text becomes transparent and bubbles show through in light mode.
2. **Work-section collision** — bubbles avoid `#about .brand-container` but visibly overlap `#work .project-card` elements; add granular exclusion selectors for all visible text and interactive elements.
3. **CSS consolidation** — remove stale `.brand-bubble` rules from `brand.css` so the single source of truth in `app.css` (with `[data-color]` + `:root[data-theme]`) applies to both hero and global layers consistently.
4. **Viewport-scaled bubble sizing** — make bubble radii proportional to `vmin` so the decorative density stays uniform across mobile, tablet, and desktop.

---

## Approach

### 1. SVG mask replacement (file rewrite)

The current `bubbleLogo-black.svg` rasterises the text into a tiny embedded PNG (255×221, 99.2 % white opaque pixels). The clipPath already contains the precise vector outline of the text. We remove the PNG image and the clipPath wrapper, create an SVG `<mask>` that uses the same text path with `fill="black"`, and apply `mask="url(#textmask)"` to the bubble shape paths. Black areas in a mask hide content → the text becomes transparent.

### 2. Granular exclusion zones (JS)

The existing `HOME_EXCLUSIONS` list only covers section containers (`#work .brand-container`, `#about .brand-container`). Project cards inside the work grid extend to the container edges, but the heading and card interactive areas are what users actually notice. We expand `HOME_EXCLUSIONS` to include every visible text block and clickable element on `index.html`:

- `#work h2`, `#work .project-card`, `#work .project-grid`
- `#about h2`, `#about .about-box`
- `#hero .hero-name`, `#hero .hero-sub`
- `.brand-footer-inner`, `.brand-footer-connect`

This makes the avoidance behavior uniform across both sections.

### 3. CSS deduplication (delete + verify)

`brand.css` still carries the old `.brand-bubble` block (lines 728–802) with `nth-child` colour mapping and `html.dark` overrides. Because `brand.css` is imported at the top of `app.css`, its unlayered rules override `app.css`’s `@layer components` `[data-color]` rules in some browsers. We delete the entire old `.brand-bubble` block from `brand.css`. `app.css` already contains the definitive styles:
- `.brand-bubble` base rim + glow
- `.brand-bubble[data-color="cyan/gold/purple"]` variants
- `:root[data-theme="light"] …` and `@media (prefers-color-scheme: light)` overrides
- `.brand-bubble-physics` animation reset

Both hero and global layers use `.brand-bubble`, so one set of rules naturally covers both after cleanup.

### 4. Viewport-scaled radius (JS)

Current hard-coded radii:
- global: `[10, 28]` px
- hero: `[40, 75]` px

We introduce a `getBubbleRadiusRange(baseMin, baseMax)` helper that scales relative to `vmin / 900` (900 px reference ≈ laptop viewport), clamped `0.6–1.4×`. Each `BubbleLayer` stores the random `t ∈ [0,1]` used when a bubble was created; on resize it recomputes each bubble’s radius from `baseRange` × `scale(vmin)` × `t`. This keeps the size distribution consistent while adapting to the screen.

---

## Steps

### Step 1 — Fix `bubbleLogo-black.svg`
**File:** `images/icons/BubbleLogo/bubbleLogo-black.svg`
- Copy the text `path` data out of the existing `<clipPath>` before deleting anything.
- Replace the entire `<defs>` block with a new one containing `<mask id="textmask">` (white `<rect>` + text path with `fill="black"`).
- Remove the `<g class="cls-2">` image group entirely.
- Add `mask="url(#textmask)"` to both bubble `<path>` elements.
- Result: bubble is black, text is transparent.

### Step 2 — Expand exclusion selectors in `bubbles.js`
**File:** `scripts/bubbles.js`
- Replace `HOME_EXCLUSIONS` array with the granular list above.
- Change `ExclusionZoneTracker._update()` to use `document.querySelectorAll(sel)` instead of `document.querySelector(sel)`, pushing every matching element's rect into the zones array. This ensures multiple `.project-card` elements are all excluded.

### Step 3 — Remove stale bubble CSS from `brand.css`
**File:** `brand.css`
- Delete the entire block from `.brand-bubbles {` through `html.dark .brand-bubble:nth-child(3n) {` (and the `.brand-bubble--xs/sm/md/lg` modifiers).
- Keep `@media (prefers-reduced-motion: reduce)` rules that hide `.brand-bubbles-global` and `.brand-bubbles-hero`.

### Step 4 — Add viewport scaling to `bubbles.js`
**File:** `scripts/bubbles.js`
- Add `getViewportScale()` → `Math.max(0.6, Math.min(1.4, vmin / 900))`.
- In `BubbleLayer` constructor, store `this.baseRadiusRange = radiusRange` and each bubble’s `this._radiusT`.
- Compute radius as: `const base = this.baseRadiusRange[0] + b._radiusT * (this.baseRadiusRange[1] - this.baseRadiusRange[0]); const r = base * getViewportScale();`.
- Split `_onResize` into two handlers: `_onResize` (bounds + radii recalc, only on `resize`) and `_onScroll` (bounds only, on `scroll`). Register both separately.
- Ensure radius recalculation updates both `b.radius` and `b.el.style.width/height` so visual size and collision geometry stay in sync.

### Step 5 — Rebuild `style.css`
**File:** `style.css`
- Run `npx tailwindcss -i app.css -o style.css` from the repo root to regenerate the compiled CSS.
- Verify the stale `.brand-bubble:nth-child` rules are no longer present in `style.css`.

---

## Testing

1. **Open `index.html` in light mode** — hero logo text should be transparent (bubbles visible behind the letters).
2. **Scroll to Work section** — bubbles should not overlap any project card or the Work heading.
3. **Scroll to About section** — same avoidance, consistent with Work.
4. **Toggle dark / light mode** — bubble colours (purple/cyan/gold) should match between hero and global layers; no visual regression.
5. **Resize browser** — bubble sizes should smoothly scale; very small viewports (< 600 px) should have proportionally smaller bubbles, large desktops (> 1440 px) proportionally larger.
6. **Enable reduced motion** — bubble containers should disappear (existing behaviour).

---

## Risks

1. **SVG mask support** — SVG `<mask>` is supported in all evergreen browsers; the site already targets modern browsers.
2. **Exclusion-zone count** — more selectors means slightly higher `getBoundingClientRect()` cost, but we still throttle to 250 ms and only run on `index.html` which has `#hero`.
3. **Brand.css deletion** — if any sub-page loads `brand.css` directly without `app.css`, it would lose bubble styles. All pages load both `brand.css` and `style.css` (which bundles `app.css`), so this is safe.
4. **Resize jank** — recalculating radii on every resize event could cause layout thrashing if the user drags the window. We debounce via the existing `resize` listener that already updates `cachedBounds`.

---

## Out of Scope

- Rewriting the bubble physics engine (already complete)
- Adding new bubble colours or animation effects
- Framework migration concerns
