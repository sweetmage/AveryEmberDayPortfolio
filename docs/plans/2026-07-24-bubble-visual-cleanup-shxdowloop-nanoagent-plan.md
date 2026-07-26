# Bubble hero follow-up, visual gate defects, cleanup — shxdowloop Nanoagent plan

**Date:** 2026-07-24
**Branch:** `shxdowloop/2026-07-24/bubble-visual-cleanup` (from `portfoliowebsite` @ `641ed93`)
**Remote:** `origin` — pushed, tracking
**Mode:** Normal (unattended stage loop)
**Session model:** Opus 4.8 (main)

## Goal

Resolve three categories of open work from `TODO.md`:

1. **Bubble test flakiness** — `bubbles-exclusion › Projects tabs @768` fails under `fullyParallel` contention; it is the only test still using wall-clock waits between samples instead of frame-based sampling.
2. **Visual baseline gate defects** — three distinct issues: stale-content baselines written by `--update-snapshots`, partial-paint captures, and small-area changes passing silently due to `maxDiffPixelRatio` scaling with page height.
3. **Cleanup** — 360px nav-fit probe, `images/og-default.png` placeholder replacement or documentation, dead-code sweep.

Success = `npm test` green (including the previously flaky test in a full-suite run), `--update-snapshots` writes correct baselines, the gate catches a small injected change, and the tree is clean.

## Preflight results

| Check | Result |
|---|---|
| Workspace | read-write; `docs/`, `docs/plans/` ok |
| Branch/remote | `portfoliowebsite` in sync with origin (0/0); clean startup tree |
| npm | 11.12.1 |
| shxdowTracker | claude session 2%, weekly 27% → **binding 27%**, below the 80% native ban |
| nano-agents | available (`~/.codex/skills/nano-agents/scripts/nano-agent.sh`) |
| shxdowmap | no `docs/ARCHITECTURE.md` in this repo |

Degraded paths: none.

## Helper routing

Binding usage 27% → native permitted for the four reserved cases. Default nano-agent-first for all helper roles.

- **Main agent:** assertion-shape decisions (judgment calls), integration, final diff review, commits.
- **Flash nano-agents:** exploration, grep sweeps, dead-code inventory.
- **Pro nano-agents:** bounded implementation sidecars (e.g. the nav-fit probe script, the baseline-defect fixes).
- **Oracle-class:** final review per the standing contract — `verifier` @ fable while native is allowed and the ultracode gate passes.

## Parallel tracks

**Stage 1 (bubble flakiness)** and **Stage 2 (visual gate)** are independent and can run in parallel after a shared exploration phase. **Stage 3 (cleanup)** depends on neither and can run in parallel with both once Stage 1/2 exploration is done.

| Track | Scope | Files | Dependencies | Verification |
|---|---|---|---|---|
| Track A — Bubble flakiness | `tests/bubbles-exclusion.spec.js` | One file | None | `npx playwright test -g "Projects tabs @768"` passes standalone **and** in full suite |
| Track B — Visual gate defects | `tests/visual-baseline.spec.js`, `playwright.config.js`, `tests/global-setup.js` | 3 files | None | `--update-snapshots` writes correct dimensions; injected small change goes red |
| Track C — Cleanup | `app/` nav markup, `images/`, repo grep | Multiple | None | Nav-fit measurement recorded; zero `patriots` refs; og-default replaced or documented |

**Gate:** all three tracks must finish before the integration commit.

---

## Stage 1 — Bubble test flakiness

