# shxdowloop: post-release cleanup, a logo download kit, a numbered Mistrust bibliography (2026-10-06)

**Agent:** Opus 5.5 (juniper, VOID), main · **Mode:** Normal, unattended after the user's Proceed
**Asked by the user (verbatim):** "next step" (`/shxdowloop next step`), following the dry run in
[`2026-10-06-next-step-cleanup-icons-mistrust-shxdowloop-dry-run.md`](2026-10-06-next-step-cleanup-icons-mistrust-shxdowloop-dry-run.md),
which holds the full fact base (file lists, sizes, reference greps). This plan records only what
changed since then and how the run executes.

## Goal

1. **Cleanup.** Archive the three plans that shipped Oct 4-6. Rewrite `docs/plans/README.md`. Narrow
   or close the Mistrust-viewer TODO.
2. **Logo download kit** (user's choice at the gate: "Brand kit downloads"). Every logo card on
   `/portfolio/brand/` gets SVG and PNG download links. That puts the orphaned format twins to use.
3. **Numbered bibliography** on `/portfolio/history-of-mistrust/`. The slide words stay as alt text and
   captions (user's choice: "No, keep as is"), so that part of the TODO closes.

## Decisions taken at the gate, and what the loop derived from them

| # | User's answer | What the run does |
|---|---|---|
| D1 | Brand kit downloads | Add SVG/PNG links to all 6 swatch cards. Every variant exists in both formats, using 5 previously orphaned files: `bubbleLogo.svg`, `bubbleLogo-black.png`, `bubbleLogo-white.png`, `bubbleLogo-black-notxt.svg`, `bubbleLogo-blue-notxt.svg`. **Deleted, with reasons:** `bubbleLogo_transparent.svg` is byte-identical to `bubbleLogo.svg` (same md5, `b5ebc724...`), so the kit would offer one file twice. `githubicon.svg`, `linkedinicon.svg` and `emailicon.svg` are third-party marks, not the brand, so offering them in a brand kit would be wrong. |
| D2 | No visible transcript | The TODO's "all canonical slide content" is met by `SLIDE_ALT` alt text and lightbox captions. Close it. |
| D3 | (default) | `<ol>` numbering, keeping the column layout |

**Copy rule (AGENTS.md: the user writes copy).** The kit adds labels only, and no prose: the visible
link text is the format name (`SVG`, `PNG`), and each link's accessible name is "Download <alt> as
SVG". No heading or intro sentence is added. If the user wants a "Download the kit" heading, they
write it.

## Preflight results and degraded paths

Same as the dry run, re-checked at 2026-10-06 normal-mode preflight. Branch clean and level with origin.
Claude **89%** session / 56% weekly, binding **89%, under 95%**. Codex 0% / 14%. nano available.
**SOL reachable over SSH** (`SOL`, node v24.19.0, git 2.55), so baselines can be regenerated. Mesh
keeper not installed, so mesh registration was skipped. No deploy on push for this branch
(`allowed_branches` = `portfoliowebsite`).

## Branch and remote

`shxdowloop/2026-10-06/next-step-cleanup-icons-mistrust` (made by this loop at the dry run, `055b8ae`),
tracking origin. Milestone base for the signoff: `055b8ae`.

## Helper routing

Binding 89% < 95%, with usable telemetry: native roles. `oracle` for Plan review, `builder` for
tracks A/B/C. The main agent runs C2 (SSH to SOL, image review). The Final signoff goes to a pro
nano-agent on Codex, with a fresh `oracle` as the fallback. Between stages, re-check usage. At or over
95%, no new native helpers start.

## Plan review (stage 1, one round): PASS, findings applied

`oracle`, fresh context, **PASS**. All six FINDINGS were applied here, before 1.3:

1. **Usage hit the gate.** Re-checked before 1.3: Claude **97%** session, 57% weekly. Native helpers
   are gated. **Route from here: the main agent runs A, B and C serially.** The Final signoff stays
   on a pro nano-agent on Codex (0% / 14%). Usage gets re-checked again before 1.7.
2. **Parallel Playwright runs** shared `:4322` and `out/` (`tests/global-setup.js`). That is moot
   now: one agent runs everything serially.
3. **`style.css`** (rebuilt by `npm run css:build`, `AGENTS.md:78`) is now in the table. The main
   agent rebuilds it once, at integration.
4. **Interim commit phase added** (1.3b). It covers diff read, focused specs, `css:build`, commit and
   push, all **before** C2, so a spec failure can't force a second baseline run.
5. **C2 restated** with `ssh sol` (the alias is lowercase; `SOL` fails host-key checks) and all 16
   images, per `docs/visual-gate.md:205-212`.
6. **Stop conditions:** see "Iteration stop conditions" below.

Nits applied: the A gate moved into the dependency column, and the non-visual suite is written as a
literal file list. The copy rule's source is corrected: it is the TODO/plan convention "The user
writes the first draft; the agent proofreads only" (`TODO.md`, copy pass), not AGENTS.md. Track A
also fixes the README's stale grep claim and its "Complete" paragraph. **9 vs 10:** `TODO.md:34-41`
names nine files under a "Ten" heading, so the count was a miscount in TODO, not a missed file. The
Blue swatch caption mismatch (`#9acdff` caption, `#7eb8ff` artwork, per the reviewer's sample) is
the user's call and gets flagged in the handoff, not changed. A CSS-counter fallback for C would add
`role="list"`.

## Iteration stop conditions

- **C2 noise:** if a baseline outside the expected 16 changes, discard that file, re-run the update
  once, then re-check. If it changes again, stop C2 and record a blocking TODO with the diff.
- **Spec failure** in 1.3b: fix and re-run, at most twice per track. A third failure marks that track
  Blocked with evidence, and the other tracks continue.
- **SSH to SOL fails** mid-run: stop at "code done, baselines pending", as a blocking TODO.

## Stage 1 - Cleanup, logo kit, numbered bibliography

**Status:** Active
**Goal:** All three goals done, verified, and checkpointed on the loop branch.
**Phases:**
- [x] 1.1 Explore (main agent, done in the dry run and at the gate: refs, md5 duplicates, Brand component, focus/hover contracts)
- [x] 1.2 Plan review, one round, `oracle`: PASS, findings applied
- [x] 1.3 Tracks A, B, C (main agent, serial: usage gate)
- [x] 1.3b Diff read, focused specs on the Mac, `css:build`, interim commit `8231725`, pushed
- [ ] 1.4 Track C2: 16 baselines on SOL (8 `portfolio-brand-*`, 8 `portfolio-mistrust-*`)
- [ ] 1.5 Focused suite + `test:docs` + `tsc` + `next build`
- [ ] 1.6 Main agent's diff read, LOGBOOK, TODO, checkpoint, push
- [ ] 1.7 Final signoff (trigger: data deletion), then handoff

**Parallel tracks** (work files above three, so the table is required):

| Track | Writes | Reads | Depends on |
|---|---|---|---|
| A - Archive | `docs/archives/plans.md`, `docs/plans/README.md`; removes `docs/plans/2026-10-04-focus-ring-stagger-archive.md`, `docs/plans/2026-10-05-combine-projects-gallery.md`, `docs/plans/2026-10-06-focus-ring-and-test-runner-shxdowloop.md` | `git log` for each | none |
| B - Logo kit | `app/portfolio/BrandProject.tsx`, `brand.css` (one `.logo-download` rule block), `tests/project-tiles.spec.js` (new kit test); removes `public/images/icons/BubbleLogo/bubbleLogo_transparent.svg`, `public/images/icons/{githubicon,linkedinicon,emailicon}.svg` | `tests/focus-ring.spec.js` | none |
| C - Bibliography | `app/portfolio/MistrustProject.tsx`, `tests/mistrust-slideshow.spec.js` | `tests/focus-ring.spec.js` | none |
| Integration | `style.css` (`npm run css:build`) | B, C | **B and C** |
| C2 - Baselines | 16 PNGs in `tests/visual-baseline.spec.js-snapshots/` | the pushed branch | **A, B, C, Integration committed and pushed (1.3b)** (SOL clones the pushed branch) |

**C2 commands** (target: SOL, Windows cmd via `ssh sol`, with `dangerouslyDisableSandbox`):
`git clone --depth 1 -b <branch> <origin> %TEMP%\wt-portfolio-baselines`, then `npm ci`, then
`npx playwright install chromium`, then `npx playwright test tests/visual-baseline.spec.js
--update-snapshots`, then two plain re-checks. `git status --short` in the clone lists the changed
PNGs. Zip those, `scp` the zip back, crop-review all 16, commit, and delete the clone.

`brand.css` is written by B only. C styles through utilities in `MistrustProject.tsx`, so it does
not touch `brand.css`. `TODO.md`, `LOGBOOK.md` and this plan are written by the main agent only.
**Gate:** A, B and C done and reviewed before C2. C2 done before 1.5's full visual check.

**Acceptance per track**

- **A:** a new `Consolidation Stubs - 2026-10-06` section in the archive, in the 2026-10-04 section's
  shape: an anchor, a recovery `git show <sha>:<path>` block that works (run each one), and a table with
  outcome and LOGBOOK entry per file. An index line goes under "Retired stubs". The README's Active
  table lists only the copy-pass plan and this loop's two plan files. `grep -rn` for the three removed
  names finds no live link outside the archive, LOGBOOK, `docs/logbooks/`, and this loop's plans.
- **B:** each of the 6 cards shows two links, `SVG` and `PNG`, each `<a href=... download>`, with
  `aria-label="Download <alt> as SVG|PNG"`. The style matches `.project-back-link`: soft text, accent
  on hover, and the 2px accent focus ring painted with no outline transition. The links sit in the
  label strip, so the image canvas stays unchanged. Every href resolves to a file that exists in
  `public/`. The 4 files are deleted. The new test asserts 12 links, the hrefs return 200, and
  `download` is present, and it fails on the old component.
- **C:** the sources list is an `<ol>` with visible numbers 1-82 and an unchanged column layout. All 82
  links keep the focus ring. The new assertion (`ol.sources-list > li` count 82, `list-style-type`
  decimal or a counter) fails on the old `<ul>`.
- **C2:** exactly 16 baselines change: the 8 `portfolio-brand-*` and the 8 `portfolio-mistrust-*`.
  Update, then two re-checks exit 0. Every changed image is cropped and reviewed. Any other
  changed baseline blocks the checkpoint.

**Verification:**

| Check | Command | Expected |
|---|---|---|
| Focused specs | `npx playwright test tests/project-tiles.spec.js tests/mistrust-slideshow.spec.js tests/focus-ring.spec.js tests/smoke-next.spec.js` (Mac; non-visual) | all pass |
| Full non-visual suite | `npx playwright test` minus `visual-baseline.spec.js` (Mac) | all pass |
| Visual | SOL: `--update-snapshots` then 2 re-checks | exactly 16 changed, exits 0 |
| Docs tests / types / build | `npm run test:docs`, `npx tsc --noEmit`, `npx next build` | 8/8, clean, builds; `out/images/icons/githubicon.svg` absent; all 12 kit hrefs present in `out/` |

**Helpers:** `oracle` (1.2), `builder` x3 (A, B, C), main agent (C2), nano pro on Codex (1.7).
**Checkpoint:** `8231725` (stage 1a, interim at the usage limit, Entry 144). Then `edb1a17` arrived: Moonlight, committed to this branch by another session (Lunebyte, Entry 145). At the resume gate the user chose "Ship it with this loop", so C2 expects **24** changed baselines: 8 `portfolio-*` (the new card), 8 `portfolio-brand-*`, 8 `portfolio-mistrust-*`.
**Notes:**
- Resume (usage back to 38%): the non-visual suite (10 spec files) passed **161/161** in 3.3m on the Mac, Moonlight included.
- The `out/` build holds all 12 kit files and none of the 4 deleted ones.
- Sources screenshots (1440 light, 360 dark) were reviewed: numbers 1-82 sit in the hang, and wrapped lines align with the text.
- The kit was reviewed at 1440 dark and 360 dark, with its focus ring.
- One test fix during 1.3b: the alignment spec first treated every inline fragment as a line start. It now takes the leftmost rect per line.

## Signoff triggers

**Data deletion** applies: 4 shipped files and 3 plan files are removed. So the Final signoff runs
once, at milestone close, over `055b8ae..HEAD`. No publish or deploy happens in this loop. Merging
into `portfoliowebsite` and the 15-credit release are separate user go-aheads.

## Open risks

- **Next static export and `download`:** a same-origin `download` link works on Netlify static files.
  The hrefs contain no spaces (`BubbleLogo/` is fine), so no encoding is needed.
- **Hidden runtime references:** a `bubbleLogo-${x}` template string could reference a deleted file.
  The kit test plus `smoke-next` catch a 404. B re-greps stems before deleting.
- **Number markers vs the hanging indent** (`pl-6 -indent-6`): if the markers collide, C uses a CSS
  counter through utilities.

## Merge readiness checklist

- [ ] Plan review PASS, or its findings fixed
- [ ] A, B, C, C2 done; exactly 16 baselines changed
- [ ] Non-visual suite, visual gate on SOL, `test:docs`, `tsc`, `next build` green
- [ ] Final signoff PASS, with the runtime confirmed
- [ ] LOGBOOK and TODO updated
- [ ] User go-ahead to merge, then a separate go-ahead for the 15-credit release push

## Checkpoint log

| Stage | Commit | Push |
|---|---|---|
| dry run | `055b8ae` | origin, no deploy |
