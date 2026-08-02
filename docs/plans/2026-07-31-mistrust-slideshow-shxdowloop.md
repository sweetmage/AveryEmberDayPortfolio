# shxdowloop — A History of Mistrust slideshow redesign

**Invoked:** 2026-07-31 · `shxdowloop do all 3 then show me on my browser how it looks`
**Design plan (what to build):** [`2026-07-31-mistrust-slideshow-redesign.md`](./2026-07-31-mistrust-slideshow-redesign.md)
**This doc:** the process record — stages, checkpoints, verification, decisions.

## Goal

Implement Tracks A, B, C of the design plan: a single swipeable slide stage with a
Set 1/2/3 switcher and thumbnail filmstrip, a React lightbox port, and a 30-thumb grid
replacing the three stitched "All Slides" images. Finish by showing the result in the
user's browser.

## Preflight results

| Check | Result |
|---|---|
| Workspace | read-write; `docs/plans:ok` |
| npm | 11.12.1 |
| Remote | `origin` = `sweetmage/AveryEmberDayPortfolio`, reachable |
| Branch | **`slides`** (user-named), off `develop` @ `81040a7`. Not protected — satisfies the never-work-on-develop rule. No upstream. |
| Dirty (user-owned, not staged) | `tsconfig.tsbuildinfo` (tracked build artifact), `.shxdowmap/` (belongs to the unmerged architecture-map branch) |
| shxdowTracker | claude session **77%**, weekly 13% → binding **77%**, 3 points under the 80% native ban |
| Codex | 0% / 0% — available as a fallback route |
| nano-agents | available (`nano-agent.ps1`, Windows) |
| Dev server | not running at preflight |

**Degraded paths:** this session's config bars Agent-tool dispatch absent an explicit
request, and binding usage is likely to cross the 80% native ban mid-run. Routing is
**nano-first / main-agent-owned** throughout; native subagents are treated as unavailable.

## Branch and remote

`slides`, local only. **Commit-only — no push** (user-selected at the preflight gate).
No production deploy occurs in this run; the `pre-push` guard blocks `portfoliowebsite`
regardless, and the Netlify credit pool is exhausted until 2026-08-06.

## Helper routing

- Main agent: all planning, integration, diff review, verification, commits.
- Pro nano-agent: bounded sidecars and the stage shippability check, where useful.
- Native subagents: **not used** (session config + imminent 80% ban).
- Oracle-class review contract: falls to the non-native rungs; recorded per stage.

## Parallel tracks

Tracks A / B / C touch disjoint files and share only the already-landed gate
(`mistrustSlides.ts`, `useSwipeDeck.ts`). Run as three sequential stages here — the
integration point (`MistrustProject.tsx`, `page.tsx`) is shared, and a single agent
integrating serially is cheaper than reconciling three sidecar diffs.

## Stage outline

## Stage 0 — Gate (already complete, pre-loop)

**Status:** Complete
**Goal:** Land the shared contract both other tracks import.
**Phases:**
- [x] 0.1 `app/projects/mistrustSlides.ts` — typed slide data, 30 alt strings verbatim
- [x] 0.2 `app/projects/useSwipeDeck.ts` — gesture hook + `useReducedMotion`
**Verification:** `npx tsc --noEmit` exit 0; SLIDE_ALT machine-diffed against the pre-port
array — 30/30 identical; set title cards confirmed at 1 / 11 / 21.
**Checkpoint:** folded into Stage 1's commit (uncommitted at loop start).

## Stage 1 — Stage + swipe (Track A)

**Status:** Complete
**Goal:** One 860px stage with finger swipe, animated Prev/Next, set switcher, filmstrip.
**Phases:**
- [x]  `MistrustSlideshow.tsx` — switcher, stage, controls, filmstrip, live region
- [x]  `.mistrust-*` rules in `slideshow.css`, `touch-action: pan-y` on the stage
- [x]  Wire into `MistrustProject.tsx`, replacing the three `.set-slideshow` widgets
**Constraint:** new markup MUST stay inside a `.project-section` wrapper — that selector
is the bubble-engine exclusion zone (`scripts/bubbles.js:72`).
**Verification:** `npx tsc --noEmit`; dev-server manual swipe/tap/keyboard pass.
**Checkpoint:** _pending_

