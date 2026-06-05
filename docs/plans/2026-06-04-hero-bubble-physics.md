# Plan — Hero Bubble Physics Animation

**Date:** 2026-06-04
**Status:** Awaiting implementation

---

## Goal

Replace the static CSS `.brand-bubble` divs in the hero section with a canvas-based physics simulation where bubbles:
- Float around the hero with gentle autonomous drift
- Are pushed away by the mouse cursor (repulsion field)
- Bounce off hero borders and each other
- Squish/deform elastically on collision (spring-based scale deformation)

---

## Approach Decision: Canvas 2D (not DOM physics)

**Why canvas over DOM:**
- Collision detection and squish deformation require per-frame control over bubble shape that CSS transforms can't cleanly express (esp. directional squish on arbitrary collision angles)
- Canvas is GPU-accelerated and has zero layout cost — no reflow per frame
- Simpler to draw bubble visuals (radial gradients, optional texture image) than fight CSS inheritance
- One `<canvas>` element replaces 9 div elements — lighter DOM

**What we lose:** the existing CSS `brand-bubble` gradient/blur styling. These get redrawn in canvas using `createRadialGradient()` with the same brand colors.

---

## Files to Change

| File | Change |
|---|---|
| `index.html` | Replace 9 `.brand-bubble` divs with `<canvas id="hero-bubbles">` inside `.brand-bubbles`; add `<script src="scripts/bubbles.js" defer></script>` |
| `scripts/bubbles.js` | New file — full physics + render system |
| `style.css` | Update `.brand-bubbles` to position canvas correctly; remove or archive old `.brand-bubble` rules |

---

## Physics Model

### Bubble state (per bubble)
```
{
  x, y          — center position
  vx, vy        — velocity (px/frame)
  r             — base radius
  scaleX, scaleY — current squish scale (spring toward 1.0)
  svx, svy      — squish spring velocity
  squishDir     — angle of squish axis (radians, set on collision)
  color         — brand color index
}
```

### Per-frame update order
1. Apply mouse repulsion force (if mouse within `REPEL_RADIUS`)
2. Integrate velocity → update position
3. Apply velocity damping (`vx *= 0.992`)
4. Wall collision: reflect velocity component, trigger squish
5. Bubble-bubble collision: elastic mass collision, trigger squish on both
6. Spring squish recovery: `svx += (1 - scaleX) * SPRING_K; scaleX += svx; svx *= SPRING_DAMP`

### Constants (tune during implementation)
```js
const REPEL_RADIUS  = 160;   // px — mouse influence zone
const REPEL_FORCE   = 0.45;  // acceleration applied at edge of zone (falloff: force * (1 - dist/REPEL_RADIUS))
const DAMPING       = 0.992; // per-frame velocity multiplier
const SPRING_K      = 0.18;  // squish spring stiffness
const SPRING_DAMP   = 0.72;  // squish spring damping
const SQUISH_AMOUNT = 0.22;  // max squish deviation (1 ± 0.22)
const MIN_SPEED     = 0.3;   // min velocity magnitude — nudge if slower
const MAX_SPEED     = 4.0;   // clamp to prevent escape
```

### Squish deformation
On any collision (wall or bubble), compute the collision axis angle and set:
```
scaleX = 1 + SQUISH_AMOUNT * cos(axis)
scaleY = 1 + SQUISH_AMOUNT * sin(axis)
```
The spring then pulls both back toward 1.0 over ~20-30 frames (~350ms at 60fps).
Draw bubbles with `ctx.save(); ctx.scale(b.scaleX, b.scaleY); ctx.arc(...); ctx.restore()`.

### Mouse repulsion
Track `mousemove` on the hero section. On each frame, for each bubble within `REPEL_RADIUS`:
```
let dx = b.x - mouse.x, dy = b.y - mouse.y
let dist = Math.sqrt(dx*dx + dy*dy)
let strength = REPEL_FORCE * (1 - dist / REPEL_RADIUS)
b.vx += (dx / dist) * strength
b.vy += (dy / dist) * strength
```
Clamp velocity to `MAX_SPEED` after.

