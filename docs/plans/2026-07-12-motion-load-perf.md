# Motion + Interactivity Load Performance

**Date:** 2026-07-12
**Branch:** `portfoliowebsite`
**Status:** Implemented 2026-07-12 (LOGBOOK Entry 072)
**Scope:** Next.js static-export build (the shipping surface). Legacy `index.html` / `projects/*.html` / `gallery/gallery.html` are not deployed and are excluded.

---

## Goal

Reduce the time between navigation and first interactive motion on the portfolio site. Concretely, three complementary targets:

1. **TTFP → LCP:** shorten first paint and hero-image LCP by removing render-blocking chains and prioritising the hero logo.
2. **LCP → first bubble frame:** get the physics engine's first rendered frame as early as safely possible after LCP without blocking LCP itself.
3. **Steady-state cost:** cheaper per-frame work so weaker devices actually hit 60 fps instead of stuttering and looking "laggy on load."

Non-goal: rewriting the physics engine, replacing Tailwind, or migrating off DOM-based bubbles. This is optimisation, not architecture.

---

## Approach

The engine (`scripts/bubbles.js`) is already gated on hydration via `BubblePhysics.tsx`'s `useEffect`, so it does not block LCP. The wins are:

- **Push it slightly later** on cold loads so it doesn't compete with LCP paint, using `requestIdleCallback` (with a `setTimeout` fallback) inside the effect.
- **Prioritise LCP assets** with `fetchpriority="high"` on the hero logo and lazy-load below-the-fold thumbnails.
- **Cache per-frame layout reads** in the rAF loop so steady-state motion is smoother.
- **Trim dead motion CSS** so `style.css` is smaller and the compositor promotes fewer layers.
- **Honour `prefers-reduced-motion` on smooth-scroll** (missed by prior passes).

Each step is independently valuable and reversible; ship them as small commits so any visual regression narrows fast.

---

## Steps

### 1. Defer engine init to idle time
**File:** `app/components/BubblePhysics.tsx`

Wrap the script append in `requestIdleCallback` (fallback `setTimeout(fn, 0)`). Add a `data-priority="low"` marker and set the created `<script>`'s `async = true` explicitly (default is true for dynamically-created scripts, but being explicit documents intent). Keep the teardown path.

```tsx
useEffect(() => {
  let script: HTMLScriptElement | null = null;
  const start = () => {
    script = document.createElement('script');
    script.src = '/scripts/bubbles.js';
    script.async = true;
    script.dataset.priority = 'low';
    document.body.appendChild(script);
    scriptRef.current = script;
  };
  const ric = (window as any).requestIdleCallback;
  const handle = ric ? ric(start, { timeout: 1500 }) : window.setTimeout(start, 0);
  return () => {
    if (ric && typeof handle === 'number') (window as any).cancelIdleCallback?.(handle);
    else window.clearTimeout(handle);
    if ((window as any).__bubbleEngine) {
      (window as any).__bubbleEngine.destroy();
      delete (window as any).__bubbleEngine;
    }
    if (scriptRef.current?.parentNode) {
      scriptRef.current.parentNode.removeChild(scriptRef.current);
    }
  };
}, []);
```

Cheap, contained, and lets LCP win the network race on constrained connections.

### 2. Cache per-frame layout reads in the rAF loop
**File:** `scripts/bubbles.js` (`PhysicsEngine._loop`, `HeroBlobLayer.step`)

Right now, every frame calls:
- `this.heroLayer.container.getBoundingClientRect()` (line 864)
- Rebuilds `zonesLocal` by mapping every zone (line 869-874)
- `HeroBlobLayer` calls `getBoundingClientRect()` on `.brand-hero-blobs` (line 662)

These only change on scroll or resize. Add cached values on the engine + hero-blob layer, invalidate on:
- `window.resize` (already listened for by `ExclusionZoneTracker`; add a shared callback)
- `window.scroll` (passive)
- `visibilitychange` returning to visible (bounds may have shifted)

Concretely:
- On `PhysicsEngine` construction, initialise `this._heroRect = null`, add `_invalidateBounds()` that sets it to null, and hook it to `resize` and `scroll` (passive).
- In `_loop`, compute `this._heroRect ??= this.heroLayer.container.getBoundingClientRect()`. Same for `zonesLocal` — but that also depends on `this.zones.rects`, which the zone tracker already rebuilds on scroll/resize. Add a lightweight version stamp on the zone tracker (`this.version++` inside `_update`), cache the mapped `zonesLocal` alongside its source version, invalidate when versions diverge.
- Apply the same cache pattern to `HeroBlobLayer` for the container rect.

Correctness check: bubbles never depend on transient sub-frame layout — repel/collision work on positions the engine owns. Rects are pure "where is the window" data. Safe.

### 3. Gate the hero-blob layer on visibility
**File:** `scripts/bubbles.js` (`PhysicsEngine` constructor + `_loop`)

`heroLayer` is already gated by an IntersectionObserver on `#hero`. `heroBlobLayer` isn't — `heroBlobLayer.step()` runs every frame regardless. Reuse the same observer state: skip `heroBlobLayer.step()` when `heroLayer.active === false`. Zero risk (blobs are only inside the hero).

