# Projects heading padding — shxdowloop process plan

**Date:** 2026-07-24
**Branch:** `shxdowloop/2026-07-24/projects-heading-padding` (from `portfoliowebsite` @ `098f0b1`)
**Remote:** `origin` — pushed, tracking
**Mode:** Normal (unattended stage loop)
**Session model:** Opus 4.8 (main)

## Goal

Land the uncommitted `ProjectTabs.tsx` heading-padding change: adjudicate and regenerate the
Projects visual baselines it invalidates, and commit it together with this session's docs-sync work
on a reviewable branch.

Success = `npm test` green twice in a row on a clean tree, with every regenerated snapshot
individually adjudicated rather than rubber-stamped, and both the padding change and the docs
reconciliation committed and pushed.

## Preflight results

| Check | Result |
|---|---|
| Workspace | read-write; `docs/`, `docs/plans/` ok |
| Branch/remote | `portfoliowebsite` in sync with origin (0 behind / 0 ahead); fetch only, no pull |
| Startup tree | dirty: 8 docs files (this session) + `ProjectTabs.tsx` (user) + untracked plan doc |
| npm | 11.12.1 |
| git remote | reachable |
| shxdowTracker | claude session 13%, weekly 11% → **binding 13%**, far below the 80% native ban |
| Codex | 0% — eligible handoff target |
| nano-agents | opencode + kilo authenticated, `parallel-max:4` |
| shxdowmap | resolves, but no `docs/ARCHITECTURE.md` in this repo |

Degraded paths:

- **OpenCode model probe timed out at 20s during preflight.** Host notes record OpenCode wedging on
  exactly this signal. Helper dispatches go to **Kilo first**, OpenCode as fallback — the reverse of
  the usual order.
- No architecture map. Not built: the repo is small and this task touches two files. Noted rather
  than silently skipped.

## Hazard resolved before Stage 0

`npm test` runs `next build`, whose `distDir` is `out` — it deletes a running dev server's runtime.
At preflight two `next` dev servers were live for this repo (pid 2028 on :3001 from this session,
pid 28452 on :3000 left over from 2026-07-23 23:52). Both command lines were verified as
`next/dist/server/lib/start-server.js` for this repo before killing. Both ports confirmed free.
Stopping the npm parent alone was **not** sufficient — the child `next-server` survived and had to
be killed by PID.

## Helper routing

Binding usage 13% → native permitted for the four reserved cases; oracle-class review contract
active (Opus session).

- **Main agent:** snapshot adjudication (visual judgment — the entire point of the gate is that a
  reviewer looks at the diff instead of rubber-stamping `--update-snapshots`), integration,
  verification, final diff review, commits.
- **Kilo pro nano-agent:** shippability review.
- **Oracle-class:** final review per the standing contract — native `oracle` while native is
  allowed, which it is at 13%.
- No parallel tracks. The change is two files and one snapshot set; splitting it would cost more in
  integration than it saves. Recorded so the absence is a decision, not an oversight.

## Parallel tracks

None — see above.

---

## Stage 0 — Establish the pre-change baseline state

**Status:** Complete
**Goal:** Know exactly which snapshots the padding change invalidates, before accepting anything.
**Phases:**
- [x] 0.1 Run `npm test` with the padding change in place — **16 failed, 29 passed**. Failures:
  `projects` and `projects-mistrust`, each at 360/768/1024/1440 x light/dark.
- [x] 0.2 Failures confined to Projects-page captures — confirmed, nothing else red.
**Verification:** failing-capture list above
**Checkpoint:** no commit

## Stage 1 — Adjudicate and regenerate baselines

**Status:** Complete
**Goal:** Accept the new Projects baselines deliberately, with a written verdict per capture.
**Phases:**
- [x] 1.1 Inspected diff artifacts; measured every changed region numerically rather than by eye
- [x] 1.2 Written verdict per capture — see the adjudication table below
- [x] 1.3 `npm test -- --update-snapshots=all`

### The finding that changed this stage: pre-existing tolerated nav drift

Adjudicating the 1440-dark diff showed changes in the **nav band** (rows 0-74), which a heading's
`padding-top` has no business touching. Chasing that down produced a real defect in the committed
baselines, unrelated to today's change:

- The nav links render at `x=281.28` with `margin-left: 4px` — verified by measuring the live DOM on
  `/`, `/projects/` and `/gallery/`, all three identical. This matches `brand.css` as written.
