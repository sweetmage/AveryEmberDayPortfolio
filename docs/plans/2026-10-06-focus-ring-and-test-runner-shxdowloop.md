# shxdowloop: focus rings everywhere, and a test runner that runs whole (2026-10-06)

**Agent:** Opus 5.5 (fennel, main) · **Mode:** Normal, unattended after the user's Proceed
**Branch:** `shxdowloop/2026-10-06/focus-ring-and-test-runner` (from `portfoliowebsite` @ `e3e5fa7`,
pushed with `-u`; Netlify deploys only `portfoliowebsite`, and a check of the builds API after the
push showed no new build)

## Goal

Close two TODO items without touching the unreleased Portfolio work:

1. Every focusable element paints the 2px `--brand-accent` focus ring the moment it is focused
   (AGENTS.md focus contract).
2. A bare `npx playwright test` runs on any checkout, and the Google Docs unit tests run under their
   own runner without the user-owned allow-list.

## Preflight results

- Workspace read-write; branch clean; `origin` reachable; npm ok; nano-agents available.
- Usage (shxdowTracker): Claude 15% session / 46% weekly, Codex 0% / 12%. Both below 95% → native
  helpers preferred.
- Deploy-on-push: `portfoliowebsite` deploys; this loop branch does not (Netlify `allowed_branches`
  is `["portfoliowebsite"]`, confirmed by the builds API after the first push).

## What was measured before planning

A Tab-walk audit of all five pages in both themes (real Tab presses, 1440px):

- **82 `.sources-list` links** on `/portfolio/history-of-mistrust/` paint `auto 1px rgb(0,95,204)`:
  the browser default. No rule targets them.
- **3 contact fields** (`#name`, `#email`, `#message`) paint no outline. They carry `outline-none`
  plus `focus:border-accent`, a 1px border that fades in through `transition-colors`, which
  includes `outline-color` and `border-color`: the Entry 134 trap. This is connected, not
  scope creep: it is the same contract, and the strengthened spec below would fail on it.
- Every other stop on every page already paints the accent at 2px.

`tests/google-docs.test.js` is a `node:test` file, not Playwright. Playwright's default `testMatch`
also collects `*.test.js`, so it loads the file, whose `loadAllowList()` calls `process.exit(1)`
without the gitignored `docs/sync/google-docs.json` and takes the whole run down. Under
`node --test` it fails the same way. Its "allow-list enforcement" case also writes
`tests/tmp-allow-list.json`, which is never read, never deleted, and tracked in git.

## Plan review (oracle/opus, 1 round, PASS): findings adopted

Every claim the plan measured was re-measured and held. Adopted:

- **F1 / F5:** B's before/after count uses an explicit file list that excludes
  `tests/focus-ring.spec.js` (A rewrites it):
  `npx playwright test --list $(ls tests/*.spec.js | grep -v focus-ring)` before, and the bare
  `--list` with `focus-ring`'s own count subtracted after. A's verify runs on whatever config is
  current; a top-level `testMatch` was shown to leave both projects' lists identical.
- **F2:** the contact fields must **drop `outline-none`**, not just add a ring. In Tailwind v4,
  `outline-none` sets `--tw-outline-style: none`, which the `outline-2` utilities read, so a ring
  added beside it paints nothing. `transition-colors` becomes
  `transition-[color,background-color,border-color]` (Entry 134 trap).
- **F3:** the fields have no hover style; the check is that the focus border colour still
  transitions while `outline` is not in `transition-property`.
- **F4:**
  - Only the three `resolveDoc` cases need the guard. The enforcement case never loads the
    allow-list in-process.
  - The suite-level skip marker is the evidence, because `node:test` prints `skipped 0` for a
    skipped `describe`.
  - The dead `ENV_PATH` / `tmp-test.env` scaffolding goes with the dead temp allow-list write.
  - The command is `npm run test:docs` (`node --test tests/google-docs.test.js`).
