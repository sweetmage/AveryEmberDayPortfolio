# shxdowloop: focus rings everywhere, and a test runner that runs whole — 2026-10-06

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

## Track table

| Track | Owner | Files (write) | Depends on | Verify |
|---|---|---|---|---|
| A focus rings | main agent | `brand.css` (sources-list rule), `app/contact/page.tsx` (field classes), `tests/focus-ring.spec.js` (every stop must be the 2px accent), `style.css` (rebuild) | — | `npx playwright test tests/focus-ring.spec.js` (both projects), red first on the old code |
| B test runner | native `builder` | `playwright.config.js` (`testMatch: '**/*.spec.js'`), `tests/google-docs.test.js` (skip allow-list cases when absent; drop the dead temp-file write), `tests/tmp-allow-list.json` (delete), `package.json` (`test:docs`) | — | `npx playwright test --list` exits 0 without the allow-list; `npm run test:docs` passes with skips |
| C docs | main agent | `AGENTS.md`, `TODO.md`, `LOGBOOK.md` | **A and B** | read the diff |

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

- (filled in as stages complete)

## Merge readiness

- [ ] Suite by file list green; `--list` clean without the allow-list
- [ ] `npm run test:docs` green
- [ ] TODO / LOGBOOK updated; branch pushed; no deploy triggered
