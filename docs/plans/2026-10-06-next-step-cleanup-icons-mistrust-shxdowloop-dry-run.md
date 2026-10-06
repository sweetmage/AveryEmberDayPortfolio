# shxdowloop dry run: post-release cleanup, orphaned icons, Mistrust viewer gaps (2026-10-06)

**Agent:** Opus 5.5 (juniper, VOID), main · **Mode:** Dry run. Nothing outside this file, `LOGBOOK.md`
and `TODO.md` is edited, and every command below is marked `would run`.
**Asked by the user (verbatim):** "next step dry run. when you are done send me a clickable link so i
can open it on chrome". At the preflight gate the user picked three next steps: **1** post-release
cleanup, **2** orphaned icon files, **3** Mistrust viewer gaps.

## Goal

A real run of this plan would close three items left open after the Portfolio release (Entry 142):

1. **Post-release cleanup.** Move the three plans that shipped on Oct 4-6 out of `docs/plans/` into
   `docs/archives/plans.md`. Rewrite the stale `docs/plans/README.md`, which still lists the Portfolio
   merge as "Planned, not started". Narrow the Mistrust-viewer TODO, because that page now exists.
2. **Orphaned icons.** Remove the unreferenced icon files from `public/images/icons/`, or link them
   as a brand kit. The intent decision below has a recommended default.
3. **Mistrust viewer gaps.** Bring `/portfolio/history-of-mistrust/` up to what the TODO asks for:
   a **numbered** bibliography, plus a decision on visible slide text.

## Preflight results and degraded paths

| Check | Result |
|---|---|
| Folder | `/Users/comet/Repos/AveryEmberDayPortfolio`, read-write |
| Start state | `portfoliowebsite` @ `165e75e`, clean, level with `origin` after a fetch |
| node / npm | v26.10.0 / 11.19.1 |
| shxdowTracker | ok. Claude session 84%, weekly 55%, so the binding value is **84%, under 95%** |
| nano-agents | available at `~/.claude/skills/nano-agents/scripts/nano-agent.sh` (not warmed: the dry run dispatches nothing) |
| git remote | `origin` (github.com/sweetmage/AveryEmberDayPortfolio), reachable |
| Push-triggered CI | none found (no `.github/workflows`) |
| Deploy on push | **Cleared for this branch.** `netlify.toml` exists, but Netlify's `allowed_branches` is `["portfoliowebsite"]` (`docs/deploys.md:112`), so pushing any other branch produces no build. `portfoliowebsite` itself is production: one push there costs 15 credits, and the loop **never** pushes it |
| Mesh registration | skipped: `lease-keeper.mjs` is not installed on this host |
| Degraded | Visual baselines are `chromium-win32` and can only be regenerated on SOL over SSH (`docs/visual-gate.md:205`). If SOL is unreachable, Track C stops at "code done, baselines pending" |

## Branch and remote

`shxdowloop/2026-10-06/next-step-cleanup-icons-mistrust`, branched from `portfoliowebsite` @ `165e75e`
and published with `push -u` (no deploy, per the row above). Merging back into `portfoliowebsite` and
the release push are **not** part of this loop. Each one is a separate user gate.

## Facts the plan rests on (checked 2026-10-06, not carried from TODO)

**Plans to archive.** All three are already in git history (the recovery path is
`git show <sha>:<path>`, so a file with no history could not be archived). None has an unticked box:

| File | Last commit | Outcome |
|---|---|---|
| `docs/plans/2026-10-04-focus-ring-stagger-archive.md` | `9f3269f` | Shipped in Entry 134 |
| `docs/plans/2026-10-05-combine-projects-gallery.md` | `7ea4215` | Shipped in Entry 142 (Portfolio release) |
| `docs/plans/2026-10-06-focus-ring-and-test-runner-shxdowloop.md` | `7ea4215` | Shipped in Entry 142 |

`docs/plans/2026-08-01-copy-pass-and-gallery-descriptions.md` stays, because it is still waiting on the
user's draft.

**Orphaned icons.** A `grep -rn -F` for each file name across `app/`, `src/`, `public/scripts/` and
`index.html` finds **9** unreferenced files, not the 10 that TODO lists:

