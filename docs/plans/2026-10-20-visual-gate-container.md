# Visual gate in a container, plus a plans sweep

**Date:** 2026-10-20 · **Agent:** Quillfeather (Claude Opus 5.5, VOID) · **Cycle:** shxdowflow

## Acceptance contract (approved by Comet, 2026-10-20)

1. **Visual gate, containerized.** Install Docker on VOID through Colima, regenerate all 48 visual
   baselines inside the official `mcr.microsoft.com/playwright` image, add one command that runs
   the gate there, and delete the old `-chromium-win32` set. Local only: no GitHub Actions
   workflow.
2. **Plans sweep.** Archive the shipped plans in `docs/plans/` into `docs/archives/plans.md`, fix
   the 4 stale open checkboxes, and correct `docs/plans/README.md`.

Out: a hosted CI workflow, the Brand Assets section (waits on the user's art), any site, copy or
visual change, and any push without the user's yes.

## Goal

One Linux snapshot set is canonical (user decision 2026-07-23, `docs/visual-gate.md`), captured on
linux/amd64 in the official image, so the gate no longer depends on SOL being the machine that runs
it. Cross-host equality (VOID under Rosetta vs a native x86-64 Docker host) is expected, not yet
proven: SOL has no Docker (no WSL since its reinstall, `fleet.md`), so it cannot run the gate until
Docker is installed there. The open item in `docs/visual-gate.md` is about running the gate in
*hosted* CI; this session does the local container half, and hosted CI stays open in `TODO.md`.

No UI change, so no mockup gate.

## Approach

- **Runner:** `tests/visual-docker.mjs`, a Node script (Node so it runs from zsh on VOID and
  PowerShell on SOL alike). It reads the `@playwright/test` version the lockfile pins
  (`package-lock.json`, so a fresh clone works) and runs `mcr.microsoft.com/playwright:v<that>-noble`
  with `--platform linux/amd64`, the repo bind-mounted at `/work`, and named volumes over
  `/work/node_modules` and `/work/.next` so the host's macOS or Windows binaries (Next's SWC) never
  meet the Linux container. Inside: `npm ci` when the lockfile hash changed, then
  `npx playwright test tests/visual-baseline.spec.js --project=chromium` with `VISUAL_CONTAINER=1`.
  Extra arguments pass through (`--update-snapshots=all`, `-g portfolio`).
- **Why amd64:** hosted runners and SOL's Docker are x86-64. Chromium's rasteriser can differ
  between arm64 and x86-64, so the canonical set is captured on amd64 (Rosetta under Colima vz).
- **Why under `tests/` and no `package.json` script:** `netlify.toml`'s ignore rule skips pushes
  that touch only `docs/`, agent files, `tests/` and `playwright.config.js`. `package.json` or a
  `scripts/` file would make the push a 15-credit production build for zero site change. The
  command is `node tests/visual-docker.mjs`. (Deviation from the proposal's `npm run
  test:visual:docker`, made to keep the "no paid build" promise; recorded here.)
- **Spec guard:** `visual-baseline.spec.js` skips itself unless `VISUAL_CONTAINER=1`, with a skip
  reason naming the command. Otherwise a host `npm test` on macOS or Windows would look for
  `-chromium-darwin` / `-chromium-win32` files, fail, and write a stray platform set.
- **Baselines:** regenerate with `--update-snapshots=all` in the container, check each by eye
  against its win32 predecessor (same layout, only rasteriser differences), re-run twice green,
  then `git rm` the 48 win32 files.
- **Docs:** `docs/visual-gate.md` (local container half of the open item done, hosted CI still
  open, Colima instead of Docker Desktop, how to run, Linux set), `AGENTS.md:102` (win32, "only green
  on Windows", regenerate on SOL), `docs/ARCHITECTURE.md:288` (`-chromium-win32`), TODO, LOGBOOK.
- **Never run the host suite and the container gate at once.** Both run `build:next` in
  `tests/global-setup.js`, which deletes and recreates the shared `out/` through the bind mount
  (Trap 2).

## Parallel tracks

| Track | Goal | Scope | Depends on | Verification | Owner |
|---|---|---|---|---|---|
| A. Container gate | runner, spec guard, 48 Linux baselines, win32 set removed, gate docs | `tests/visual-docker.mjs`, `tests/visual-baseline.spec.js`, `tests/visual-baseline.spec.js-snapshots/`, `docs/visual-gate.md`, `docs/ARCHITECTURE.md`, `AGENTS.md` | Docker running (done) | container run twice green, 48/48; host `npx playwright test` shows the spec skipped | main agent |
| B. Plans sweep | archive shipped plans, tick stale boxes, fix README | `docs/plans/` (except this file), `docs/archives/plans.md` | none | `grep -rn "^\s*- \[ \]" docs/plans/` empty; every archived plan has a stub with outcome, entries, `git show` path | native `worker` (Haiku) |

Scopes are disjoint. TODO and LOGBOOK are bookkeeping, written by the main agent at the end.

## Verification

- `node tests/visual-docker.mjs` twice after regeneration: 48 passed both times.
- Each Linux PNG's height against its win32 predecessor (same page, so within a few px), plus a
  look at every one.
- Injected-regression check, the one `docs/visual-gate.md` uses for `threshold`: change the dark
  theme's `--brand-text-soft` from `#d7d7d1` to `#cfcfc9` where the token is defined (not a plain
  declaration in another stylesheet, which loses the cascade), run `node tests/visual-docker.mjs`
  without `--update-snapshots`; the dark captures must fail (the semibold pages on both attempts).
  Revert, and `git status` shows the token file clean.
- Host suite: `npx playwright test` on VOID, visual spec reported skipped, rest as before
  (198 passed, 0 failed, 5 skipped baseline from Entry 171, plus 48 skips).
- `grep -rn "^\s*- \[ \]" docs/plans/` returns nothing; `shxdowmap status` fresh.

## Risks

- Trap 7 sub-pixel noise may differ on Linux; the one retry stays. If Linux is steadier, say so in
  the doc but leave the retry (removing it is a separate call).
- Google Fonts load over the network inside the container; a flaky network shows as Trap 5. The
  existing font waits cover it.
- Rosetta emulation is slower; the 48 captures may take several minutes. Not a correctness issue.
- Files the container writes into `out/` must stay owned by `comet` on the host; checked after the
  first run.

- The container builds with Node 24 (the image's), Netlify with Node 20, so the graded export is
  not byte-for-byte production's build. Same Next version and source; acceptable for a visual gate.

Plan review: native oracle (Opus 5.5), round 1, PASS with 7 findings, all applied above.

## Planning shape

Two tracks, run at once. One session: no gate forces a split.
