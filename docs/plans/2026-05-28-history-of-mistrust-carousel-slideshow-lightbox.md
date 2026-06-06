# Plan: History of Mistrust — Carousel, Slideshow, Lightbox (Nanoagent)

**Date:** 2026-05-28  
**Agent:** kimi-k2.6 (shxdow-flow)  
**Scope:** `projects/history-of-mistrust.html` — replace static slide grid with interactive viewing modes: horizontal carousel, per-set slideshow, and click-to-fullscreen lightbox. Includes verification pass.

---

## Goal

Implement three interactive viewing experiences for the 30-slide Instagram carousel, then verify responsive behavior, both themes, keyboard navigation, and accessibility.

- **06** — Continuous horizontal carousel (3 sets of 10, no gaps, seamless)
- **07** — Per-set slideshow (one slide at a time) + combined set image after each set
- **08** — Click-to-fullscreen lightbox (keyboard + close, accessible)
- **10** — Verify: responsive, theme, a11y, keyboard nav, browser test

---

## Assets

| Asset | Path | Purpose |
|-------|------|---------|
| Display slides (720px) | `../images/myart/A History of Mistrust/slides/slide-NN.webp` | Grid, carousel, slideshow |
| Full slides (1080px) | `../images/myart/A History of Mistrust/slides/slide-NN@2x.webp` | Lightbox source |
| Combined sets | `../images/myart/A History of Mistrust/sets/set-1..3.webp` | Carousel strips + slideshow set boundaries |

---

## Approach

### 1. Horizontal Carousel (Task 06)

Replace the static grid with a **view-mode switcher** (Grid | Carousel | Slideshow). Default to Grid.

**Carousel mode:**
- A single wide container `overflow-x: auto` with `scroll-snap-type: x mandatory`
- Insert all 30 slides as `<img>` in a single `<div class="carousel-track">` with `display: flex; gap: 0;`
- Each slide `scroll-snap-align: start; flex-shrink: 0; width: 80vw;` (or `min(320px, 80vw)`)
- At boundaries between sets 1→2 and 2→3, insert a 1px separator or just let them flow ("no gaps, seamless")
- Add left/right arrow buttons and dot indicators
- Touch/swipe support via native horizontal scroll

**Rationale:** Using individual slides (not set images) preserves clickability for the lightbox and gives true "carousel" feel. The set images are used in the slideshow for set boundaries.

### 2. Per-set Slideshow (Task 07)

**Slideshow mode:**
- A single large slide viewer (max-width 720px, centered)
- Show one slide at a time
- Navigation: prev/next buttons + keyboard ArrowLeft/ArrowRight
- **Set boundaries:** After slide 10, insert the set-1 combined image as an interstitial. After slide 20, set-2. After slide 30, set-3.
- Set indicator tabs: Set 1 | Set 2 | Set 3 — clicking a tab jumps to that set's first slide
- Slide counter: "Slide X of 30"

**Slide order:**
```
Slides 1–10 → Set 1 image → Slides 11–20 → Set 2 image → Slides 21–30 → Set 3 image
```

### 3. Lightbox (Task 08)

**Trigger:** Click any `<img>` in Grid, Carousel, or Slideshow modes.

**Behavior:**
- Open fullscreen overlay (`position: fixed; inset: 0; z-index: 100`)
- Load `slide-NN@2x.webp` (full resolution)
- Close: Escape key, click backdrop, click close button (×), Enter/Space on close button
- Navigate: ArrowLeft/ArrowRight keys, click left/right hit areas
- Focus trap: Tab cycles within lightbox (close button, prev, next, image)
- Scroll lock: `overflow: hidden` on `<body>` while open
- Transition: fade-in 200ms

**Accessibility:**
- `role="dialog"`, `aria-modal="true"`, `aria-label="Image viewer"`
- Close button: `aria-label="Close image viewer"`
- Prev/Next: `aria-label="Previous image"` / `"Next image"`
- Live region: `aria-live="polite"` announcing slide number

### 4. View Mode Switcher

Add a tab-like switcher above the content area:
```
[ Grid ] [ Carousel ] [ Slideshow ]
```
- Active tab has `aria-pressed="true"`
- Only one mode visible at a time
- Grid: existing 3-column responsive grid (retained)
- Carousel: horizontal scroll strip
- Slideshow: single large viewer