### 4. Prioritise LCP images, lazy-load the rest
**File:** `app/page.tsx`, plus any other page that shows the hero mark and below-the-fold work thumbnails.

Convert the hero logo to `next/image` with `priority` (which emits `fetchpriority="high"` + `preload`). Requires `import Image from 'next/image'` at the top of the page. If it stays as a plain `<img>`, add `fetchpriority="high"` + `decoding="async"` + explicit `width` / `height` instead.

For the project-card thumbnails below the fold (currently eager per the audit): switch to `next/image` with default lazy behaviour, or add `loading="lazy" decoding="async"` on the plain `<img>`. Especially important for the ~426 KB `FacesFinal.webp`.

Verify with a Lighthouse mobile run before/after: LCP should drop and the total blocking bytes on cold load should fall meaningfully.

### 5. Honour `prefers-reduced-motion` for smooth-scroll
**Files:** `app/components/ReturnToTop.tsx`, any other `scrollTo` / `scrollIntoView` callers, and `src/css/site.css` (line ~44 — where `html { scroll-behavior: smooth }` actually lives; `app/globals.css` imports it).

- Wrap the existing `html { scroll-behavior: smooth }` rule with `@media (prefers-reduced-motion: no-preference) { ... }`, or add a `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }` guard immediately after it. Editing at the source keeps specificity clean.
- In JS scroll callers, read `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and use `behavior: 'auto'` when true.

This is correctness, not perf, but it's on the same code path and cheap to ship in the same PR.

### 6. Remove dead motion CSS
**File:** `brand.css` (project root — `src/css/brand.css` does not exist; `src/css/components.css` holds a stale duplicate copy but is not imported by any build entry and can be ignored or deleted separately). Check the compiled `style.css` diff after `npm run build:css`.

Remove keyframes never referenced by any `animation:` rule:
- `brand-blob-morph-1` through `brand-blob-morph-5`
- `brand-float-1` through `brand-float-5`

Also drop `will-change: transform, opacity` on `.brand-bubble` (line ~1177) — every rendered bubble also carries `.brand-bubble-physics`, which already declares `will-change: transform`. Two `will-change` rules on the same element promote the same layer twice in some engines; consolidating avoids waste.

Verify no visible change with a Playwright baseline run.

### 7. Verify with the existing Playwright suite
**Command:** `npm test`

The suite is 40 visual baselines (`tests/*.spec.js`) plus a smoke interaction spec. Motion is exercised. Any visual delta from steps 1–6 shows up as a diff.

If diffs appear:
- If they're the expected LCP/lazy behaviour (thumbnails not yet decoded at capture time), the fix is Playwright-side: add `await page.waitForLoadState('networkidle')` (or a `page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? null : new Promise(r => (i.onload = i.onerror = r)))))` shim) before the screenshot, then re-baseline once. Note the change in the LOGBOOK entry.
- Otherwise stop and investigate before continuing.

---

## Testing

- `npm run build:css` — sanity check the compiled CSS after step 6, commit the rebuilt `style.css`.
- `npm run build` (via `next build`) — confirm the static export still succeeds.
- `npm test` — Playwright visual + smoke.
- Manual: `npm run serve` (or `next start` against `out/`), open with DevTools Performance tab, record a cold-load trace on the home page. Compare:
  - **LCP timing** (target: no regression vs current, hopefully lower once step 4 lands).
  - **First `requestAnimationFrame` from the bubble engine** relative to LCP (should slide slightly later post-step-1, but total user-visible time-to-motion should be unchanged or better because LCP is faster).
  - **Long tasks during LCP window** (should be fewer once engine init is idle-scheduled).
- Lighthouse mobile run before + after — LCP, TBT, and CLS numbers noted in the LOGBOOK entry.

---

## Risks

- **Cached `heroRect` staleness on layout mutations that aren't scroll/resize** (e.g., a font load that shifts the hero, a lazy-loaded image reflowing the header). Mitigation: also invalidate the cache when a `ResizeObserver` on `.brand-nav` / `#hero` fires. If ResizeObserver bloat is a concern, keep the simpler scroll+resize invalidation and accept one frame of stale rect on rare reflows.
- **`requestIdleCallback` doesn't exist in Safari** until fairly recent versions. The 1500 ms `setTimeout` fallback keeps behaviour bounded; verify Safari fires the fallback promptly.
- **Removing `will-change` from `.brand-bubble`** — safe as long as physics-class always applies. Confirm `bubbles.js:173` (BubbleLayer applies both classes on create). Audit gallery/other pages for any `.brand-bubble` used outside the physics engine before removing.
- **Deleting keyframes** — `brand-blob-morph-*` and `brand-float-*` are referenced only by the defensive `animation:` strip logic in the `HeroBlobLayer` **constructor** (`scripts/bubbles.js` lines ~594-608, not `_syncBoundsAndScale`). That code path becomes a no-op after the keyframes are gone, which is fine, but leave a code comment in the constructor noting the keyframes have been removed so no one wonders what it's stripping.
- **Netlify CSP** — none of these changes add inline scripts or new external origins, so CSP should be unaffected. Verify after deploy.
