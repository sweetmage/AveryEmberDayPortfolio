# shxdowloop - Fluid, squishy, jitter-free bubbles

**Branch:** `shxdowloop/2026-10-16/fluid-squishy-bubbles` (published to `origin`, tracks it)
**Base:** `portfoliowebsite` @ `9f9f960`
**Handle / model:** Claude Opus 5.5, main agent (ShxdowCaptain)
**Mode:** Normal. Proceed given 2026-10-16: "yes proceed" (accepts the recommended choices below).

## Goal

Make the bubble physics on the site read as fluid and squishy, remove the jitter while scrolling,
and make pointer response feel immediate and physical. Keep every existing guarantee: protected
content is never covered, the picture is the wall, reduced motion shows nothing, the exclusion
list is unchanged, the two engine copies stay byte-identical.

## Decisions recorded at proceed

- Feel lab first: **yes** (recommended).
- Squish style: **jelly squish** via a transform-only deformation tensor (recommended). Lumpy
  border-radius outlines are not built.
- Extra interactions (grab-and-fling, tap-to-pop): **not built** (default off, not requested).

## Root causes found (read of `public/scripts/bubbles.js` @ 9f9f960)

1. Global layer is `position: fixed` and re-positions bubbles by `-scrollY` in rAF. The compositor
   scrolls the page before the main thread corrects, so bubbles lag one frame and snap: the jitter.
2. `ExclusionZoneTracker._update` runs on every `scroll` event: ~30 selectors of
   `getBoundingClientRect` per event, on the main thread, mid-scroll.
3. Scroll stir adds random `vx` noise per frame of scroll.
4. Integration is per frame with no `dt`: 120Hz screens run double speed, dropped frames hitch.
5. `triggerSquish` sets the deformed scale instantly (a pop), recovery is overdamped (no wobble),
   grazing contacts re-trigger every frame (flicker), and deformation is axis-aligned only.
6. `touchmove` sets the pointer and nothing clears it: a lifted finger repels forever.

## Preflight results and degraded paths

| Check | Result |
|---|---|
| Workspace | read-write, clean tree on `portfoliowebsite` |
| Remote | `origin` reachable |
| Push-triggered CI | none found |
| Deploy-on-push | branch pushes do not deploy: Netlify `allowed_branches` is `["portfoliowebsite"]` per `docs/deploys.md`; not re-verified against the live API |
| npm | 11.17.0, `node_modules` absent at start, `npm ci` run after proceed |
| Playwright WebKit | not installed at start, installed after proceed |
| shxdowTracker | **missing** (degraded): usage telemetry unavailable |
| nano-agents | wrapper available (`nano-agent.ps1`) |

## UI and UX mockup record

- Offer: "Feel lab first? I recommend yes" - answer: "yes proceed".
- Page: `docs/mockups/bubble-feel-lab.html` (Stage 0). Approval, 2026-10-16, verbatim:
  "Approve (Recommended)" (option text: "Build the engine with the lab's default settings.").
  Stage 2 ports the lab's proposed model with its `DEFAULTS` unchanged.

## Helper routing

- Provider binding: Claude. Telemetry: **missing** (no tracker) -> no native subagents.
- Main agent: all implementation, phase planning, and the final diff read.
- Nano: one independent Plan review per stage that has code work; Final signoff once at milestone
  close (engine behaviour change on a production site is a signoff trigger).
- T3 children: not used; no route the gate would allow adds value over the main agent here.

## Stage and phase outline

### Stage 0 - Feel lab mockup

**Status:** Complete, approved by the user. Soak in the lab: proposed model 0px² overlap with
protected content over 1500 frames with throws and scrolls; today's engine 916px² in the same run
(`docs/plans/fluid-squishy-bubbles/artifacts/lab-soak.json`).
**Goal:** A standalone page with the old model and the new model side by side, plus tuning sliders,
for the user to approve the feel before the engine changes.
**Forcing reason for the boundary:** owner gate (mockup approval).
**Files:** 1 (`docs/mockups/bubble-feel-lab.html`), no track table.

### Stage 1 - Baseline jitter probe