### Bubble-bubble collision
For each pair (i, j): if `dist(i, j) < ri + rj`, resolve overlap and apply elastic collision.
With equal mass (all bubbles same mass): swap velocity components along collision normal.
Set squish on both at `squishDir = atan2(dy, dx)`.

### Drift (keeps bubbles moving without mouse)
On init, each bubble gets a random velocity `(±1.5, ±1.5)` px/frame.
A very gentle per-frame nudge (`± 0.01` random jitter) prevents full stops.
`MIN_SPEED` enforces a floor — if a bubble stalls, add a small random kick.

---

## Bubble Visuals

Drawn in canvas as filled circles with a radial gradient mimicking the CSS bubble look.
Brand colors (from `brand.css`):
- `--brand-iris-400`: `#8b5cf6` (violet)
- `--brand-sky-400`: `#38bdf8` (sky blue)
- `--brand-aqua-400`: `#2dd4bf` (teal)
- Specular highlight: white at 30% opacity at top-left of each bubble

Sizes matching existing CSS classes:
```
xs: r = 18px
sm: r = 26px
md: r = 38px
lg: r = 56px
```
Starting bubble set: 2×xs, 3×sm, 2×md, 2×lg (9 total, matching original DOM count).

**Asset upgrade path:** once SVG/PNG bubble textures are ready, load them as `Image` objects and use `ctx.drawImage()` instead of the gradient fill. The physics system is fully decoupled from the render step.

---

## Performance Budget

- Target: 60fps, <2ms/frame on mid-range hardware
- Bubble count: 9 — O(n²) collision checks = 36 pairs/frame, trivially fast
- No external libraries. ~150 lines of JS total.
- Canvas render: clear + redraw 9 circles per frame = negligible

### Loading strategy
- `<script defer>` — doesn't block HTML parse
- Init inside `DOMContentLoaded` — no blocking
- No fonts, no fetches, no dependencies

---

## Accessibility / Motion Guard

```js
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // skip physics — let CSS animations handle bubbles (or hide them)
  return;
}
```
Add this check at the top of the init function. The canvas will remain hidden and the 9 CSS divs can stay as fallback (or just show nothing for reduced-motion users).

### IntersectionObserver pause
Observe the `#hero` section. When it leaves the viewport (user scrolled past), cancel the animation frame. Resume when it re-enters. Prevents background CPU burn.

---

## Build Sequence

1. **Create `scripts/bubbles.js`** — canvas setup, `Bubble` class/objects, `resize` handler, draw loop skeleton
2. **Add physics loop** — velocity integration, wall bounce, damping, min/max speed
3. **Add mouse repulsion** — `mousemove` listener, per-frame force application
4. **Add bubble-bubble collision** — pair detection + elastic resolution
5. **Add squish spring** — deformation on collision, spring recovery, apply in draw
6. **Wire to `index.html`** — swap divs for canvas, add script tag
7. **CSS cleanup** — update `.brand-bubbles` canvas sizing; archive old `.brand-bubble` rules
8. **Guards** — `prefers-reduced-motion`, IntersectionObserver, mobile touch support (touchmove as mouse proxy)
9. **Tune constants** — open in browser, adjust `REPEL_FORCE`, `SQUISH_AMOUNT`, `SPRING_K` to feel right
10. **Asset swap** — placeholder for future: comment in `scripts/bubbles.js` showing where to plug in `drawImage` once PNGs/SVGs are ready

---

## Out of Scope (later)

- Three.js / WebGL shader effects (not needed at this scale)
- Bubble texture assets (user will create; code has the hook ready)
- Bubble trails or glow post-processing
- Gravity / attractor beyond mouse repulsion

---

## Risks

- **Canvas z-index vs hero content** — canvas must sit below the hero text (`z-index` lower than `.brand-hero-content`). Set `pointer-events: none` on canvas so mouse events pass through to links.
- **DPR scaling** — set `canvas.width = rect.width * devicePixelRatio` and `ctx.scale(dpr, dpr)` to prevent blur on retina displays.
- **Resize** — `ResizeObserver` on the hero section; re-map bubble positions proportionally on resize so they don't escape bounds.
