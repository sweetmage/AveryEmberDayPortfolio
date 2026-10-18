# SECTION 6 logo descriptions (shxdowloop)

## Goal

Replace the two per-logo descriptions on `/portfolio/section-6-logo-design/` with the user's wording
(2026-10-17), verbatim apart from a closing period on the Phoenix line:

- Phoenix: "A stencil symbol representing a revolutionary movement, ignited by the legendary hero, Phoenix."
- White Rose: "The logo of a morally ambiguous, large scientific research corporation."

## Preflight results and degraded paths

- Mode: Normal. Proceed: "Proceed from current branch" (2026-10-17).
- shxdowTracker: not installed on SOL in this shell (degraded); no usable telemetry, so no native subagents.
- Nano preflight: runtime opencode (paid), pro `opencode-go/deepseek-v4.1-flash`, cap 4.
- Deploy-on-push: only `portfoliowebsite` deploys to production (AGENTS.md, Netlify). This branch does not.
- ARCHITECTURE refresh skipped: a two-string copy edit needs no exploration.

## UI and UX mockup record

Mockup gate: declined, "Proceed from current branch". Copy-only change in existing paragraphs; layout
and components are untouched. The preflight question said "so I'm skipping the mockup step" and the
user proceeded, which is recorded here as the decline.

## Branch and remote

`shxdowloop/2026-10-17/section6-logo-descriptions` on `origin`, branched from
`shxdowloop/2026-10-16/fluid-squishy-bubbles` at `e6c110d` (user's choice), so it carries the four
unmerged bubble-engine commits.

## Helper routing

Binding provider Claude; telemetry missing, so the 95% native gate is closed. Edit and final diff
read: main agent. Plan review: one independent pro nano reviewer (opencode-go/deepseek-v4.1-flash),
read-only. Final signoff: not triggered (copy-only change, no signoff trigger).

## Parallel tracks

One work file (`app/portfolio/Section6Project.tsx`), so no track table.

## Stage 1 - Rewrite the descriptions

**Status:** Complete
**Goal:** Both paragraphs in `Section6Project.tsx` show the user's wording.
**Phases:**
- [x] 1.1 Replace the Phoenix paragraph (line 148-149) and the White Rose paragraph (line 161).
- [x] 1.2 Verify, LOGBOOK and TODO, checkpoint.
**Result:** tsc 0; build 0; export has the new strings, not the old; 8 section 6 baselines regenerated and reviewed (360 light, 1440 dark). Full suite, 3 runs: 243 passed, and the same 2 known webkit-mobile base failures (`focus-ring.spec.js:124`, `gallery-mockups.spec.js:119`; TODO) each time. LOGBOOK Entry 167.
**Helpers:** plan review (nano pro, read-only).
**Verification:** `npx tsc --noEmit`; `npm run build:next`; grep the built `out/portfolio/section-6-logo-design/index.html` for both new strings and the absence of the old ones. The copy change shifts the page's pixels, so regenerate the 8 `portfolio-section-6` visual baselines (`npx playwright test tests/visual-baseline.spec.js -g portfolio-section-6 --update-snapshots`), look at the regenerated PNGs, then run the full suite green twice in a row (AGENTS.md rule).
**Checkpoint:** pending
**Notes:** Only one stage; no stage boundary to justify.

**Proofread follow-up (2026-10-17, user's pick):** Phoenix "A stencil symbol for a revolutionary movement ignited by the legendary hero Phoenix, sprayed onto armor, flags and walls." White Rose "The logo of a large, morally ambiguous research corporation." Baselines regenerated again; LOGBOOK Entry 168.

## Helper roles and iteration stop conditions

Plan reviewer: one round. FINDINGS of a FAIL are fixed without another round.

Plan review result: PASS (agy, gemini-3.8-flash-high, after a void Codex attempt whose sandbox
blocked the file read and an OpenCode attempt that failed on an expired API key). Applied: the
visual-baseline step above, the mockup record wording, and `npm run build:next`.

## Checkpoint log

- Branch published at `e6c110d`.

## Verification matrix

| Check | Command | Expected |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0 |
| Build | `npm run build:next` | exit 0 |
| Output | grep the exported HTML | new strings present, old absent |
| Visual gate | `npm test` twice after re-baselining section 6 | green both runs |

## Open risks

- The branch includes the unmerged bubble-engine work; merging it ships both.

## Merge readiness checklist

- [x] Build passes
- [x] New copy present in the export
- [ ] User reviews before any merge to `portfoliowebsite` (production deploy)
