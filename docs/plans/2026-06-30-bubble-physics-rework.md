# Plan — Interactive Physics Bubble System

**Date:** 2026-06-30  
**Status:** Ready for implementation  
**Supersedes:** `docs/plans/2026-06-04-hero-bubble-physics.md` (canvas hero-only plan)  

---

## Goal

Remove the static CSS `.brand-bubble` div layer from the hero. Replace it with a **two-layer DOM-based physics bubble system**:

1. **Global layer** — small bubbles (20–80 px) that float across the entire page, bounce softly off viewport edges, page elements, and the user's mouse, with jiggle/squish physics.
2. **Hero layer** — much bigger bubbles (120–300 px) confined to the hero section, same physics, bigger visual presence.

Both layers reuse the existing `.brand-bubble` **visual** styling (rim glow, specular highlight, blend modes) but add a `.brand-bubble-physics` modifier that disables CSS keyframe animation so JS `transform` has sole control.

---

## Approach: DOM-Based Physics (not Canvas)

**Why DOM over canvas:**
- **DOM collision is native** — we can query `getBoundingClientRect()` on page elements and treat them as collision obstacles. Canvas would require manually syncing element positions.
- **Squish/jiggle is trivial** — CSS `transform: scale()` + `border-radius` adjustments express elastic deformation cleanly. Canvas 2D would require custom ellipse drawing per frame.
- **Visual parity** — the existing `.brand-bubble` CSS (box-shadow rim glow, `::before` radial-gradient fill, `::after` specular highlight, `mix-blend-mode`) is already polished. Recreating this in canvas is unnecessary work.
- **Performance is fine** — we're targeting ~12–20 bubbles total. Updating `transform` on 20 DOM nodes per frame is well within browser capability.

**Tradeoff:** Canvas is better for >100 particles. We don't need that scale.

---

## Architecture

### Two Bubble Layers

| Layer | Container | Position | z-index | Size | Count |
|---|---|---|---|---|---|
| Global | `<div class="brand-bubbles-global">` | `fixed`, full viewport | `0` | 20–80 px | 8–12 |
| Hero | `<div class="brand-bubbles-hero">` | `absolute`, inside `#hero` | `0` | 120–300 px | 3–5 |

Both containers are `pointer-events: none` and `overflow: hidden` (hero only; global is viewport-clipped naturally).

### Physics Engine

A single `requestAnimationFrame` loop in `scripts/bubbles.js` updates both layers.

**Per-bubble state:**
```js
{
  el,           // DOM element reference
  x, y,         // center position (px)
  vx, vy,       // velocity (px/frame)
  radius,       // base radius
  scaleX,       // current squish scale (spring toward 1.0)
  scaleY,
  svx, svy,     // squish spring velocity
  colorSet,     // 'purple' | 'cyan' | 'gold'
}
```

**Per-frame update order:**
1. Query exclusion zones (throttled — see Performance)
2. Apply autonomous drift (gentle random nudge)
3. Apply mouse repulsion force
4. Integrate velocity → position
5. Clamp to bounds (viewport for global, hero rect for hero)
6. Resolve collisions with exclusion zones (reflect + squish)
7. Resolve bubble-bubble collisions (elastic + squish)
8. Apply squish spring recovery
9. Apply velocity damping
10. Render: `el.style.transform = translate(x - radius, y - radius) scale(scaleX, scaleY)`

---

## Physics Details

### Constants
```js
const REPEL_RADIUS    = 180;    // px — mouse influence zone
const REPEL_FORCE     = 0.35;   // max acceleration at edge of zone
const DAMPING         = 0.985;  // per-frame velocity multiplier
const DRIFT_JITTER    = 0.02;   // random autonomous nudge
const SPRING_K        = 0.15;   // squish spring stiffness
const SPRING_DAMP     = 0.78;   // squish spring damping
const SQUISH_AMOUNT   = 0.25;   // max squish deviation
const MIN_SPEED       = 0.4;    // floor — nudge if stalled
const MAX_SPEED       = 3.5;    // ceiling — prevent escape
```

### Mouse Repulsion
Track `mousemove` on `window`. Per bubble within `REPEL_RADIUS`:
```js
let dx = b.x - mouse.x, dy = b.y - mouse.y;
let dist = Math.sqrt(dx*dx + dy*dy);
if (dist < REPEL_RADIUS && dist > 0) {
  let strength = REPEL_FORCE * (1 - dist / REPEL_RADIUS);
  b.vx += (dx / dist) * strength;
  b.vy += (dy / dist) * strength;
}
```
Clamp velocity to `MAX_SPEED` after all forces.

### Wall / Bounds Bounce
- **Global layer:** viewport edges (`0, window.innerWidth, window.innerHeight`)
- **Hero layer:** hero section bounding rect
On collision: reflect velocity component along collision axis, trigger squish.