| File | Bytes | Live twin |
|---|---|---|
| `public/images/icons/BubbleLogo/bubbleLogo-black.png` | 15,903 | `.svg` is referenced |
| `public/images/icons/BubbleLogo/bubbleLogo-white.png` | 15,041 | `.svg` is referenced |
| `public/images/icons/BubbleLogo/bubbleLogo-black-notxt.svg` | 923 | `.png` is referenced |
| `public/images/icons/BubbleLogo/bubbleLogo-blue-notxt.svg` | 923 | `.png` is referenced |
| `public/images/icons/BubbleLogo/bubbleLogo.svg` | 3,565 | `.png` is referenced |
| `public/images/icons/BubbleLogo/bubbleLogo_transparent.svg` | 3,565 | none (byte-identical size to `bubbleLogo.svg`) |
| `public/images/icons/githubicon.svg` | 1,972 | footer is inline SVG now |
| `public/images/icons/linkedinicon.svg` | 1,300 | footer is inline SVG now |
| `public/images/icons/emailicon.svg` | 730 | footer is inline SVG now |

Total **43,922 bytes**. Stage 1 explains the gap between 9 and the TODO's 10 before anything is
deleted. It does not assume TODO was wrong.

**Mistrust page.** `/portfolio/history-of-mistrust/` already exists (`app/portfolio/history-of-mistrust/page.tsx`)
and renders `MistrustProject`. The slideshow, the lightbox and the 30-thumb grid all carry the exact
slide words via `SLIDE_ALT` (`app/portfolio/mistrustSlides.ts`), as alt text and lightbox captions. The
bibliography is **82 entries in an unnumbered `<ul className="sources-list ... list-none">`**
(`app/portfolio/MistrustProject.tsx:96`). So the TODO's two asks come out as:

- "standalone viewer page": **met**;
- "all canonical slide content": **met as alt text and captions**, but not as visible page text (a
  decision, see below);
- "numbered bibliography": **not met**.

## Decisions a real run takes unattended (reversible, conservative)

| # | Decision | Default the loop would take | Why |
|---|---|---|---|
| D1 | Icons: delete, or link as a brand kit | **Delete** the 9 files | The Brand page offers no downloads today, and a kit is new product scope that needs the user. Git keeps every file, so `git checkout <sha> -- <path>` restores any of them. |
| D2 | Visible slide transcript on the Mistrust page | **Do not add one.** Record it as satisfied by the alt text and captions | Adding visible text is a copy and layout change, and per AGENTS.md the user writes the copy. The TODO gets a narrowed follow-up instead. |
| D3 | Bibliography numbering style | `<ol>` with decimal markers, keeping the current hanging indent and columns | Smallest change that is semantically numbered. Screen readers announce "list, 82 items" and each position. |

If the user prefers a different default for D1 or D2, swap the matching Track before Proceed. Nothing
else in the plan changes.

## Helper routing

- Binding value **84% (Claude, max of session 84 and weekly 55)**, under the 95% gate, with usable
  telemetry. So helpers go to **native** roles.
- Explorer: `scout`. Executor: `builder`. Plan review: fresh-context `oracle`. Final signoff: one
  **pro nano-agent** on a non-Claude runtime (Codex weekly is at 14%), which the Review Contract
  prefers, with a fresh `oracle` as the fallback.
- Nano is used only for the independent signoff. No track needs nano parallelism, because three native
  tracks fit under the concurrency cap of 4.
- Degraded path: if the nano route fails `status --all` verification, use a fresh-context native
  `oracle`.

## Stage and phase outline

One milestone and **one stage**. The three tracks touch disjoint files, so they run in parallel, and
nothing forces a stage boundary between them. The only real gate is the **SOL baseline regeneration**,
which needs Track C's code first. It sits inside the stage as a dependency, not as a stage boundary.

## Stage 1 - Cleanup, icons, numbered bibliography

**Status:** Pending (dry run)
**Goal:** Archive the shipped plans, delete the orphaned icons, and number the Mistrust bibliography,
all verified and checkpointed on the loop branch.
**Phases:**
- [ ] 1.1 Explore (read-only): settle the 9-vs-10 icon count; confirm no test, CSS or `public/**/*.md`
      references the 9 files; confirm the `sources-list` selectors that tests rely on
- [ ] 1.2 Plan review (one round, `oracle`)
- [ ] 1.3 Tracks A, B, C in parallel
- [ ] 1.4 Track C baselines on SOL (gate: Track C code committed)
- [ ] 1.5 Full suite, `test:docs`, `tsc`, `next build`
- [ ] 1.6 Final signoff + the main agent's own diff read
- [ ] 1.7 LOGBOOK entry, TODO condense, checkpoint commit, push to the loop branch

**Parallel tracks** (work files: 3 plan files + README + archive + 9 icons + `MistrustProject.tsx` + 8
baselines, so a table is required):