## Stage 2 — Lightbox port (Track B)

**Status:** Complete
**Goal:** React-owned lightbox; delete the vanilla script and the global-DOM hack.
**Phases:**
- [x]  `MistrustLightbox.tsx` — same `useSwipeDeck` hook over all 30 slides
- [x]  Remove the static lightbox markup from `page.tsx`
- [x]  Remove `closeLightbox()` + call from `ProjectTabs.tsx`
- [x]  Delete `public/scripts/history-of-mistrust-slideshow.js`, `SlideshowScript.tsx`
**Verification:** focus trap, Esc, arrows, swipe, scroll lock, focus restore on close.
**Checkpoint:** _pending_

## Stage 3 — Grid, wire-up, full verification (Track C + D + E)

**Status:** Complete
**Goal:** 30-thumb grid, docs sync, green suite, browser demo.
**Phases:**
- [x]  `SlideGrid.tsx` replacing the three `.carousel-set` stitched images
- [x]  `AGENTS.md` — move the `SLIDE_ALT` pointer to `mistrustSlides.ts`
- [x]  `npm run css:build`, commit regenerated `style.css`
- [x]  `npm run build:next` (dev stopped first — `distDir` is `out`)
- [x]  `npm test`; re-baseline the 8 `projects-mistrust` snapshots per-test; Brand-tab
      snapshots must stay byte-identical
- [x]  `node scripts/measure-content-widths.js` exit 0
- [x]  LOGBOOK entry + TODO condense
- [x] 3.8 Dev server + Chrome for the user — done 2026-08-01
**Checkpoint:** complete — merged to `develop` as `152cf2f`

## Verification matrix

| Check | Command | Gate |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0 |
| Build | `npm run build:next` | exit 0, dev stopped |
| CSS | `npm run css:build` | 3 consecutive byte-identical builds |
| Suite | `npm test` | green **twice in a row** |
| Geometry | `node scripts/measure-content-widths.js` | exit 0 |
| Bubbles | `tests/bubbles-exclusion.spec.js` | green; serial config untouched |
| Manual | swipe / tap / keys / reduced-motion / 360·768·1440·2560·3440 × 2 themes | written verdict |

## Open risks

- 8 visual snapshots (`projects-mistrust` × 4 breakpoints × 2 themes) will legitimately
  change; the 8 Brand-tab ones must not. Per-test `--update-snapshots` only.
- Bulk snapshot updates have silently skipped files twice (Entry 082) — verify by
  re-running, never by mtime.
- `docs/ARCHITECTURE.md` does not exist on `develop`; its diagram on the unmerged
  architecture-map branch names the script this run deletes. Flagged for whoever merges.
- Binding usage at 77% and climbing; a mid-run handoff note is possible at ≥85%.

## Checkpoint log

| Stage | SHA | Push | Notes |
|---|---|---|---|
| 1+2 | `c2e0838` | commit-only (user choice) | Stage/lightbox landed together — shared integration files. Spec found 2 real defects, both fixed in-run (visibility-transition focus no-op; below-fold mouse drag in the test helper). |
| 3 | this commit | commit-only (user choice) | Grid landed in c2e0838; this checkpoint = AGENTS.md pointer, smoke-next fix, 8 re-baselined snapshots, LOGBOOK 109, TODO, suite 67/67 ×2, geometry exit 0, css ×3 identical. |

## Merge readiness checklist

- [x] Full suite green twice
- [x] 8 re-baselined PNGs individually reviewed (per-test updates; 1440-dark + 360-light inspected, zero Brand-tab drift)
- [x] `style.css` regenerated and committed — ×3 byte-identical builds; the diff vs the old commit is the class-scan picking up the replaced markup
- [x] AGENTS.md `SLIDE_ALT` pointer updated
- [x] LOGBOOK Entry 109 landed, TODO updated
- [x] User has seen it in the browser — 2026-08-01, reviewed and merged (`152cf2f`)
