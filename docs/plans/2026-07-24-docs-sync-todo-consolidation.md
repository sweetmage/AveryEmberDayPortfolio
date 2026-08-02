# Docs sync + TODO consolidation — 2026-07-24

**Status:** **Complete — executed 2026-08-01** against re-verified targets (LOGBOOK Entry 112).
The original Tracks A–C had already been done by later sessions; the *goal* was re-run against the
repo as it stands. See **Re-run** below.
**Branch:** written on `portfoliowebsite`; re-run executed on `develop` (deploy pause until Aug 6).
**Requested by:** user — "plan only / update docs based on recent changes / consolidate all plan todos on todo.md"

---

## Re-run — 2026-08-01

Re-invoked eight days and 24 LOGBOOK entries later (repo at Entry 111, `45f6fcf`). **Every original
finding was verified before any file was touched, and five of the seven were already resolved.**
Executing the plan verbatim would have redone finished work — the exact failure the plan itself
warned about in Finding 1.

| # | Original finding | Verified state, 2026-08-01 |
|---|---|---|
| 1 | `2026-07-22-visual-baseline-gate-shxdowloop.md` all checkboxes unticked | **Resolved** — `Status: Complete`, zero unticked boxes |
| 2 | `2026-07-23-nav-button-restyle.md` says `In progress` | **Resolved** — `Complete — shipped 2026-07-24, merged 098f0b1` |
| 3 | `TODO.md` says "Uncommitted, unpushed" | **Resolved** — string absent |
| 4 | Containerized-Playwright CI gate is the only open plan item | **Still true and already consolidated** — `TODO.md` carries it and says so explicitly |
| 5 | AGENTS.md cites "Entry 086–089" | **Resolved** — now cites `(Entry 086)` only |
| 6 | `ProjectTabs.tsx` padding tweak unlogged | **Resolved** — LOGBOOK Entry 089 covers it, with its own plan doc |
| 7 | No `docs/ARCHITECTURE.md` | **Still true** — shxdowmap step still does not apply on this branch |

### What the re-run actually fixed

Re-applying the acceptance criterion (*grep every plan doc for open items; each survivor must have a
matching `TODO.md` line*) surfaced a fresh crop of the same defect class:

- **`2026-07-31-mistrust-slideshow-redesign.md` read `Status: Plan only — not implemented. No code
  has been written.`** for a full day after it shipped and merged (`152cf2f`, Entry 109). The single
  highest-value fix in this run, and Finding 1's failure mode recurring verbatim.
- **`2026-07-24-bubble-visual-cleanup-…-nanoagent-plan.md` had 25 unticked phase boxes** under
  per-stage `Status: Done` headers. Each stage carries its own evidence-bearing outcome notes, so the
  work had landed and only the bookkeeping lapsed. Ticked from *those notes*, not from commit
  archaeology — honouring this plan's own risk note. **Phase 4.6 (oracle-class review) was left
  unticked**: no such pass is recorded anywhere, and inferring it from the surrounding work is
  exactly the over-claim the risk warns about.
- **`2026-07-31-mistrust-slideshow-shxdowloop.md`** had two open boxes ("dev server + Chrome",
  "user has seen it in the browser") that became true on 2026-08-01.
- **`2026-07-24-gallery-tag-system.md` said "implementation started"** when it had fully shipped —
  and its decision 3 (visible tag pills) had been *superseded* by Entry 101 without the doc saying
  so. Divergence now recorded in place.
- **Two docs had no `Status:` line at all** (`2026-07-15-projects-vertical-tabs.md`,
  `2026-07-24-cross-page-css-consistency.md`), so their state was only knowable from `TODO.md`.

### Standing lesson

This is now the **second** time these plan docs drifted into claiming unstarted work that had
already shipped. The pattern is not "someone forgot" — it is that a plan doc's status is written
once at creation and nothing forces it to change at merge. Worth treating the plan header as part of
the merge checklist rather than scheduling a third reconciliation pass.

---

## Original plan (2026-07-24) — retained for the record

## Goal

Bring the durable docs back in line with what actually shipped through Entry 087, and make
`TODO.md` the single surface for every open plan item, so no pending work is only visible by
opening a plan file in `docs/plans/`.

## Findings that shape the work

1. **Plan docs are stale in a load-bearing way.** `docs/plans/2026-07-22-visual-baseline-gate-shxdowloop.md`
   still has every Stage 0–4 checkbox unticked and every stage marked `Pending`/`Active`, and its
   Merge readiness checklist is entirely unticked — but commits `833d46a`, `ce3fe3a`, `75842e5`,
   `6ddccd2` implemented stages 1–4 and the branch has since merged to production (`098f0b1`).
   Anyone reading that plan cold would redo finished work.
2. **`docs/plans/2026-07-23-nav-button-restyle.md` says `Status: In progress`** while `TODO.md`
   records it as implemented and verified through Entries 082–085, merged in `098f0b1`.
3. **`TODO.md` Active Plans says "Uncommitted, unpushed."** That is now false — everything merged
   and pushed on 2026-07-24 (Entry 087, commit `098f0b1`).