**Status:** Complete. Probe green (4/4), baseline recorded. Findings: html is
`scroll-behavior: smooth`, so probes must scroll with `behavior: 'instant'`.
**Goal:** A Playwright probe that scrolls real pages and records each bubble's on-screen path per
frame, run on the unchanged engine, with the numbers committed.
**Forcing reason for the boundary:** hard dependency. Stage 2's pass marks are set from these
measurements, and the "before" must be captured on unchanged engine code.
**Files:** 2 (`tests/bubbles-motion.spec.js`, `docs/plans/fluid-squishy-bubbles/artifacts/baseline.json`), no track table.
**Phases:**
- [x] 1.1 Probe: per-frame screen positions while wheel-scrolling, snap count (frame-to-frame
  screen displacement minus the bubble's own physics step above 4px), layout reads per scroll event
  (instrumented `getBoundingClientRect` count), long frames.
- [x] 1.2 Run against `9f9f960` engine, save artifact.

### Stage 2 - Engine rework

**Status:** Complete. Final signoff PASS (OpenCode, `opencode-go/gpt-6-luna`, frozen 8dacf4e, base 9f9f960, round 1 of 2); its three nits applied in the follow-up commit (architecture test count, layer-height wording, an automated pointer/squish/touch/hero-blob test). Plan review PASS (OpenCode, `opencode-go/deepseek-v4.1-flash`, frozen 50504e9;
Codex was at its usage limit). Its eight findings and the nits are applied below.
**Goal:** Port the approved lab model into the site engine and meet the pass marks.
**Forcing reason for the boundary:** reviewer check (milestone Final signoff) and the owner gate
(the user's review link, then a separate yes before any production push).
**Checkpoint cadence:** one commit at the end of Stage 2, plus one for signoff follow-ups if any.

The nine changes, as approved in chat on 2026-10-16:
1. Global bubbles live in page space, so the browser scrolls them with the content.
2. Zones measured in page coordinates on layout change only; fixed and sticky chrome in screen space.
3. Fixed 120Hz physics with interpolated rendering, independent of display rate.
4. Jelly squish: oriented, area-preserving deformation spring; impulse scales with impact speed.
5. Cushioned contacts inside the existing 24px buffer.
6. Organic drift currents instead of per-frame random kicks.
7. Scroll sway from smoothed scroll speed, no randomness.
8. Pointer: flick momentum, lean-away, release clears the pointer on touch.
9. Hero blobs get the fixed-rate clock, drift currents and jelly squish.

**Phases:**
- [x] 2.1 Page-space global layer (absolute, sized from `<html>`'s box height so it cannot feed
  its own size, `overflow: clip`), zones in page space with fixed/sticky chrome re-read in
  viewport space each frame, no rect reads in scroll handlers, `ResizeObserver` plus the existing
  250ms periodic refresh.
- [x] 2.2 Fixed-rate 120Hz substeps with interpolated render, substep cap. The frame clock is the
  timestamp passed to `_loop(t)`, never `performance.now()`, so the probe can drive it.
- [x] 2.3 Deformation tensor squish rendered as one `matrix()`. **Constraint:** the deformed
  element box (what `getBoundingClientRect` reports) stays at least `HARD_MARGIN` (4px) clear of the
  element rect of every padded zone. The 24px band is a soft cushion, not the guarantee. Bulge is
  capped at 14px beyond the radius.
- [x] 2.4 Cushioned contacts inside the padding band; frame zones (pictures) stay hard and tangent.
  Wedge rescue: a bubble pushed in opposing directions on consecutive steps, or shoved continuously
  for 2s, is relocated with a fade-in at a legal spot.
- [x] 2.5 Smooth drift currents; smoothed scroll sway without randomness.
- [x] 2.6 Pointer events with coalesced samples, velocity transfer, anticipatory lean; touch fed by
  passive touch events and cleared on touchend/touchcancel; cleared on leave and blur.
- [x] 2.7 Hero blobs: fixed-rate clock, drift currents and jelly squish only. **Their zone set
  (`heroContentRects()`) and the soft steering force stay exactly as they are**; they never go
  through the shared hard resolver.
- [x] 2.8 Tests and docs: motion spec asserts the pass marks; a webkit-mobile lockstep case for the
  page-space layer; existing suite green; `npm run css:build` and the rebuilt `style.css`
  committed; AGENTS.md, ARCHITECTURE, LOGBOOK, TODO.

**Frozen engine surface** (tests read these; they keep their meaning):
`window.__bubbleEngine` with `running`, `rAF`, `_loop(t)`, `destroy()`; `zones.rects` as a
viewport-space array, padded for normal zones and exact with `frame: true` for pictures;
`globalLayer.bubbles[i]` with `.el` and current (not interpolated) `.x`/`.y` in document space;
`_relocating` true only while a relocated bubble is invisible.

**Parallel tracks** (concurrency cap 1: main agent only, no native helpers while telemetry is missing):

| Track | Scope | Depends on |
|---|---|---|
| A | `scripts/bubbles.js` engine rework (2.1-2.7); this is the source copy per AGENTS.md | Stage 0 approval |
| B | `brand.css` layer positioning, then `npm run css:build` -> `style.css` | A |
| C | `public/scripts/bubbles.js`, byte copy of A | A |
| D | `tests/bubbles-motion.spec.js` asserts, `playwright.config.js` webkit-mobile match, comment updates in `tests/bubbles-exclusion.spec.js` | A, C |
| E | `AGENTS.md`, `docs/ARCHITECTURE.md`, `LOGBOOK.md`, `TODO.md` | A, D |

**Verification:** probe pass marks on chromium; webkit-mobile lockstep case; full suite on
chromium and webkit-mobile; `cmp` of the two engine copies; `npm run build:next`; reduced-motion
check (engine creates nothing); manual feel check via the local export link.

**Final signoff:** once, over `9f9f960..HEAD`, read-only nano pro reviewer pinned via
`NANO_AGENTS_RUNTIME` (OpenCode while Codex is limited), `--timeout 1200`, round budget 2 (a FAIL
buys the second round).

## Pass marks (Stage 2), set from the Stage 1 baseline

Baseline: `docs/plans/fluid-squishy-bubbles/artifacts/baseline.json`, engine @ 9f9f960, chromium,
`/portfolio/` at 1440x900, measured by `tests/bubbles-motion.spec.js`.

| Check | Baseline | Target |
|---|---|---|
| Lag behind a 300px scroll before the engine runs (mean px) | 300 | <= 0.5 |
| Layout reads per scroll event | 49.5 | <= 1 |
| Travel per simulated second, ratio 120Hz / 60Hz | 2.00 | 0.95 to 1.05 |
| Page-space jerk p99 while scrolling (px/frame^2) | 0.51 | <= 1.0 |
| Long animation frames during the scroll probe | 0 | 0 |
| Existing suite | green | green |

Change from the proposal: "snaps over 4px" is replaced by the lag row and the p99 row. The probe
showed the snap is not visible to the DOM while the engine runs: it lives in the gap between the
compositor's scroll and the next engine frame, which the paused-engine lag row measures directly.
A real bounce also exceeds 4px/frame^2 by design, so a raw snap count would penalise squish.

## Stage 2 results

Measured by `tests/bubbles-motion.spec.js`, chromium, `/portfolio/` at 1440x900. "Before" is the
engine at 9f9f960 re-measured with the time-based jerk metric (`artifacts/baseline-timebased.json`);
"after" is this engine (`artifacts/after.json`).

| Check | Before | After | Target |
|---|---|---|---|
| Lag behind a 300px scroll, engine paused (px) | 300 | 0 | <= 0.5 |
| Layout reads per scroll event | 50.1 | 0.32 | <= 1 |
| Jerk p99 while scrolling (px/frame^2, time-based) | 2.90 | 0.16 to 0.37 | <= 1.0 |
| Snaps over 4px while scrolling | 5 | 0 | - |
| Travel ratio 120Hz / 60Hz | 2.00 | 1.0001 | 0.95 to 1.05 |
| Long frames caused by the engine | 0 | 0 | 0 |
| Engine cost per frame, mean (ms) | 0.13 | 0.20 | - |

The jerk metric changed during Stage 2: the per-frame second difference read 2.06 for the new engine
under full-suite load because a time-based engine correctly moves further in a longer frame. It now
uses the real frame timestamps; at a steady 60fps the two are identical, and the old engine was
re-measured with it (0.51 became 2.90 for the same reason in reverse).

Verification:
- `bubbles-motion.spec.js`: 5/5 (4 chromium + the webkit-mobile lockstep case), then 20/20 with
  `--repeat-each 4`.
- Full suite, third run after the Contact fix: 241 passed; failures only the two WebKit specs that
  also fail at 9f9f960 on SOL (`focus-ring.spec.js:124`, `gallery-mockups.spec.js:119`), plus one
  visual snapshot that passed on retry (reduced motion, engine off).
- Contact @1440 zero-overlap failed once in the second full run. Instrumented: relocation demanded
  the full soft padding and found no free point on a page that is almost entirely zone, so wedged
  bubbles stayed visible. Fixed (immediate relocation against the hard rule, park-and-retry);
  re-instrumented 6 loads x 600 frames: 0 overlapping frames; 0 bubbles parked on any page/width.
- `--repeat-each 3` load runs: `gallery-expand` filter-diagonal tests failed 3 of 12 on this branch,
  0 of 6 on 9f9f960. Measured the view-transition start after a click, 10 trials each: none 65ms,
  old 67ms, new 69ms mean, spread 54-79ms for all three; the test waits a fixed 60ms. Recorded in
  TODO as a test-timing item, not an engine regression.
- WebKit (Playwright, Windows) renders the site at ~4fps with either engine and 62fps with reduced
  motion; the lockstep case settles 3 frames there.
- Pointer: a sweep through a bubble took it from 24 to 446px/s in the sweep direction with 0.155
  deformation; a touchend clears the pointer.
- `cmp scripts/bubbles.js public/scripts/bubbles.js`: identical. `npm run css:build`: one rule changed.

## Checkpoint log

| Stage | Commit | Push |
|---|---|---|
| 0 + 1 | 70985ab (lab, probe, baseline) | pushed |
| 0 approval | 50504e9 | pushed |
| 2 | 8dacf4e | pushed |
| signoff nits | (this commit) | pushed |

## Open risks

- Squish versus the zero-overlap specs: the hard guarantee checks the deformed box against the element rect.
- Absolute layer height must track document growth (lazy images, expanding gallery cards).
- Phone stacking: the layer sits behind content below 768px (`z-index: -1`); verify unchanged.
- iOS rubber-band overscroll with a page-space layer: covered by the webkit-mobile lockstep case; overscroll itself is checked by hand on the phone link.

## Merge readiness checklist

- [x] Feel lab approved by the user
- [x] Pass marks met, evidence in artifacts
- [x] Full suite green on chromium and webkit-mobile, except two WebKit specs that fail at the base commit too
- [x] Engine copies identical
- [x] Final signoff PASS
- [ ] User reviewed via local link; production push is a separate yes
