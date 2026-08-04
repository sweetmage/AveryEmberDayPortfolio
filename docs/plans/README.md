# Plan docs — index

Every plan in this directory, with its status and where the work is recorded.

**Plan docs are not a to-do list.** They record *how* something was built and why the choices were
made. Open work lives in [`../../TODO.md`](../../TODO.md) and nowhere else — if a plan here contains
an unticked box, it belongs in `TODO.md` too. Verify with:

```bash
grep -rn "^\s*- \[ \]" docs/plans/
```

That returns nothing as of 2026-08-03.

Older plans are consolidated into [`../archives/plans.md`](../archives/plans.md).

---

## Active

| Plan | Status |
|---|---|
| [`2026-08-01-copy-pass-and-gallery-descriptions.md`](2026-08-01-copy-pass-and-gallery-descriptions.md) | **Planned, not started.** Tracks A and C wait on the user's first draft; Track B is independent and buildable now. |
| [`2026-08-01-gallery-expand-motion-concept.md`](2026-08-01-gallery-expand-motion-concept.md) | **Concept, not started.** Visual/motion spec for Track B above. Blocked on nothing. |

## Complete

Newest first. "Entry" refers to `LOGBOOK.md`.

| Plan | Outcome |
|---|---|
| [`2026-08-01-mistrust-set-seam-dedupe-shxdowloop.md`](2026-08-01-mistrust-set-seam-dedupe-shxdowloop.md) | Set strips now take pixels from slides and geometry from the Figma export, closing a duplicated 19px seam. Entry 114, merged `ada0210`. |
| [`2026-08-01-mistrust-asset-reexport.md`](2026-08-01-mistrust-asset-reexport.md) | Figma re-export swapped into both asset trees. Entry 113, commit `06bd820`. |
| [`2026-07-31-mistrust-slideshow-redesign.md`](2026-07-31-mistrust-slideshow-redesign.md) / [`-shxdowloop.md`](2026-07-31-mistrust-slideshow-shxdowloop.md) | Swipeable stage, React lightbox, set mosaics. Entry 109, merged `152cf2f`. |
| [`2026-07-28-contact-polish-width-unification.md`](2026-07-28-contact-polish-width-unification.md) | Contact polish + one content width site-wide. Entry 107. |
| [`2026-07-27-contact-unhide-mistrust-assets.md`](2026-07-27-contact-unhide-mistrust-assets.md) | Contact unhidden, Mistrust assets resynced, og card regenerated. Entry 106. |
| [`2026-07-24-gallery-tag-system.md`](2026-07-24-gallery-tag-system.md) | `All / Digital / Traditional / Both` filter, tag data wired, vertical rail. Entries 099–101, commit `235f254`. **Decision 3 (visible tag pills) was superseded** in Entry 101 by sr-only tags + a visible tool list. |
| [`2026-07-24-bubble-visual-cleanup-shxdowloop-nanoagent-plan.md`](2026-07-24-bubble-visual-cleanup-shxdowloop-nanoagent-plan.md) | Bubble-test flake fixed by frame-based sampling; visual-gate defects closed (`maxDiffPixels: 500` floor, server into `globalSetup`); gallery filter rail. Entries 099–101, commit `15fe32d`. |
| [`2026-07-24-bubble-hero-exclusions-shxdowloop.md`](2026-07-24-bubble-hero-exclusions-shxdowloop.md) | Hero logo/blob exclusions + the repo's first motion-enabled tests. Entry 090. |
| [`2026-07-24-projects-heading-padding-shxdowloop.md`](2026-07-24-projects-heading-padding-shxdowloop.md) | Heading padding, with all 40 baselines adjudicated numerically. Entry 089. |
| [`2026-07-24-docs-sync-todo-consolidation.md`](2026-07-24-docs-sync-todo-consolidation.md) | Plan-doc status reconciliation. Entry 088; re-run 2026-08-01 (Entry 112) and again 2026-08-03 (Entry 115). |
| [`2026-07-24-cross-page-css-consistency.md`](2026-07-24-cross-page-css-consistency.md) | Home/Gallery unified on `.brand-page-title` / `.brand-title-bar`; gallery cards onto brand tokens. Entry 097; follow-on Entry 098. |
| [`2026-07-24-gallery-widening.md`](2026-07-24-gallery-widening.md) | 1400px centered container, 3 columns at `xl`. Entry 095. |
| [`2026-07-23-nav-button-restyle.md`](2026-07-23-nav-button-restyle.md) | Square, no-chrome-at-rest nav group; scope grew to the logo-as-home-button and the project-tab restyle. Entries 082–087, merged `098f0b1`. |
| [`2026-07-22-visual-baseline-gate-shxdowloop.md`](2026-07-22-visual-baseline-gate-shxdowloop.md) | Baselines converted into a real compare-based gate. Entry 081, `833d46a` → `6ddccd2`. **Its one carried-over item — running the gate in CI — now lives in [`../visual-gate.md`](../visual-gate.md).** |
| [`2026-07-15-projects-vertical-tabs.md`](2026-07-15-projects-vertical-tabs.md) | Sticky vertical Projects rail at `lg+`. Entries 079–080. |
| [`2026-07-14-nav-restructure.md`](2026-07-14-nav-restructure.md) / [`-wrapup-shxdowloop.md`](2026-07-14-nav-restructure-wrapup-shxdowloop.md) | Home/Projects/Gallery/Contact restructure. Entries 075–078. |
| [`2026-07-13-srcset-variants.md`](2026-07-13-srcset-variants.md) | srcset/@2x variants. Entry 073, commit `f63671d`. |
| [`2026-07-12-motion-load-perf.md`](2026-07-12-motion-load-perf.md) | Time-to-motion / TTI reductions. Entry 072. |

## A note on stale branch/date lines

Several completed plans open with a "Branch:" or status line written *during* the run — some say
"not pushed", some cite a deploy-pause date of Aug 6 that was later corrected to Aug 7. Those lines
are accurate as records of the moment they were written and are deliberately not rewritten. This
table is the current status; the plan bodies are history.