### 5. CSS Conventions

All styles inline in `<style>` within `history-of-mistrust.html` to keep scoped. Use existing CSS custom properties from `brand.css` where available:
- `--brand-surface-1`, `--brand-surface-2`
- `--brand-border`, `--brand-border-mid`
- `--brand-text`, `--brand-text-muted`, `--brand-text-soft`
- `--brand-accent`, `--brand-accent-dim`
- `--brand-radius-lg`, `--brand-radius-md`
- `--brand-transition`, `--brand-transition-fast`
- `--brand-shadow-lg`, `--brand-shadow-card`

### 6. JavaScript Conventions

Inline `<script>` at bottom of page. No external dependencies. Vanilla JS only. Use event delegation for clicks. Cache DOM refs. Cleanup on page unload not needed (single-page).

---

## Files to Touch

1. `projects/history-of-mistrust.html` — primary implementation target
2. `TODO.md` — tick off 06, 07, 08, 10 when done
3. `LOGBOOK.md` — add entry

---

## Implementation Steps

### Phase A: Layout & View Switcher
1. Wrap existing slide grid in `<div id="view-grid" class="view-pane active">`
2. Add `<div id="view-carousel" class="view-pane">` and `<div id="view-slideshow" class="view-pane">`
3. Add tab buttons above with event listeners

### Phase B: Carousel
1. Generate 30 `<img>` elements in `.carousel-track`
2. Add CSS: `overflow-x: auto`, `scroll-snap-type`, flex layout
3. Add prev/next buttons and dot nav
4. Sync dot highlight on scroll (intersection observer or scroll event)

### Phase C: Slideshow
1. Create single `<img>` viewer + caption
2. Build slide array (slides 1–30 + set images at boundaries)
3. Prev/next + set tabs + counter
4. Keyboard nav within slideshow

### Phase D: Lightbox
1. Create overlay DOM structure (backdrop, image, close, prev, next)
2. Click handler on all slide images (grid, carousel, slideshow)
3. Open/close/keyboard logic
4. Focus trap + body scroll lock
5. Use @2x images for full resolution

### Phase E: Verify
1. Responsive: test 360px, 768px, 1024px, 1440px via browser dev tools
2. Theme: light/dark toggle, verify no hardcoded colors break contrast
3. Keyboard: Tab order, Enter/Space on buttons, Escape close, Arrow nav
4. Accessibility: axe-core or manual check for labels, roles, alt text
5. Console: no JS errors, all 30 slides + 3 set images load
6. Paths: all `src` attributes resolve

---

## Verification Criteria

| Check | Method |
|-------|--------|
| Carousel scrolls smoothly, snaps to slides | Manual drag / arrow buttons |
| Slideshow prev/next cycles through all 33 items (30 slides + 3 set images) | Keyboard + button click |
| Lightbox opens from all 3 view modes | Click grid img, carousel img, slideshow img |
| Lightbox keyboard: Esc close, Arrows nav | Manual keyboard test |
| Lightbox focus trap | Tab cycle within overlay |
| Responsive at 360/768/1024/1440px | Browser dev tools |
| Both themes readable | Toggle light/dark |
| No console errors | DevTools console |
| All image paths 200 OK | Network tab / visual confirm |
| Screen reader announces slide number | aria-live region |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| 30 slides × 3 modes = heavy DOM | Use `loading="lazy"` on grid, carousel images hidden until active |
| Lightbox focus trap complexity | Simple focusable element query, wrap tab at boundaries |
| Scroll-snap browser differences | Test in Chromium + Firefox; fallback to smooth JS scroll |
| Set image aspect ratios differ from slides | Set images are wider; limit max-height in slideshow/lightbox |
| Keyboard conflict with view switcher | Only bind slideshow/lightbox keys when respective mode active |

---

## Stop Conditions

- Any image fails to load → fix path first
- axe-core reports violation → fix before proceeding
- Console error → fix before final review
- Plan changes > 20% → stop and rewrite plan

---

## Human Decisions Required

None identified. All design choices map to existing brand system tokens.