### Exclusion-Zone Collision (DOM Elements)
Default selectors (valid on all pages with brand nav/footer):
```js
const DEFAULT_EXCLUSIONS = [
  '.brand-nav',
  '.brand-footer',
  '#return-to-top'
];
```

Home-page extras (only on `index.html` which has `#hero`):
```js
const HOME_EXCLUSIONS = [
  '.brand-hero-content',
  '#work .brand-container',
  '#about .brand-container'
];
```

Subpages read extra selectors from the container's `data-exclusions` attribute:
```js
let extra = container.dataset.exclusions?.split(',').map(s => s.trim()) || [];
```

Query rects every 250ms (throttled) or on `resize`/`scroll`.
For each bubble, check predicted next position against each rect. If overlap:
- Find closest edge of the rect
- Reflect velocity along the edge normal
- Push bubble outside the rect by `radius + padding` (padding = 8px)
- Trigger squish

### Bubble-Bubble Collision
For each pair (i, j): if `dist < ri + rj`:
- Resolve overlap by pushing apart along collision normal
- Swap velocity components along normal (equal mass elastic)
- Trigger squish on both

### Squish / Jiggle Physics
On any collision (wall, zone, or bubble):
```js
let axis = Math.atan2(dy, dx);  // collision normal angle
b.scaleX = 1 - SQUISH_AMOUNT * Math.abs(Math.cos(axis));
b.scaleY = 1 + SQUISH_AMOUNT * Math.abs(Math.sin(axis));
b.svx = 0; b.svy = 0;
```

Per-frame spring recovery:
```js
b.svx += (1 - b.scaleX) * SPRING_K;
b.svy += (1 - b.scaleY) * SPRING_K;
b.scaleX += b.svx;
b.scaleY += b.svy;
b.svx *= SPRING_DAMP;
b.svy *= SPRING_DAMP;
```

This gives a ~400ms wobble recovery at 60fps.

### Autonomous Drift
Every frame, add tiny random jitter:
```js
b.vx += (Math.random() - 0.5) * DRIFT_JITTER;
b.vy += (Math.random() - 0.5) * DRIFT_JITTER;
```
If `|v| < MIN_SPEED`, add a stronger random kick to prevent stalls.

---

## Visual Design

### Reuse Existing CSS
Both layers use `.brand-bubble` + `.brand-bubble-physics`:
- `.brand-bubble` provides `box-shadow` rim + under-glow, `::before` radial-gradient fill, `::after` specular highlight, `border-radius: 50%`
- `.brand-bubble-physics` overrides `animation: none` and sets `left: 0; top: 0; will-change: transform` so JS has full control

Per-bubble differences:
- **Size** — set via inline `width`/`height` on each bubble element
- **Color variant** — set via `data-color="purple|cyan|gold"` attribute
- **Position** — driven by JS `transform: translate()`

### Color Variant CSS Migration
Replace existing `nth-child` selectors in `app.css` with `[data-color]` attribute selectors:
```css
.brand-bubble[data-color="purple"] { /* was nth-child default */ }
.brand-bubble[data-color="cyan"] { /* was nth-child(3n+1) */ }
.brand-bubble[data-color="gold"] { /* was nth-child(3n+2) */ }
```
Same migration for light-mode overrides.

### Light / Dark Theme
The existing `:root[data-theme="light"] .brand-bubble` and `@media (prefers-color-scheme: light)` rules already handle theme switching. Since the new bubbles are still `.brand-bubble` elements, they inherit theme colors automatically.

### Hero Big Bubbles
Same CSS class, but with size classes:
```css
.brand-bubble--xl { width: 180px; height: 180px; }
.brand-bubble--xxl { width: 260px; height: 260px; }
```

---

## Steps

### Step 1 — Remove old CSS bubble layer from hero
**File:** `index.html`

Remove:
```html
<div class="brand-bubbles" aria-hidden="true">
  <div class="brand-bubble brand-bubble--sm brand-bubble--1"></div>
  ... <!-- all 9 small bubbles -->
</div>
```

Keep `.brand-hero-blobs` (the 5 CSS-animated hero blobs) — those stay as atmosphere.

### Step 2 — Add new bubble containers
**File:** `index.html`

Add global container at the end of `<body>`:
```html
<div class="brand-bubbles-global" aria-hidden="true"></div>
```

Add hero container inside `#hero`:
```html
<section id="hero" class="brand-hero">
  <div class="brand-bubbles-hero" aria-hidden="true"></div>
  <div class="brand-hero-blobs" aria-hidden="true">...</div>
  <div class="brand-container brand-hero-content">...</div>
</section>
```

Load script:
```html
<script src="scripts/bubbles.js" defer></script>
```

### Step 3 — Create `scripts/bubbles.js`
**File:** `scripts/bubbles.js` (new)

Implement:
- `BubbleLayer` class managing a set of bubbles
- `PhysicsEngine` class with the per-frame loop
- `ExclusionZoneTracker` for DOM rect queries
- `MouseTracker` for pointer position
- Init: create DOM elements, seed positions, start loop

