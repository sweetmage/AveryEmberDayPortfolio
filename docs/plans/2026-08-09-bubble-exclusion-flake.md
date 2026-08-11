# Bubble exclusion flake — measured cause and fix

**Date:** 2026-08-09
**Branch:** `develop`
**Item:** `TODO.md` → "The bubble flake survived Entry 115's fix"
**Failing specs:** `bubbles-exclusion › Contact form @ 1440px` (~1950px²),
`bubbles-exclusion › Projects tabs @ 768px` (~838px²)

## What the measurement says

Instrumented the live engine on `/contact/` at 1440x900 against the served export
(`tmp/diag-bubbles.mjs`, `tmp/diag-trap.mjs` — scratch, gitignored). Sampling every frame
**from page load** rather than after the spec's 300-frame settle, across 6 loads:

- **2–3 of the 7 global bubbles are seeded INSIDE an exclusion zone on every load.**
  `seedPosition` picks a uniform random point with only a `radius + 40` margin from the layer
  bounds. It has never consulted the exclusion zones.
- A bubble whose centre is inside a zone **does not get out**. Traced per frame, the net
  displacement produced by `resolveZoneCollisions` is **~0.4px, not the 8px the escape branch
  applies** — and 0.4px is just drift. Example (run 5): r=28 at `(618.0, 331.6)` inside the
  Contact form's padded zone `l=20 t=295 w=1400 h=458`, `dy = -0.45` per frame, unchanged for
  the whole window.
- Cause of the standstill: the 8px escape step moves the bubble toward the zone's nearest edge,
  and the **neighbouring zone just outside that edge pushes it straight back within the same
  frame** (the `dist < radius` branch resolves an overlap of up to a full radius). On the Contact
  page that neighbour is the intro `p` zone sitting directly above the form. Net motion ≈ 0.
- So the bubble sits **fully visible (opacity 1), fully inside the form, `_relocating: false`**
  for the entire 90-frame deadlock window (~1.5 s) before the rescue fires. Measured overlap
  **1839px²** — which is the "~1950px², a whole bubble not a graze" the TODO recorded.

**The recorded hypothesis was wrong.** The TODO and Entry 115 both pointed at the relocation
path (`_relocating` held ~560ms while a rescued bubble fades back in). Every trapped sample has
`_relocating: false` and `opacity: 1`. Relocation is the *recovery*, not the defect. It is
nevertheless left half-open by Entry 115's opacity guard and is fixed here too (Fix C).

Why it is intermittent: seeding is random, so whether a trapped bubble's 90-frame window overlaps
one of the spec's 6 sample frames is luck. That also explains why it is not specific to the
Contact form or to 1440px — any page with two adjacent zones and an unlucky seed does it, which
is exactly what the second recorded case (Projects tabs @ 768px) is.

## Fix

Three changes in `scripts/bubbles.js`, mirrored to `public/scripts/bubbles.js`.

**A. Seed clear of the exclusion zones.** `seedPosition` takes the zone list and rejects
candidates whose centre falls inside `zone ± radius`, bounded attempt count, falling back to the
plain random point so a dense page cannot hang the loop. Requires the zone tracker to have real
rects before the layers are constructed: `ExclusionZoneTracker`'s constructor calls `_update()`
directly instead of only scheduling one. Zones are viewport-space; the fixed layer is
document-space and the hero layer is container-local, so each layer is handed rects already
converted into its own space. This removes the initiating event.

**B. An escape step that beats a single opposing zone.** `ESCAPE_STEP` for a padded zone becomes
`b.radius + 8` instead of a flat `8`. A neighbouring zone can push back by at most one radius, so
net outward progress is ≥ 8px/frame in the sandwich case instead of ~0. Frame zones keep their
existing one-step ejection (`m + b.radius`). This preserves the glide's stated purpose — escape
reads as motion, not a pop, and the jump stays ≤ radius+8 rather than becoming a teleport across
the zone.

**C. Stop parking `_relocating` bubbles on the furniture.** `resolveZoneCollisions` currently
`continue`s past any relocating bubble, so for the ~250ms fade-out it is visible and deliberately
unpushed at the bad position — the hole Entry 115 papered over in the spec's opacity guard rather
than in the engine. Zone resolution now runs for relocating bubbles; only the rescue *trigger* is
skipped for them, so an in-flight relocation cannot stack a second one.

## Regression coverage

The existing specs settle 300 frames before sampling, which is precisely what hides this. Add to
`tests/bubbles-exclusion.spec.js`:

> **a bubble is never parked inside a zone, from the first frame** — sample every frame from load
> (no settle) and assert no visible bubble's centre stays inside a registered zone for more than a
> few consecutive frames.

A duration invariant on the actual defect, not an area tolerance. Pre-fix it reads ~90 consecutive
frames; post-fix it should read 0–2. Run at 1440px on `/contact/` and 768px on `/projects/`, the
two recorded failure cases.

## Verification

1. The new spec fails on the pre-fix engine (injected-regression proof by `git stash`).
2. `npx playwright test tests/bubbles-exclusion.spec.js` green.
3. Full `npm test` green **twice in a row** (house rule — one green run is not stability).
4. Re-run the frame-0 instrumentation on `/contact/` @1440 and `/projects/` @768: zero
   seeded-inside bubbles, zero frames with a visible centre inside a zone.

## Risks

- The visual gate captures under `prefers-reduced-motion`, where the engine creates nothing, so
  no baselines can move. If any do, something else changed.
- `_update()` in the tracker constructor runs a `querySelectorAll` sweep synchronously at init.
  One extra sweep at load; it already runs one per 250ms.
- Both copies of the engine must be updated — `scripts/bubbles.js` is the source, and
  `public/scripts/bubbles.js` is the copy the export actually serves.
