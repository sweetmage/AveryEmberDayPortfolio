# Plan docs — index

Every plan in this directory, with its status and where the work is recorded.

**Plan docs are not a to-do list.** They record *how* something was built and why the choices were
made. Open work lives in [`../../TODO.md`](../../TODO.md) and nowhere else — if a plan here contains
an unticked box, it belongs in `TODO.md` too. Verify with:

```bash
grep -rn "^\s*- \[ \]" docs/plans/
```

That returns nothing as of 2026-10-04.

---

## Active

| Plan | Status |
|---|---|
| [`2026-08-01-copy-pass-and-gallery-descriptions.md`](2026-08-01-copy-pass-and-gallery-descriptions.md) | **Tracks A and C wait on the user's first draft.** Track B is done (Entry 118); the render path for `description` now exists, so the copy is data only. |
| [`2026-10-04-focus-ring-stagger-archive.md`](2026-10-04-focus-ring-stagger-archive.md) | **Shipped in Entry 134** (focus rings, gallery entrance stagger, this archive). Left here only because it first enters git history in that commit: archive it in the *next* session, since the archive's recovery path is `git show <sha>:<path>` and a file with no history would be lost rather than archived. |

## Complete

Nothing. **On 2026-08-09 all 23 finished plans were archived** into
[`../archives/plans.md`](../archives/plans.md#consolidation-stubs-2026-08-09), and on 2026-10-04 the
two shipped on 2026-08-10 joined them
([stubs](../archives/plans.md#consolidation-stubs-2026-10-04)). The archive carries the
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
