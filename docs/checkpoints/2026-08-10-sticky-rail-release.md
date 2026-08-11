# Checkpoint — 2026-08-10 · The one-column rule, and a stale branch reconciled

**Commit:** `73b5fa4` — the deployed SHA
**Branch:** `portfoliowebsite` (production — `73b5fa4` is what averyemberday.com serves)
**Previous production SHA:** `6bf9598` (published 2026-08-09)
**Logbook:** Entry 133

A known-good restore point. One commit, but it carries two distinct things: a user-facing nav/rail
behaviour change, and the reconciliation of a `develop` branch that had fallen 8 commits behind
production.

## What shipped

| Area | Change |
|---|---|
| Nav + rails | The one-column rule: pinned at ≥768px, nothing pinned below it |
| `brand.css` | `--brand-nav-overlay` / `--brand-rail-overlay` / `--brand-top-overlay`; `.brand-nav` `sticky` → `relative` with `sticky` restored at ≥768; first `scroll-padding-top` the site has ever had |
| `ProjectTabs` / `GalleryGrid` | `sticky` moved from the tablist onto its wrapper column; `top-16` → `top-(--brand-nav-height)` |
| `useStickyRailOverlay.ts` | New — publishes the pinned strip's height, measured not parsed |
| `bubbles.js` ×2 | `seedPosition` seeds clear of exclusion zones |
| Visual gate | Two stability fixes: fonts actually loaded (Trap 5), document height settled (Trap 6) |
| `docs/plans/` | 23 finished plans archived into `docs/archives/plans.md` |

**The Projects rail had never worked.** `lg:sticky` sat on the tablist, whose containing block is a
wrapper exactly its own height — travel 0px, so it computed as sticky and behaved as static, from
Entry 079 until it was measured on 2026-08-10 (rail top −570px after a 1000px scroll at 1024). The
visual gate is structurally blind to it: `fullPage` captures at scroll 0, where a rail with travel
and a rail without are the same picture.

## What was deliberately dropped

`develop` also carried a bubble wedge fix and a `Script.js` removal. **Both were dropped** — production
had already done each, and better, in Entries 131 and 128. The two wedge investigations were
independent and agreed (68 consecutive overlap frames there, 67 on `develop`, `_relocating` FALSE in
both), so that root cause is settled. Production's mechanism survives; only the complementary
seed-clear was lifted across.

The pre-reconciliation `develop` tree is preserved as **`ded51f5`** and is not merged.

## Verified state at this SHA

| Check | Result |
|---|---|
| `npx playwright test` | **171/171, twice consecutively** before the push |
| Sticky contract | 18 new `sticky-chrome.spec.js` cases, all assertions taken after a scroll |
| Measured live, headed | 360: nav `relative`, top −1000. 768: `sticky`, top 0, rail at 62. 1440: `sticky`, top 0, rail at **76** |
| The 76 is the point | `--brand-nav-height` clamps to 76px from 1267px up; the old hardcoded `top-16` buried the rail's first 12px at 1440+ |
| Theme independence | `--brand-top-overlay` asserted equal in dark and light at 360/768/1440 |
| Engine copies | `scripts/` and `public/scripts/` byte-identical |
| Architecture map | `shxdowmap refresh --auto` → fresh |

> **Deploy verification is NOT recorded here**, unlike the previous checkpoint. This file was written
> *before* the push on purpose, so the release costs **one** production deploy (15 credits) instead
> of the two the 2026-08-09 release spent on a follow-up docs commit. Confirm the deploy separately
> with the API call in [`../deploys.md`](../deploys.md); if it did not reach `state: ready`, that is a
> defect in this release, not in this note.

## Rollback

```bash
git revert 73b5fa4                  # everything in this release
git reset --hard 6bf9598            # back to the 2026-08-09 release
git push --force-with-lease origin portfoliowebsite
```

A force-push to this branch republishes production and costs another 15 credits. `6bf9598` is the
previous known-good SHA, checkpointed at
[`2026-08-09-bubble-wedge-fix-release.md`](2026-08-09-bubble-wedge-fix-release.md).

## Caveat worth carrying forward

The nav is `position: relative` below 768px, **not `static`** — and that distinction is load-bearing
rather than stylistic. The iridescent spectrum bar inside the nav is `position: absolute; bottom: 0`,
so under `static` it escaped to the initial containing block and painted a gradient rule across the
middle of the page. It was caught in a 360px capture and is guarded by an explicit assertion in
`sticky-chrome.spec.js`. If anyone "simplifies" that back to `static`, the suite should catch it —
the visual gate will not, because it captures at scroll 0.
