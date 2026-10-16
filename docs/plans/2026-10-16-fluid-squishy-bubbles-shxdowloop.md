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
- Page: `docs/mockups/bubble-feel-lab.html` (Stage 0). Approval: **pending** until the user answers.
  Engine changes (Stage 2) do not start until the page is approved.

## Helper routing

- Provider binding: Claude. Telemetry: **missing** (no tracker) -> no native subagents.
- Main agent: all implementation, phase planning, and the final diff read.
- Nano: one independent Plan review per stage that has code work; Final signoff once at milestone
  close (engine behaviour change on a production site is a signoff trigger).
- T3 children: not used; no route the gate would allow adds value over the main agent here.

## Stage and phase outline

### Stage 0 - Feel lab mockup

**Status:** Built, awaiting approval. Soak in the lab: proposed model 0px² overlap with
protected content over 1500 frames with throws and scrolls; today's engine 916px² in the same run.
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
- [ ] 1.1 Probe: per-frame screen positions while wheel-scrolling, snap count (frame-to-frame
  screen displacement minus the bubble's own physics step above 4px), layout reads per scroll event
  (instrumented `getBoundingClientRect` count), long frames.
- [ ] 1.2 Run against `9f9f960` engine, save artifact.

### Stage 2 - Engine rework

**Status:** Pending (blocked on Stage 0 approval)
**Goal:** Implement the nine changes in the approved plan and meet the pass marks.
**Phases:**
- [ ] 2.1 Page-space global layer (absolute, sized to the document, `overflow: clip`), zones in
  page space with fixed/sticky chrome kept in viewport space, no rect reads on scroll,
  `ResizeObserver` + slow periodic refresh. `zones.rects` stays a viewport-space view for tests.
- [ ] 2.2 Fixed-rate 120Hz substeps with interpolated render, substep cap.
- [ ] 2.3 Deformation tensor squish: impulse from normal impact speed, underdamped spring,
  volume-preserving, oriented, velocity stretch, rendered as one `matrix()`. Bulge capped below
  `ZONE_PADDING` so padded zones still hold zero overlap.
- [ ] 2.4 Cushioned contacts inside the padding band; frame zones stay hard.
- [ ] 2.5 Smooth drift currents; smoothed scroll sway without randomness.
- [ ] 2.6 Pointer events with coalesced samples, velocity transfer, anticipatory lean, cleared on
  release/cancel/leave.
- [ ] 2.7 Hero blobs on the same model.
- [ ] 2.8 Tests: motion spec asserts the pass marks; existing suite green; docs.

**Parallel tracks:**

| Track | Scope | Depends on |
|---|---|---|
| A | `public/scripts/bubbles.js` engine rework (2.1-2.7) | Stage 0 approval |
| B | `brand.css` global layer positioning | A (same behaviour, one change) |
| C | `scripts/bubbles.js` copy | A (byte copy after A) |
| D | `tests/bubbles-motion.spec.js` pass-mark asserts, `tests/bubbles-exclusion.spec.js` comment updates | A (reads engine API) |
| E | `AGENTS.md`, `docs/ARCHITECTURE.md`, `LOGBOOK.md`, `TODO.md` | A, D |

All tracks run on the main agent (no native helpers, telemetry missing); serialization is as encoded.

**Verification:** probe pass marks; `npx playwright test` full suite (chromium + webkit-mobile);
`diff` of the two engine copies; `npm run build:next`; reduced-motion check; manual feel check via
local export link.

## Pass marks (Stage 2), set from the Stage 1 baseline

Baseline: `docs/plans/fluid-squishy-bubbles/artifacts/baseline.json`, engine @ 9f9f960, chromium,
`/portfolio/` at 1440x900, measured by `tests/bubbles-motion.spec.js`.

| Check | Baseline | Target |
|---|---|---|
| Lag behind a 300px scroll before the engine runs (mean px) | 300 | <= 0.5 |
| Layout reads per scroll event | 49.5 | <= 1 |
| Travel per simulated second, 120Hz / 60Hz | 2.00 | 0.95 to 1.05 |
| Page-space jerk p99 while scrolling (px/frame^2) | 0.51 | <= 1.0 |
| Long animation frames during the scroll probe | 0 | 0 |
| Existing suite | green | green |

Change from the proposal: "snaps over 4px" is replaced by the lag row and the p99 row. The probe
showed the snap is not visible to the DOM while the engine runs: it lives in the gap between the
compositor's scroll and the next engine frame, which the paused-engine lag row measures directly.
A real bounce also exceeds 4px/frame^2 by design, so a raw snap count would penalise squish.

## Checkpoint log

| Stage | Commit | Push |
|---|---|---|
| - | - | - |

## Open risks

- Squish bulge versus the zero-overlap specs: bulge is capped below the 24px padding.
- Absolute layer height must track document growth (lazy images, expanding gallery cards).
- Phone stacking: the layer sits behind content below 768px (`z-index: -1`); verify unchanged.
- iOS rubber-band overscroll with a page-space layer.

## Merge readiness checklist

- [ ] Feel lab approved by the user
- [ ] Pass marks met, evidence in artifacts
- [ ] Full suite green on chromium and webkit-mobile
- [ ] Engine copies identical
- [ ] Final signoff PASS
- [ ] User reviewed via local link; production push is a separate yes
