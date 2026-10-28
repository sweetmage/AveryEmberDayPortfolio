# Plan docs — index

Every plan in this directory, with its status and where the work is recorded.

**Plan docs are not a to-do list.** They record *how* something was built and why the choices were
made. Open work lives in [`../../TODO.md`](../../TODO.md) and nowhere else — if a plan here contains
an unticked box, it belongs in `TODO.md` too. Verify with:

```bash
grep -rn "^\s*- \[ \]" docs/plans/
```

That returns nothing as of 2026-10-20.

---

## Active

| Plan | Status |
|---|---|
| [`2026-10-28-bubble-brand-guide-pdf.md`](2026-10-28-bubble-brand-guide-pdf.md) | **Planned.** The college retro brand guide PDF rebuilt in the bubble brand (HTML pages printed to PDF with Playwright). Waiting on the user's answers to six open questions. Tracked in `TODO.md`. |
| [`2026-10-20-visual-gate-container.md`](2026-10-20-visual-gate-container.md) | **In progress.** Containerized visual gate (one Linux baseline set inside the Playwright image, run through Colima) and this plans sweep. |
| [`2026-10-13-logo-design-and-brand-expansion.md`](2026-10-13-logo-design-and-brand-expansion.md) | **Open: Brand Assets only (Track C).** Tracks A, B and D shipped (SECTION 6 tile and page, Tools rows, watermark fix) and so did brand voice. The Brand Assets section (business card and website banner, each as design plus mockup) is built hidden behind `SHOW_BRAND_ASSETS = false`; the user will design the pieces. Tracked in `TODO.md`. |
| [`2026-10-13-overnight-plans-shxdowloop.md`](2026-10-13-overnight-plans-shxdowloop.md) | **Open: Brand Assets only.** Everything else in the loop shipped (mockups 1, 2, 3 and the voice section of 5; the copy pass). Mockup 4, the business card, was not approved; the user will design it. Keeps the five mockups in [`2026-10-13-overnight-plans/`](2026-10-13-overnight-plans/mockups/index.html). |

## Complete

Nothing. Finished plans are moved into [`../archives/plans.md`](../archives/plans.md) as stubs, each
with its outcome, its LOGBOOK entries, and the `git show <sha>:<path>` command that restores the full
text:

- 2026-08-09: all 23 plans finished by then ([stubs](../archives/plans.md#consolidation-stubs-2026-08-09));
- 2026-10-04: the two shipped on 2026-08-10 ([stubs](../archives/plans.md#consolidation-stubs-2026-10-04));
- 2026-10-06: the three shipped in the Portfolio release, Entry 142 ([stubs](../archives/plans.md#consolidation-stubs-2026-10-06)), then the next-step loop's two ([stubs](../archives/plans.md#consolidation-stubs-2026-10-06-b)).
- 2026-10-20: the seven plans finished between Aug 1 and Oct 18 — copy pass, print mockups, brand voice (draft and recommendation), fluid squishy bubbles, SECTION 6 logo descriptions, visual baselines ([stubs](../archives/plans.md#consolidation-stubs-2026-10-20)). The two plans carrying the open Brand Assets work stay above.

`fluid-squishy-bubbles/artifacts/` stays here although its plan is archived: it holds the bubble-motion
baselines that `AGENTS.md` and `tests/bubbles-motion.spec.js` point at.

A plan is archived only once it is in git history, since the recovery path is `git show`. This
directory holds only plans with work still open: a plan sitting here means something is unfinished.

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