| Track | Scope (files written) | Reads | Depends on |
|---|---|---|---|
| A - Archive | `docs/archives/plans.md` (new "Consolidation Stubs - 2026-10-06" section and index line), `docs/plans/README.md`, deletes the 3 shipped plan files | the 3 plan files, `git log` | none |
| B - Icons | deletes the 9 files under `public/images/icons/` | `app/`, `src/`, `public/scripts/`, `tests/`, CSS | 1.1 count settled |
| C - Bibliography | `app/portfolio/MistrustProject.tsx` (sources `<ul>` to `<ol>`); adds a numbering assertion to `tests/mistrust-slideshow.spec.js` | `tests/focus-ring.spec.js` (it walks the 82 source links) | none |
| C2 - Baselines | 8 `tests/visual-baseline.spec.js-snapshots/portfolio-mistrust-*-chromium-win32.png` | Track C commit | **Track C committed and pushed** (SOL clones the branch) |

`TODO.md` and `LOGBOOK.md` are written only by the orchestrator, at 1.7.
**Gate:** A, B, C and C2 all done before 1.5.
**Helpers:** `scout` (1.1), `oracle` (1.2), `builder` x3 (A, B, C), main agent (C2 over SSH, since it
needs the user's fleet SSH rules and a review of each image), nano pro signoff (1.6).
**Verification:** see the matrix.
**Checkpoint:** `shxdowloop stage 1: cleanup, icons, numbered bibliography`, then `git push -u origin HEAD`.
**Notes:** Track C changes all 8 `portfolio-mistrust-*` baselines, and only those. Any other changed
baseline is a regression and blocks the checkpoint.

## Command list (`would run`, in order)

```bash
# 1.1 explore
would run: git ls-files public/images/icons
would run: for n in <9 names>; do grep -rn -F "$n" app src public tests brand.css app.css style.css index.html; done
would run: git log --diff-filter=A --format='%h %ad' -- public/images/icons   # where the TODO's "ten" came from
would run: grep -n "sources-list\|Sources & Bibliography" tests/*.js

# Track A
would run: git show 9f3269f:docs/plans/2026-10-04-focus-ring-stagger-archive.md >/dev/null   # recovery path proven
would run: git show 7ea4215:docs/plans/2026-10-05-combine-projects-gallery.md >/dev/null
would run: git show 7ea4215:docs/plans/2026-10-06-focus-ring-and-test-runner-shxdowloop.md >/dev/null
would run: git rm docs/plans/2026-10-04-focus-ring-stagger-archive.md docs/plans/2026-10-05-combine-projects-gallery.md docs/plans/2026-10-06-focus-ring-and-test-runner-shxdowloop.md
would run: grep -rn "2026-10-04-focus-ring-stagger-archive\|2026-10-05-combine-projects-gallery\|2026-10-06-focus-ring-and-test-runner" --exclude-dir=node_modules .   # repoint dangling links

# Track B
would run: git rm public/images/icons/BubbleLogo/{bubbleLogo-black.png,bubbleLogo-white.png,bubbleLogo-black-notxt.svg,bubbleLogo-blue-notxt.svg,bubbleLogo.svg,bubbleLogo_transparent.svg} public/images/icons/{githubicon,linkedinicon,emailicon}.svg

# Track C
would run: npx playwright test tests/mistrust-slideshow.spec.js tests/focus-ring.spec.js

# C2 (target: SOL Git Bash/PowerShell via ssh, dangerouslyDisableSandbox)
would run: ssh sol "git clone --depth 1 -b shxdowloop/2026-10-06/next-step-cleanup-icons-mistrust https://github.com/sweetmage/AveryEmberDayPortfolio.git %TEMP%\wt-portfolio-baselines"
would run: ssh sol "cd %TEMP%\wt-portfolio-baselines && npm ci && npx playwright install chromium && npx playwright test tests/visual-baseline.spec.js --update-snapshots"
would run: ssh sol "... npx playwright test tests/visual-baseline.spec.js"   # re-check 1
would run: ssh sol "... npx playwright test tests/visual-baseline.spec.js"   # re-check 2
would run: scp sol:<zip of portfolio-mistrust-*> <scratch>/ && review all 8 images

# 1.5
would run: npx playwright test
would run: npm run test:docs
would run: npx tsc --noEmit
would run: npx next build && test ! -e out/images/icons/githubicon.svg

# 1.7
would run: git status --short && git diff --stat && git diff --check
would run: git add <explicit paths> && git commit -m "shxdowloop stage 1: cleanup, icons, numbered bibliography"
would run: git push -u origin HEAD
```

## Helper dispatch list (`would spawn`)

| Role | Route | Prompt summary | Inputs | Expected output | Permissions | Fallback |
|---|---|---|---|---|---|---|
| Explorer | native `scout` | Settle the icon count, the references and the test selectors (1.1) | this plan | facts with file:line | read-only | main agent |
| Plan reviewer | native `oracle`, fresh context | The verbatim SKILL.md plan-review prompt | this plan | PASS/FAIL, FINDINGS, NITS | read-only | nano pro reviewer |
| Executor A | native `builder` | Archive 3 plans into a new 2026-10-06 stub section; rewrite the README | Track A row | diff + `grep` proof of no dangling links | edit docs only | main agent |
| Executor B | native `builder` | Delete the 9 files after re-grepping each one | Track B row | `git rm` list + grep output | delete within `public/images/icons/` only | main agent |
| Executor C | native `builder` | `<ul>` to `<ol>`, keep the styling, add a numbering spec, prove it red on the old markup | Track C row | diff + red/green test output | edit `MistrustProject.tsx`, `tests/mistrust-slideshow.spec.js` | main agent |
| Final signoff | nano pro, Codex runtime, pinned | The verbatim SKILL.md Final signoff prompt, milestone base `165e75e` | diff, request, plan | PASS/FAIL + COMPLETENESS | read-only | fresh native `oracle` |

## Verification matrix

| Check | Command | Expected signal |
|---|---|---|
| Plans archived | `ls docs/plans/` | Only `2026-08-01-copy-pass...`, `README.md`, and this loop's plan |
| No dangling links | `grep -rn` on the 3 removed names | Hits only inside `docs/archives/plans.md` and LOGBOOK |
| Icons gone from export | `next build` then `ls out/images/icons/` | None of the 9; every referenced logo still present |
| No 404s | `tests/smoke-next.spec.js` | All routes load, with no failed image requests |
| Numbered bibliography | new assertion in `tests/mistrust-slideshow.spec.js` | `ol.sources-list > li` count is 82; fails on the old `<ul>` |
| Focus contract | `tests/focus-ring.spec.js` | All 82 source links still paint the 2px ring |
| Visual | SOL update + 2 re-checks | Exactly 8 `portfolio-mistrust-*` change; 32 others untouched |
| Suite | `npx playwright test` | All pass (last run 158/158) |
| Docs tests / types | `npm run test:docs`, `tsc --noEmit` | 8/8, clean |

## Signoff triggers checked

**Data deletion:** applies, conservatively. Track B deletes shipped files, and so does Track A, though
those are only docs. That requires the Final signoff (1.6). **Publishing or deploying:** not in this
loop. The later release push to `portfoliowebsite` is its own milestone, and it waits on a signoff PASS
and the user's go-ahead. Auth, installers, safety rules, review machinery, billing and messaging do not
apply.

## Open risks and hard stops

- **Hard stop:** any push to `portfoliowebsite` (15 credits, production). The loop does not do it.
- **Hard stop:** SOL unreachable over SSH. Track C2 cannot regenerate the `chromium-win32` baselines on
  the Mac. Stop at "code done, baselines pending", and record it as a blocking TODO.
- **Risk:** an icon is loaded from a string built at runtime (for example `bubbleLogo-${theme}.svg`),
  which a literal grep misses. 1.1 also greps for `bubbleLogo-` stems and template literals. The
  smoke test catches any 404.
- **Risk:** `<ol>` markers inside a 3-column `columns-*` layout number down each column, which is
  correct reading order. But hanging-indent padding (`pl-6 -indent-6`) can collide with outside
  markers. Track C keeps `list-none` and draws numbers with a CSS counter if the markers misalign.
- **Risk:** archiving rewrites `docs/plans/README.md` while the stale "Planned, not started" line is
  quoted in history. Rewrite the current table only; leave the history.

## Merge readiness checklist

- [ ] Plan review PASS (or its FINDINGS fixed)
- [ ] Tracks A, B, C, C2 done; exactly 8 baselines changed
- [ ] Full suite, `test:docs`, `tsc`, `next build` green
- [ ] Final signoff PASS, with the runtime confirmed in `status --all`
- [ ] LOGBOOK entry written, TODO condensed (icons and Mistrust items closed or narrowed)
- [ ] User go-ahead for the merge into `portfoliowebsite`, then a separate go-ahead for the 15-credit
      release push

## Checkpoint log

| When | Commit | Push |
|---|---|---|
| 2026-10-06 | dry-run plan (this file) | `origin/shxdowloop/2026-10-06/next-step-cleanup-icons-mistrust`, no deploy |