4. **Only one genuinely open plan item exists across all plan docs:** the containerized-Playwright
   CI gate (decision made, implementation not started). It is already in `TODO.md` under Standalone;
   the plan doc's Open risks section is its only other home.
5. **AGENTS.md is current** — the Design Conventions / wide-screen section already reflects Entries
   086–089. It cites "Entry 086–089"; verify 088/089 exist in LOGBOOK before leaving that reference,
   since the newest entry on disk is 087.
6. **Two uncommitted changes are unlogged:** the `ProjectTabs.tsx` heading padding bump
   (`pt-4`→`pt-6`, `lg:pt-6`→`lg:pt-8`) has no LOGBOOK coverage. The LOGBOOK edit itself (Entry 087
   item 3, the merge record) is the other.
7. **No `docs/ARCHITECTURE.md`** in this repo, so the shxdowmap freshness step does not apply.

## Approach

Docs-only. No source changes, no test run needed beyond a snapshot re-check for the one pending
`ProjectTabs.tsx` tweak (which is the user's uncommitted work and stays user-owned).

### Track A — Retire the finished plan docs

Independent of B and C; touches only `docs/plans/`.

- `2026-07-22-visual-baseline-gate-shxdowloop.md`: set header `Status: Complete (merged 098f0b1,
  2026-07-24)`, tick Stages 0–4 and the Merge readiness checklist against the actual commits, and
  reduce Open risks to the single surviving item (Linux/CI snapshot suffix) with a pointer to the
  `TODO.md` entry that now owns it.
- `2026-07-23-nav-button-restyle.md`: `Status: In progress` → `Complete — shipped 2026-07-24
  (Entries 082–085, 087), merged 098f0b1`. Append the Entry 083–087 extensions (logo affordances,
  Home link removal, left grouping, project-tab restyle, active-state logo) so the plan reflects its
  real final scope.
- `2026-07-14-nav-restructure.md`: leave `Status` as-is but sharpen the leftovers line to name the
  single remaining blocker (Netlify form-detection toggle) and cross-reference the 360px nav-fit
  caveat, so it matches the `TODO.md` "Awaiting a user step" entry exactly.

### Track B — Consolidate every open plan item into `TODO.md`

Depends on A only for wording consistency; can be drafted in parallel.

- Add a short **Open items pulled from plan docs** subsection under Open Task Threads, one line per
  item with its source plan path, so `TODO.md` is provably the complete surface. Expected content
  after A: the containerized-Playwright CI gate (already present — cross-link rather than duplicate)
  and the Netlify form-detection user step (already present — same).
- Rewrite **Active Plans**: drop the false "Uncommitted, unpushed"; move both now-complete plans into
  Completed plans with their merge commit; leave Active Plans holding only genuinely-live work.
- Condense to house format per the skill's handoff rule: pending on top, completed as 1–2 line
  summaries, backlog last, reconciled against LOGBOOK and `git log`.
- Verify the TickTick mirror note still matches after the edit (`node scripts/sync-all.js --dry-run`,
  dry-run only — no writes to a live sync target without the user asking).

### Track C — LOGBOOK + AGENTS.md accuracy

Sequential with A/B only at the final read-through.

- Add the `ProjectTabs.tsx` heading-padding tweak to Entry 087 (or a new Entry 088 if the user wants
  it separated from the merged work — recommend folding into 087 since it is the same session and
  the same page).
- Resolve the AGENTS.md "Entry 086–089" citation: either write the missing entries or correct the
  range to what exists.

## Files to touch

| File | Change |
|---|---|
| `docs/plans/2026-07-22-visual-baseline-gate-shxdowloop.md` | status + checkboxes + risk pruning |
| `docs/plans/2026-07-23-nav-button-restyle.md` | status + final-scope append |
| `docs/plans/2026-07-14-nav-restructure.md` | leftovers line sharpened |
| `TODO.md` | Active Plans rewrite, consolidated open-items section, house-format condense |
| `LOGBOOK.md` | Entry 087 gains the ProjectTabs padding tweak |
| `AGENTS.md` | fix the Entry 086–089 citation range |

## Verification

- `git log --oneline` cross-check: every ticked checkbox names a real commit.
- Grep `docs/plans/*.md` for remaining `- [ ]` and confirm each survivor has a matching `TODO.md`
  line (this is the acceptance criterion for "consolidate all plan todos on todo.md").
- `node scripts/sync-all.js --dry-run` — TickTick mirror still resolves.
- No `npm test` needed: docs-only diff. If the user later commits the `ProjectTabs.tsx` padding
  change, that commit needs `npm test` and likely a projects-snapshot refresh.

## Risks

- **Ticking checkboxes from commit messages rather than diffs** could record work as done that was
  only partially landed. Mitigation: read the four gate commits' diffs before ticking Stages 1–4.
- **The `ProjectTabs.tsx` edit is user-owned uncommitted work.** Document it; do not commit, revert,
  or re-baseline it without an explicit ask.
- **AGENTS.md Entry 086–089 range** may point at entries the user intends to write. Confirm before
  rewriting the citation rather than inventing entries.

## Out of scope

- Implementing the containerized Playwright CI gate.
- Any Netlify/forms change (user step).
- Committing or pushing anything.
