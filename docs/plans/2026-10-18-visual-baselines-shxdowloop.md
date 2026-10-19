# Visual baselines after the copy pass (shxdowloop)

## Goal

Regenerate the 40 `chromium-win32` visual baselines on SOL so they show the approved copy pass
(Entry 170), review every changed image, and measure the one intermittent motion test failure
(`tests/bubbles-motion.spec.js:266`). Hand back a branch ready to merge into `portfoliowebsite` for the
production push Comet is holding.

## Preflight results and degraded paths

- Repo read-write; `portfoliowebsite` 12 ahead of origin; only `.claude/settings.local.json` dirty (user-owned, untouched).
- npm, git remote, `nano` (`~/.local/bin/nano`), SSH to SOL (`aday6@100.115.165.115`) all OK.
- Usage: Claude session 100% (closed), Codex weekly 5% (open), OpenCode pace 0.
- No `.github/workflows`. `netlify.toml` present; Netlify `allowed_branches` is `["portfoliowebsite"]`
  (`docs/deploys.md`), so pushing this branch builds nothing.

## UI and UX mockup record

Not applicable: no UI change. The baselines record copy Comet already approved piece by piece.

## Branch and remote

`shxdowloop/2026-10-18/visual-baselines`, from `portfoliowebsite` at `4f2c21f`, pushed to `origin`.
`portfoliowebsite` is not pushed (Comet's hold, 2026-10-18).

## Helper routing

`spawn_policy.py sister --caller opencode`: no candidate below OpenCode's pace, so the main agent runs
every stage. Plan review skipped (small, mechanical: baselines plus a test). Final signoff not
required (no auth, credential or permission code).

## Parallel tracks

Three or fewer work files per stage except the snapshot PNGs, which are generated output, one
directory, one writer (SOL). No track table needed.

## Stages

## Stage 1 - Regenerate baselines on SOL

**Status:** Complete
**Goal:** a fresh set of 40 baselines captured from this branch on SOL, with two clean re-checks.
**Phases:**
- [x] 1.1 Prove the old set is sound on SOL: run the visual spec at `c2a2129` (pre copy pass); untouched pages must pass.
- [x] 1.2 Shallow-clone this branch into `%TEMP%\wt-portfolio-baselines`, `npm ci`, `npx playwright install chromium`.
- [x] 1.3 `npx playwright test tests/visual-baseline.spec.js --update-snapshots=all`, then two re-checks.
**Verification:** both re-checks green.
**Forcing reason for the boundary:** Stage 2 reviews what Stage 1 produced.

## Stage 2 - Review and commit

**Status:** Complete
**Goal:** every changed PNG reviewed; only copy-pass changes committed.
**Phases:**
- [x] 2.1 Zip and `scp` the snapshots back; list which files changed byte-wise.
- [x] 2.2 View each changed image against the old one; the changes must be the new copy only.
**Verification:** the changed set matches the pages the copy touched (Portfolio, Brand, Mistrust).
**Notes:** Before the update exactly the 24 Portfolio, Brand and Mistrust captures failed; the other 24
passed. `--update-snapshots=all` also rewrote 4 SECTION 6 captures (360 and 768) whose page did not
change, and those failed both re-checks (639-685px, Trap 7 noise). They were restored to the committed
copies, which then passed two more re-checks (48/48, 2 retries each, against 3 retries for the untouched
old set). Height deltas match the copy: Portfolio rows x 30.5px (366px at 360, 183 at 768/1024, 122 at
1440); Brand +54 to +190px; Mistrust +0 or +27px. Side-by-side crops at the first differing row show only
the new copy. Portfolio 360 dark also differs above the gallery: 9,676 pixels by one brightness step and
32 stray pixels, background dithering, light identical.

## Stage 3 - Pointer-flick flake

**Status:** Complete
**Goal:** measure `bubbles-motion.spec.js:266` under full-suite load before changing anything.
**Phases:**
- [x] 3.1 Repeat the test under load; capture which assertion fails and its values.
- [x] 3.2 Fix only with a measured cause; never raise a tolerance (AGENTS.md).
**Verification:** suite minus visual spec green; the flick test green under repeated load.
**Notes:** Flick: CPU throttling did not slow frames, so slow frames were not the cause. Over 40 runs
the deformation read during the sweep was 0.02-0.04, 8 under the 0.03 floor; the stretch peaks ~80ms
after the speed, which is after the sweep's last frame. Sampling 20 more frames: min 0.113, median 0.138.
The test now samples through the settle and asserts > 0.06. 30/30 green; with stretch and lean both
off it fails. A second motion test, "bubbles reach the card interior @ 1440px", failed once in a full
run; measured 4/20 on this branch, 0/20 at `c2a2129`. Cause: it waited for one of 7 random page-space
bubbles to wander into a card (hits 2-200 per run; mean rose from ~73 to ~114 after the copy, so reach
did not drop). Rewritten to ask the engine: every card has a legal resting spot for the smallest
bubble, and a bubble placed there stays. 30/30 green at 390/768/1440; with `.gallery-item` re-added to
the exclusions it fails ("a card has no spot where a bubble may rest").

## Checkpoint log

## Verification matrix

| Check | Where | Result |
|---|---|---|
| Visual spec, old set at `c2a2129` | SOL | 48 passed (3 on retry) |
| Visual spec, update + re-checks | SOL | update 48 passed; re-checks 3 and 4 (SECTION 6 restored) 48 passed, 2 on retry each |
| Non-visual suite | VOID | 198 passed, 0 failed, 5 skipped, twice (zsh) |

## Open risks

- Trap 7 sub-pixel noise on the semibold pages: the spec retries those once; a re-check that fails twice on the same page is a real diff.

## Merge readiness checklist

- [x] Baselines committed and reviewed
- [x] Non-visual suite green
- [x] LOGBOOK and TODO updated