### Step 4 — Add layer CSS to `app.css`
**File:** `app.css`

Add:
```css
.brand-bubbles-global {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.brand-bubbles-hero {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.brand-bubble-physics {
  animation: none !important;
  left: 0;
  top: 0;
  will-change: transform;
}
.brand-bubble--xl { width: 180px; height: 180px; }
.brand-bubble--xxl { width: 260px; height: 260px; }
```

### Step 5 — Update reduced-motion CSS
**File:** `brand.css`

In the existing `@media (prefers-reduced-motion: reduce)` block, add:
```css
.brand-bubbles-global,
.brand-bubbles-hero {
  display: none;
}
```
The JS physics engine will also check `matchMedia('(prefers-reduced-motion: reduce)')` at init and abort if true, so bubbles are never created for reduced-motion users.

### Step 6 — Clean up dead CSS rules
**File:** `app.css`

Remove the old `.brand-bubble--1` through `.brand-bubble--9` position classes (they set `--bx`, `--by`, `--bd`, `--bd2` for the removed CSS-keyframe bubbles). These are no longer used since positions are now JS-driven.

### Step 8 — Tune constants in browser
Open `index.html`, adjust `REPEL_FORCE`, `SQUISH_AMOUNT`, `SPRING_K`, `MAX_SPEED` until bubbles feel floaty, responsive to mouse, and squishy on collisions.

### Step 9 — Verify across pages
Ensure `scripts/bubbles.js` and the global container are included on all pages.

**Path corrections:**
- Root pages (`index.html`): `<script src="scripts/bubbles.js" defer></script>`
- Subpages (`gallery/*.html`, `projects/*.html`): `<script src="../scripts/bubbles.js" defer></script>`

Pages to update:
- `index.html`
- `gallery/gallery.html`
- `projects/brand-avery-ember-day.html`
- `projects/history-of-mistrust.html`
- `projects/patriots-low-thirds.html`

Only `index.html` gets the hero bubble layer (since only it has `#hero`).

**Page-specific exclusion zones:** `scripts/bubbles.js` should accept a per-page selector list. Default zones cover `index.html` elements. Subpages can pass additional selectors (e.g., `.gallery-grid`, `.project-hero`, `.case-study`) by adding `data-exclusions` on the global container:
```html
<div class="brand-bubbles-global" aria-hidden="true" data-exclusions=".gallery-grid, .project-hero"></div>
```

---

## Performance

- **RAF loop** — single `requestAnimationFrame` for both layers
- **Exclusion zone throttling** — query `getBoundingClientRect()` every 250ms, not every frame. Cache rects. Update on `resize` and `scroll`.
- **Visibility pause** — `document.visibilityState` → pause loop when tab hidden
- **Hero IntersectionObserver** — pause hero layer when `#hero` not in viewport
- **will-change** — set `will-change: transform` on all bubble elements
- **Bubble count** — global 8–12 + hero 3–5 = 11–17 total. O(n²) collision = <300 pair checks/frame. Trivial.

---

## Accessibility

- `aria-hidden="true"` on both containers
- `prefers-reduced-motion: reduce` → skip physics loop entirely, hide bubble containers
- `pointer-events: none` so bubbles never block clicks on links/buttons
- Bubbles never overlap text/content (enforced by exclusion-zone collision)

---

## Testing

1. **Open `index.html`** — bubbles should appear and drift immediately
2. **Move mouse** — nearby bubbles should gently push away
3. **Scroll** — global bubbles should follow viewport; hero bubbles should stay in hero
4. **Resize window** — bubbles should remain in bounds
5. **Toggle theme** — bubble colors should switch with light/dark mode
6. **Enable reduced motion** — bubbles should disappear/stop
7. **Tab away** — animation should pause
8. **Check element avoidance** — bubbles should not sit on top of nav, cards, or footer

---

## Risks

1. **Exclusion zone accuracy** — elements with `transform`, `position: fixed`, or dynamic sizing may report rects that don't match visual bounds. We'll add a `padding` buffer (8px) and test across breakpoints.
2. **Mobile touch** — `mousemove` doesn't fire on touch devices. Add `touchmove` listener as proxy for mouse position.
3. **z-index conflicts** — global bubbles at z-index 0 may render above some content if that content also uses z-index 0 but appears later in DOM. We'll test and bump content z-index if needed.
4. **Hero container overflow** — hero layer uses `overflow: hidden` to clip big bubbles to hero bounds. Ensure this doesn't clip hero content (content is z-index 1, above bubbles).
5. **Framework migration** — if the site moves to React/Vue later, `scripts/bubbles.js` is a plain ES module that can be imported into a `useEffect` or `onMount`. No framework coupling.

---

## Out of Scope

- Bubble texture/image assets (code ready to swap CSS gradients for images if ever needed)
- Bubble trails / glow post-processing
- Gravity / attractors beyond mouse repulsion
- WebGL / Three.js