**Status:** Done — committed `15fe32d` (frame-based sampling). Held green in all 6 full-suite runs during Stage 2/3 verification on 2026-07-25.
**Goal:** The `Projects tabs @768` test is stable in full-suite runs.
**Phases:**
- [ ] 1.1 Reproduce the flake: run full suite 3×, log pass/fail for the tabs test
- [ ] 1.2 Convert the tabs test to frame-based sampling (matching the blob test's proven fix)
- [ ] 1.3 If the flake persists, add the test to a separate non-parallel project in `playwright.config.js`
- [ ] 1.4 Verify: 3 consecutive full-suite runs, tabs test green every time
**Helpers:** flash nano for reproduction data; main agent for assertion-shape decision
**Verification:** `npx playwright test` green 3× in a row
**Checkpoint:** commit + push after 1.4

## Stage 2 — Visual baseline gate defects

**Status:** Done 2026-07-25 (implementation from prior session; verified this session by a native builder agent)
**Outcome notes:**
- Root cause of the stale-content/ECONNRESET class: Playwright 1.61.1 starts `webServer`s before `globalSetup`, so the build's delete/recreate of `out/` orphaned the already-running `serve`. Fix: server moved into `globalSetup` (build → spawn → readiness probe → teardown).
- Second root cause found during verification: `spawn(..., { stdio: 'pipe' })` left the child's stdout undrained; `serve` logs every request, so after ~64KB the pipe filled and its event loop blocked — the suite died with 30 ERR_ABORTED failures. Fixed with `stdio: 'ignore'` (readiness probe covers diagnostics).
- `maxDiffPixelRatio: 0.001` → `maxDiffPixels: 500` absolute floor. Immediately surfaced the predicted latent drift: 4 baselines at 768px (projects light/dark 1014/1339px, projects-mistrust light/dark 1081/1413px) — the pre-documented tab-divider defect. Determinism confirmed across 2 runs, then re-baselined.
- Gate proof: injected `border-bottom: 2px solid red !important` on nav → ALL 40 visual snapshots red. Gotcha recorded: without `!important` the Tailwind utilities layer overrode the components-layer injection and the suite stayed green.
- Post-revert: 53/53 green twice; tabs test stable both runs.
**Goal:** `--update-snapshots` writes correct baselines; the gate catches small changes.
**Phases:**
- [ ] 2.1 Diagnose stale-content defect: probe the `globalSetup` → `webServer` timing gap
- [ ] 2.2 Fix stale-content: either a readiness probe post-build, or disable `reuseExistingServer` for the test server in local runs
- [ ] 2.3 Diagnose partial-paint defect: probe gallery image decode timing under `captureBeyondViewport`
- [ ] 2.4 Fix partial-paint: add `waitForLoadState('networkidle')` after decode, or force `captureBeyondViewport: false` for pages with lazy images
- [ ] 2.5 Fix small-area silent pass: add `maxDiffPixels: 500` absolute floor alongside `maxDiffPixelRatio: 0.001`
- [ ] 2.6 Prove the gate catches small changes: inject a 2px visual change, verify it goes red in at least one theme
- [ ] 2.7 Revert injection, run full suite twice unchanged to confirm no new flakiness
**Helpers:** pro nano for bounded implementation; main agent for integration
**Verification:** injected change → red; reverted → green twice; `--update-snapshots` writes correct dimensions
**Checkpoint:** commit + push after 2.7

## Stage 3 — Cleanup

**Status:** Done 2026-07-25 (same builder run as Stage 2 verification)
**Outcome notes:**
- 3.1 Nav-fit @360px: **0px slack** — Projects (70.0px) + Gallery (65.4px) already consume the full inner width. A fourth "Contact" label (~68px avg) would overflow by ~68–70px. Recorded in TODO.md; re-enabling Contact requires shrinking the 360px padding clamp or a drawer.
- 3.2 `images/og-default.png`: confirmed generated placeholder (Playwright-rendered template, LOGBOOK:1877); no final asset anywhere in repo. Remains a user-blocked item.
- 3.3/3.4 Dead code: zero live `patriots` refs (docs-history only), zero live `tests/baselines/` refs, zero unused imports in `app/` (contact `Link` removal already in tree). `next build` clean. Nothing to remove.
**Goal:** Quick wins from `TODO.md` Standalone.
**Phases:**
- [ ] 3.1 360px nav-fit probe: measure current three-label nav at 360px, document slack in plan and `TODO.md`
- [ ] 3.2 `images/og-default.png`: check if a final design asset exists in repo or user's file system; replace if found, otherwise document the blocker
- [ ] 3.3 Dead-code sweep: grep for `patriots`, old `tests/baselines/` references, unused imports in `app/`
- [ ] 3.4 Remove any found dead code; verify build still clean
**Helpers:** flash nano for grep/inventory; pro nano for bounded removal if safe
**Verification:** `next build` clean; zero grep hits for dead patterns
**Checkpoint:** commit + push after 3.4

## Stage 5 — Gallery filter rail (user request 2026-07-25)

**Status:** Done 2026-07-25 — implemented by a native builder after Stage 2/3 verification completed; all phases checked; 8 gallery baselines regenerated; full suite 53/53 twice; both-theme screenshots adjudicated by the main agent (1440 dark and 360 light PASS; lower-card blanks in the 360 capture were a lazy-load artifact of the scratch script, not the gate). Fresh-context verifier: PASS 6/6.
**Goal:** The gallery tag filter (`All | Digital | Traditional | Both`) renders as vertical tabs in a left side column, mirroring the Projects rail; the image grid flexes beside it at `lg+` and underneath at narrower widths.
**Approach:** Restructure `app/gallery/GalleryGrid.tsx` to the `ProjectTabs.tsx` layout skeleton: outer `lg:flex lg:items-start lg:max-w-[1400px] lg:mx-auto`, left `lg:w-[260px] lg:shrink-0` sticky (`lg:sticky lg:top-16`) column holding the filter buttons restyled from `.brand-chip` to `.project-tab` (+ `is-active`, keeping `aria-pressed` — these are filters, not tabs, so no `role="tablist"`), with `.brand-spectrum-bar .brand-tab-divider` between buttons; result count moves under the rail buttons. Below `lg` the filters fall back to a horizontal row above the grid (Projects' own breakpoint behavior). Grid keeps its column rules; card chips unchanged.
**Constraints:**
- The `gallery-filter-bar bubble-exclude` classes MUST stay on the filter container — `tests/bubbles-exclusion.spec.js:129-130` asserts zone registration and zero overlap against `.gallery-filter-bar`.
- Hash sync (`#filter=`) behavior unchanged.
- All gallery visual baselines (8/viewport set) will move — re-baseline, adjudicate dimensions against repeated-load measurement, then full-suite re-run before commit (mandatory habit per TODO.md).
**Phases:**
- [ ] 5.1 Implement rail layout in `GalleryGrid.tsx` (+ any small `brand.css` addition if `.project-tab` needs a gallery-rail variant)
- [ ] 5.2 Verify bubble exclusion test still green; verify 360/768/1024/1440 layouts
- [ ] 5.3 Re-baseline gallery snapshots, adjudicate, full-suite re-run green
**Verification:** `npm test` green; screenshots at 360/768/1440 adjudicated in both themes

## Stage 4 — Integration, docs, and review

**Status:** Pending
**Goal:** All tracks merged, docs updated, final review.
**Phases:**
- [ ] 4.1 Integrate all three tracks; resolve any conflicts
- [ ] 4.2 Run full suite: `npm test` twice in a row, green both times
- [ ] 4.3 Update `TODO.md`: mark completed items, update nav-fit measurement
- [ ] 4.4 Update `LOGBOOK.md`: new entry with stage outcomes, helper routes, verification
- [ ] 4.5 Pro nano shippability review
- [ ] 4.6 Oracle-class review (if binding < 80% and ultracode gate passes)
- [ ] 4.7 Main-agent final diff review
**Verification:** `npm test` green twice; `git status` clean after each run
**Checkpoint:** final commit + push

---

## Checkpoint log

| Stage | SHA | Push | Notes |
|---|---|---|---|
| pre | — | ✅ | branch created from `portfoliowebsite` @ `641ed93` |
| 1 | `15fe32d` | ✅ | frame-based sampling; held green 9+ full-suite runs |
| 2+3 | see git log | ✅ | gate fixes + verification evidence; cleanup probes (no code to remove) |
| 5 | see git log | ✅ | gallery filter rail + 8 baselines |
| 4 | see git log | ✅ | docs + reviews; verifier PASS 6/6 |

## Verification matrix

| Property | How proven |
|---|---|
| Bubble tabs test stable | 3 consecutive full-suite runs green |
| `--update-snapshots` writes correct baselines | Update run dimensions match repeated-load measurement |
| Gate catches small changes | Injected 2px change → red in at least one theme |
| No dead code | grep zero for `patriots`, stale baseline paths |
| Nav fit documented | 360px slack measured and recorded |

## Open risks

- The stale-content baseline defect may require a larger Playwright harness change (e.g. moving the build entirely out of Playwright and into a pre-test npm script). If so, it may be deferred as a genuine infrastructure task.
- The partial-paint fix may interact with `fullPage: true` captures in unexpected ways.
- If the bubble flake is not fixed by frame-based sampling, the honest fallback is to move the test to a non-parallel project or delete it (the deterministic bubble-vs-logo and zone-registration tests still provide coverage).

## Merge readiness checklist

- [x] Bubble tabs test passes 3 consecutive full-suite runs (9+ green runs)
- [x] `--update-snapshots` writes baselines matching repeated-load measurement (768px set: pixel counts identical across 2 runs)
- [x] Injected small change goes red (40/40 snapshots); reverted goes green
- [x] `npm test` green (full suite) twice in a row — twice over (post-revert and post-rail)
- [x] `next build` clean
- [x] Zero grep hits for `patriots`, stale baseline paths, unused imports (live code; docs history exempt)
- [x] Nav fit measured and documented (0px slack @360)
- [x] `TODO.md` / `LOGBOOK.md` / process plan consistent (Entry 099)
- [x] Shippability review passed (fresh-context verifier @ fable, PASS 6/6, independent 53/53 run)
- [x] Main-agent final diff review (GalleryGrid restructure, global-setup, config, spec tolerance, snapshots scope — all reviewed in-session)