- The committed `projects` and `gallery` baselines placed those links at `x=277`, i.e. **4px left**.
  They were captured *before the `margin-left: 4px` CSS edit* but landed in the same merge commit
  (`098f0b1`) as that edit — `git log --follow` shows `098f0b1` is the last commit to touch those
  PNGs, so they do not predate the commit, only the edit within it. The Entry 086 regeneration and
  the Entry 087 nav change were squashed together, and the snapshots were never re-captured after
  the CSS moved.
- The gate never caught it. A 4px nav shift is only ~1,600 differing pixels; against
  `maxDiffPixelRatio: 0.001` on pages 2,500-4,300px tall, that is comfortably under the budget.
  **The gate's tolerance scales with page height, so a small localised shift on a tall page is
  invisible to it.**
- `index` was unaffected (0 differing pixels even under `--update-snapshots=all`), which is why the
  drift never surfaced as a failure anywhere.

Diagnostic dead end worth recording: an initial `--update-snapshots` run on `index` left the file
unchanged and looked like proof of "no drift". It was not — Playwright 1.61's default update mode is
`changed`, which only rewrites a snapshot when the test **fails**. Forcing `--update-snapshots=all`
is what actually re-captures a passing test.

### Adjudication table (all 40 baselines, before vs after, tolerance 8/channel)

| Group | Files | Result | Verdict |
|---|---|---|---|
| `index-*` | 8 | 0 differing px | **Correct** — index has no active nav *link* (the logo carries `is-active`), and the Projects page change cannot reach it. Untouched. |
| `contact-360-*` | 2 | 0 differing px | **Correct** — mobile nav layout differs; no shift at that width. |
| `contact-*` (768/1024/1440) | 6 | 787-1028 px, nav band only (rows 25-46) | **Correct** — label-text-only 4px shift. Contact has no active link (links commented out pending Netlify forms), so only glyph rows differ. Pre-existing drift, now captured truthfully. |
| `gallery-*` | 8 | 1274-1637 px, nav band only (rows 0-74) | **Correct** — Gallery link is active, so the pill background shifts too, giving a taller band than contact. Same 4px cause. |
| `projects-*`, `projects-mistrust-*` @ 1024/1440 | 8 | 11.3k-12.5k px, rows 0-320/340 | **Correct** — nav band (4px drift) plus the intended heading/tab shift from `lg:pt-6`→`lg:pt-8`. Right-hand content column unchanged. |
| `projects-*`, `projects-mistrust-*` @ 360/768 | 8 | **page height +8px** (e.g. 360x4270→360x4278) | **Correct** — `pt-4`→`pt-6` is exactly +8px, and the page grew by exactly 8px. The cleanest possible confirmation the change did what it says. |

No unexplained pixel changed in any of the 40 files.

**Verification:** table above; live-DOM geometry measured independently of the images
**Checkpoint:** commit + push

## Stage 2 — Prove green and stable

