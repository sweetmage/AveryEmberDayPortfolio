# Checkpoint — 2026-08-09 · Bubble wedge fix, WebKit nav fix, 39% payload cut

**Commit:** `17c5bf6` — the deployed SHA
**Branch:** `portfoliowebsite` (production — `17c5bf6` is what averyemberday.com serves)
**Previous production SHA:** `bc3e278` (published 2026-08-08)
**Logbook:** Entries 127–131

A known-good restore point. This release closes the last known open defect in the test suite, so
`npx playwright test` is now expected to be **reliably** green rather than green-if-you-are-lucky.

## What shipped

| SHA | Change |
|---|---|
| `17c5bf6` | Bubble wedge rescue keyed to lack of progress, not 1.5s of elapsed time (Entry 131) |
| `d3adf9b` | Architecture map baseline refresh |
| `8a38927` | Entries 127–130 recorded; three stale doc claims corrected |
| `0522f32` | 33 Figma source files out of `public/` — published payload 15.80 → 9.65 MB (Entry 129) |
| `a2e4300` | Theme toggle explicit width + a `webkit-mobile` Playwright project (Entries 127–128) |

Everything except `17c5bf6` had been sitting **uncommitted in the working tree** since 2026-08-09;
`bc3e278` was the last commit before this release.

## Verified state at this SHA

Verified against **the live site**, not a local build:

| Check | Result |
|---|---|
| Netlify deploy | `state: ready`, `skipped: null` — it genuinely built |
| Pages | `/`, `/projects/`, `/gallery/`, `/contact/`, `/contact/thanks/` all 200 |
| Deployed engine | `/scripts/bubbles.js` contains `NO_PROGRESS_FRAMES` — the fix is live, not just committed |
| Payload cut is live | a deleted source PNG 404s in production |
| Nothing over-deleted | `slides/slide-01.webp` still 200 |
| `npx playwright test` | **151/151, twice consecutively** before the push |
| Bubble probe | 3600 frames on both previously-failing cases, **zero** overlap frames, two separate passes |
| WebKit nav gate | proven by injected regression — reverting the CSS fails 20 of its 21 assertions |

## Rollback

```bash
git revert 17c5bf6            # the bubble fix alone
git revert 0522f32            # restores the 6 MB of sources to public/
git reset --hard bc3e278      # everything, back to the 2026-08-08 release
git push --force-with-lease origin portfoliowebsite
```

A force-push to this branch republishes production and costs another 15 credits. `bc3e278` is the
previous known-good SHA and has its own checkpoint at
[`2026-08-08-post-interview-release.md`](2026-08-08-post-interview-release.md).

## Caveat worth carrying forward

The bubble fix is verified by frame-by-frame instrumentation and two clean full runs, but the
failure it removes was always **stochastic** — roughly 1 run in 3 before, and it passed 10/10
standalone even while genuinely broken. Two clean runs are strong evidence, not proof. If a
`bubbles-exclusion` assertion ever goes red again, read `AGENTS.md` first: the zones on this site
overlap each other, and three wrong fixes have come out of reasoning about this engine instead of
measuring it.