- **F6:** `shxdowmap refresh --auto` after B (`package.json` is a tracked manifest).
- **F7:** the loop stops at "branch pushed". Merging into `portfoliowebsite` is a production
  deploy and the user's call.
- **Nits:**
  - AGENTS.md is to say a bare run on a non-Windows host still runs the visual spec against
    win32-only baselines.
  - Re-count tests instead of restating them.
  - One commit per track, then a push.
  - Concurrency cap 3 (nano `parallel-max`); two tracks fit.

## Track table

| Track | Owner | Files (write) | Depends on | Verify |
|---|---|---|---|---|
| A focus rings | main agent | `brand.css` (sources-list rule), `app/contact/page.tsx` (field classes), `tests/focus-ring.spec.js` (every stop must be the 2px accent), `style.css` (rebuild) | — | `npx playwright test tests/focus-ring.spec.js` (both projects), red first on the old code |
| B test runner | native `builder` | `playwright.config.js` (`testMatch: '**/*.spec.js'`), `tests/google-docs.test.js` (skip the three `resolveDoc` cases when the allow-list is absent; drop the dead temp-file and env scaffolding), `tests/tmp-allow-list.json` (delete), `package.json` (`test:docs`) | — (its `--list` count excludes `focus-ring.spec.js`, which A writes) | `npx playwright test --list` exits 0 without the allow-list; `npm run test:docs` passes with skips |
| C docs | main agent | `AGENTS.md`, `TODO.md`, `LOGBOOK.md`, `docs/ARCHITECTURE.md` (refresh) | **A and B** | read the diff; `shxdowmap status` fresh |

A and B write disjoint files and run in parallel. B never runs `next build` (only `--list` and
`node --test`), so it cannot collide with A's Playwright runs on `out/` or port 4322. A
single stage: no forcing reason for a second.

## Helper roles and stop conditions

- B: native `builder`, scoped to its four files, no commits, returns the exact command output. One
  iteration, then the main agent reviews the diff.
- Plan review: one fresh-context native `oracle`, one round.
- Final signoff: no Review Contract trigger is touched (no auth, installer, safety rule, review
  contract, publishing, billing, data deletion or messaging), so none runs; the main agent's own
  diff read is the final check.

## Verification matrix

| Claim | Command |
|---|---|
| Every focus stop paints the 2px accent at once | `tests/focus-ring.spec.js`, chromium + webkit-mobile, red on the old CSS/classes |
| Hover transitions on the contact fields survive | spec reads `transition-property` (no `outline`), and a headless probe of `:hover` border |
| Whole-suite run works without the allow-list | `npx playwright test --list` exit 0; full run of every spec except visual |
| Docs unit tests run | `npm run test:docs`, allow-list cases reported as skipped |
| Nothing visual moved at rest | focus styling does not render at rest; no baseline is regenerated |

## Open risks

- `testMatch: '**/*.spec.js'` must not drop a real Playwright spec. Every Playwright file is
  `*.spec.js` today; `--list` count before and after must match minus nothing.
- The contact fields' resting look must not change: only the focus state.

## Checkpoint log

- `931fafa`, `75835b5`: process plan, then the plan-review findings. Both pushed.
- `45f6af7`: Track A, focus rings (main agent). Red first, then 12/12.
- `c6e0d78`: Track B, test runner (native `builder`, diff reviewed by the main agent).
- Docs commit: AGENTS.md, TODO, LOGBOOK Entry 140, map refresh. Pushed.

## Merge readiness

- [x] Suite by file list green: 158 passed. Bare `--list`: 198 tests in 11 files, exit 0.
- [x] `npm run test:docs` green: 5 pass (8 since the Final signoff's enforcement rewrite), `resolveDoc` skipped with its reason.
- [x] TODO and LOGBOOK updated; branch pushed; no deploy triggered.
- [x] **The user's call, made 2026-10-06:** "merge it and ship the portfolio". Fast-forwarded into
  `portfoliowebsite`; released together with the Portfolio work after the Final signoff (Entry 142).
