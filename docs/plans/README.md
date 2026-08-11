# Plan docs — index

Every plan in this directory, with its status and where the work is recorded.

**Plan docs are not a to-do list.** They record *how* something was built and why the choices were
made. Open work lives in [`../../TODO.md`](../../TODO.md) and nowhere else — if a plan here contains
an unticked box, it belongs in `TODO.md` too. Verify with:

```bash
grep -rn "^\s*- \[ \]" docs/plans/
```

That returns nothing as of 2026-08-10.

---

## Active

| Plan | Status |
|---|---|
| [`2026-08-01-copy-pass-and-gallery-descriptions.md`](2026-08-01-copy-pass-and-gallery-descriptions.md) | **Tracks A and C wait on the user's first draft.** Track B is done (Entry 118); the render path for `description` now exists, so the copy is data only. |

## Shipped, awaiting archive

These two are **complete** — nothing in them is open. They are still sitting here for one mechanical
reason: **both were written on 2026-08-10 and have never been committed.** The archive's recovery
instructions are `git show <sha>:<path>`, so deleting a file that has no history would destroy it
rather than archive it. Archive them into
[`../archives/plans.md`](../archives/plans.md#consolidation-stubs-2026-08-09) **in the commit after
the one that first tracks them**, and the "a file here means unfinished" invariant holds again.

| Plan | Outcome |
|---|---|
| [`2026-08-10-sticky-rail-one-column-rule.md`](2026-08-10-sticky-rail-one-column-rule.md) | Shipped. Nav unpinned below 768px, tab/filter groups pinned from 768px up, overlay tokens so "one screen" means the chrome actually pinned. The pre-existing `lg:sticky` rail was measured to have zero travel and had never worked since Entry 079. Entry 134; 18 new `sticky-chrome.spec.js` cases. |
| [`2026-08-09-bubble-exclusion-flake.md`](2026-08-09-bubble-exclusion-flake.md) | Shipped. Bubbles seed clear of zones, the escape beats an opposing neighbour, and relocating bubbles are no longer parked on the furniture. Entry 135. Fix B landed as containing-zone exclusivity plus nearest-free-edge selection rather than the planned bigger step; the mirror to `public/` and a missing `_escape` method were both caught in Entry 135. |

## Complete

Nothing yet, beyond the two above. **On 2026-08-09 all 23 finished plans were archived** into
[`../archives/plans.md`](../archives/plans.md#consolidation-stubs-2026-08-09), which carries the
outcome and LOGBOOK entry for each one plus the git commands to restore any full text. This
directory now holds only plans with work still open, which is the point of the split: a plan sitting
here means something is unfinished.

**Do not look for design rationale in the archive first.** The load-bearing rules those plans
established were promoted into [`../../AGENTS.md`](../../AGENTS.md) as they landed — the hover
contract, square images in rounded frames, the gallery expand geometry, the picture-is-the-wall
bubble rule, the Mistrust one-screen cap, and the shared content geometry. `AGENTS.md` is current;
an archived plan is a record of one moment.

## A note on stale branch/date lines

Archived plans open with a "Branch:" or status line written *during* the run — some say "not
pushed", some cite a deploy-pause date of Aug 6 that was later corrected to Aug 7. Those lines are
accurate as records of the moment they were written and were deliberately not rewritten before
archiving. The stub table is the current status; the plan bodies are history.