**Status:** Complete
**Goal:** Two consecutive green runs on a clean tree (the gate's own flake standard).
**Phases:**
- [x] 2.1 `npm test` — 45 passed
- [x] 2.2 `npm test` again — 45 passed
**Verification:** 45/45 twice; the modified-snapshot count held at exactly 30 across both runs
(40 total minus 8 untouched `index` files minus 2 untouched `contact-360` files), so the runs
introduced no churn of their own. No flake.

## Stage 2b — Port-collision fix (unplanned, found at preflight)

**Status:** Complete
**Goal:** Close the trap that nearly invalidated this whole run.

`playwright.config.js` carried a careful comment explaining that the legacy static server must not
sit on port 3000, because `next dev` defaults there and `reuseExistingServer` would silently hand
the suite a dev server instead of the built `out/`. The preview server for `out/` was then placed on
**3001** — which is exactly where `next dev` lands when 3000 is already taken. That is the same trap,
one port over.

This was not hypothetical: at preflight, `npm run dev` had landed on 3001 precisely because a stale
dev server from the previous session still held 3000. Running `npm test` in that state would have
graded the dev server while believing it was grading the static export.

- `playwright.config.js`: preview server moved to **4322**, with the reasoning recorded in place.
- `tests/visual-baseline.spec.js`, `tests/smoke-next.spec.js`: hardcoded `BASE_URL` updated to match,
  each with a comment tying it back to the config.

**Verification:** both green runs in Stage 2 ran on 4322.

## Stage 3 — Docs, review, handoff

**Status:** Active

### Shippability review (pro nano, Kilo route) — findings applied

Routing note: dispatched first to the preflight-selected OpenCode route, which produced only a bare
startup line and no events. Combined with the `model-probe:timeout` seen at preflight, that is the
known wedge signature for this host, so the run was killed and re-dispatched with
`NANO_AGENTS_RUNTIME=kilo`, which completed normally.

**One real finding, and it was my own error from earlier the same day.** `TODO.md` claimed the CI
containerization would need "a one-time regeneration of all **48** baselines". The actual snapshot
set is **40**. The 48 came from commit `833d46a`, which deleted 48 obsolete `tests/baselines/*.png`
— a different quantity entirely. During the Entry 088 docs-sync I "corrected" a correct 40 into an
incorrect 48 by conflating the two. Verified both numbers directly (`ls` on the snapshot dir = 40;
`git show --stat 833d46a | grep -c tests/baselines` = 48), fixed `TODO.md`, regenerated
`docs/sync/local-tasks.json`, and appended a correction to LOGBOOK Entry 088 so the wrong reasoning
does not get re-derived later.

Everything else came back clean: code diff correct, no stale `3001` reference anywhere functional
(the remaining ones are historical or explanatory), snapshot count of 30 modified / 10 untouched
matches the adjudication table, and the plan-doc reconciliation from Entry 088 verified accurate.
**Goal:** Repo knowledge matches reality; diff reviewed by helper and main agent.
**Phases:**
- [x] 3.1 LOGBOOK Entry 089 written; Entry 087 item 4 updated (no longer claims the change is
  uncommitted/untested)
- [x] 3.2 `TODO.md` reconciled; deferred gate-tolerance item added with its reason named
- [x] 3.3 Pro nano shippability review — **1 real finding, fixed** (the `48`→`40` baseline-count
  error). OpenCode wedged; completed on Kilo.
- [x] 3.4 Oracle-class review — **PASS**. Ran on the `verifier` agent (this session's registry does
  not expose the pinned `oracle`; `verifier` is the equivalent fresh-context PASS/FAIL judge) with
  `model: fable`, since the ultracode gate passed at 13%/11%. It did not take the plan's word for
  anything: it re-extracted the pre-session `gallery-1440-dark` baseline from `098f0b1`, pixel-diffed
  it with PIL/numpy and independently reproduced 1,637 differing pixels in bbox `y[0,74] x[298,470]`,
  and ran `npm test` itself (45 passed, no new churn). One finding: the "predate Entry 087" wording
  overstated what `git log` supports — corrected here and in Entry 089.
- [x] 3.5 Main-agent final diff review — done before dispatching helpers and again after applying
  both sets of findings.
**Verification:** both verdicts recorded above
**Checkpoint:** commit + push

---

## Checkpoint log

| Stage | SHA | Push | Notes |
|---|---|---|---|
| pre | — | — | branch created + pushed; dev servers killed |
| 0-3 | `87a8b3e` | ✅ | single checkpoint: padding change, 30 regenerated baselines, port fix, docs |

## Verification matrix

| Property | How proven |
|---|---|
| Change is the only visual delta | Stage 0.2 — failures confined to Projects captures |
| New baselines are correct | Stage 1.2 — written verdict per capture |
| Suite is not flaky | Stage 2 — two consecutive green runs |
| Tree stays clean | `git status` empty after each Stage 2 run |

## Open risks

- Regenerating snapshots is the one operation this gate cannot verify for you. If adjudication is
  sloppy, a real regression gets blessed as a baseline. Mitigation: inspect diff artifacts per
  capture, and treat any non-Projects failure as a stop signal.
- Snapshots are `-chromium-win32` suffixed; regenerating here keeps them Windows-only. This does not
  worsen the existing CI blocker tracked in `TODO.md`, but it does not help it either.

## Merge readiness checklist

- [x] Failing captures confined to the Projects page (16 failed, all Projects; 29 passed)
- [x] Per-capture verdicts recorded — all 40 adjudicated numerically, nothing unexplained
- [x] Two consecutive green runs, 45/45, modified-snapshot count stable at 30
- [x] LOGBOOK / TODO / plan docs consistent
- [x] Shippability review passed (findings applied)
- [x] Oracle-class review passed — PASS, independently re-derived
- [x] Main-agent final diff review

## Notes for whoever merges

Two things in this branch were **not** in the original task and deserve a second look:

1. **30 baselines regenerated, only 16 of which relate to the padding change.** The other 14
   (`gallery` x8, `contact` x6) absorb a pre-existing 4px nav shift the gate had been tolerating.
   That is a deliberate, adjudicated decision, not drive-by churn — but it does mean this branch
   changes what "correct" looks like for pages the task never touched.
2. **The preview-server port moved 3001 → 4322.** Anyone with muscle memory for `localhost:3001`
   when previewing the built export should know it moved, and why.
