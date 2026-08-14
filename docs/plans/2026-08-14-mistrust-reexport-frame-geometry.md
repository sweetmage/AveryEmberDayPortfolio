# A History of Mistrust — browser re-export, and geometry from frame coordinates

**Date:** 2026-08-14
**Agent:** Opus 5 (vellum, main)
**Cycle:** shxdowflow
**Status:** in progress

## Goal

Re-export the 30 "A History of Mistrust" slide frames from Figma through the user's own logged-in
browser, replace the repo's source PNGs, and regenerate every derived asset.

Second, remove the build's dependency on the three `sets/A History of Mistrust Set N.png` raster
exports by taking strip geometry from the frames' real canvas coordinates instead.

## Why the second half is not scope creep

`scripts/generate-mistrust-assets.js` composes the wide `sets/set-N.webp` strips from **slide
pixels** at offsets **derived from those three raster exports** (Entry 114). The derivation
template-matches every slide into its strip and throws above a 2.0 distance.

The user is currently reworking Section 81 into a seamless overlay that spans a whole row of
slides. The moment that artwork lands, the committed strips no longer match their slides, the
match blows past tolerance, and the generator refuses to build — correctly, but fatally, because
**the user's Figma export does not include `sets/`** (Entry 113 recorded exactly this, and the
file has no Set 1/2/3 frames or sections today; only `Section 81` plus the 30
`Instagram post - N` frames).

So a slide re-export cannot complete without also solving the geometry source. Chosen approach
(user decision, 2026-08-14): read the offsets from frame coordinates.

A continuous overlay raises the stakes rather than lowering them. Every slide carries its own
slice of the squiggle; if an offset is off by a pixel the overlay breaks at all nine seams. That
is the exact class of defect that shipped from 2026-07-27 to 2026-08-01.

## Approach

Introduce a committed geometry manifest and make it the single source of strip layout.

`images/myart/A History of Mistrust/frame-geometry.json` — one entry per frame, holding the
frame's absolute Figma canvas `x`, `y`, `width`, `height`, its node id, and its name. The
generator derives each set's offsets as `x - min(x)` across that set's ten members.

This is strictly better than the raster derivation it replaces:

- It is the actual authority. The old path recovered offsets from a picture *of* the layout; this
  reads the layout.
- It cannot go stale against artwork. Repainting a frame changes no coordinate, so a pure art
  revision stops being able to fail the build.
- It is reviewable. Thirty integers in a diff beat a 6 MB PNG nobody can eyeball.

The tradeoff, stated plainly: the manifest **can** go stale if frames are moved or resized in
Figma, and unlike the raster match nothing detects that from pixels alone. Mitigated by asserting
every slide PNG's dimensions against its manifest entry on every build, which catches resizes
outright, and by re-reading coordinates whenever the export is re-run.

### Bootstrap and cross-check

The manifest's numbers are confirmed by two independent sources before anything ships:

1. **Captured from the last known-good state** (done, before any artwork changed) by running the
   existing derivation against the committed slides and strips. Every one of the 30 slides matched
   at d ≤ 0.001. Set 1 = 10781px with a 19px overlap at slide 2; set 2 = 10800px, uniform; set 3 =
   10775px with slide 21 at 1056px wide and a 1px overlap at slide 25.
2. **Read from Figma** during the export pass. Consecutive-frame deltas must reproduce the
   captured offsets exactly. A disagreement stops the run and gets reported, not reconciled.

## Files to touch

| File | Change |
|---|---|
| `images/myart/A History of Mistrust/Instagram post - N.png` (×30) | Replaced by the re-export. Only content-changed files kept; byte-noise reverts. |
| `images/myart/A History of Mistrust/frame-geometry.json` | New. The manifest. |
| `scripts/generate-mistrust-assets.js` | `deriveOffsets` reads the manifest; drops `setExport` and the template match. Adds per-slide dimension assertions. Staleness keys on the manifest instead of the set exports. |
| `tests/mistrust-sets.spec.js` | Holds `set-N.webp` to the manifest plus slide pixels rather than to the raster export. |
| `images/myart/A History of Mistrust/sets/A History of Mistrust Set N.png` (×3) | Retired as a build input and a test input. **Kept** as source-of-record; untouched on disk. |
| `AGENTS.md`, `docs/ARCHITECTURE.md` | Both document the "geometry from the Figma export" contract. Both must change. |
| `public/images/myart/A History of Mistrust/**` | Regenerated outputs only. No sources. |
| `tests/visual-baseline.spec.js` snapshots | Re-baseline only if the diff is adjudicated as an artwork revision. |

## Plan review resolutions (pro nano, 2026-08-14)

Seven findings, all resolved before implementation rather than after:

1. **The replacement test must verify per-slide pixel placement, not just total width.** Correct and
   the most valuable finding — a width-only check passes a strip built from the right slides in the
   wrong order, which is the Entry 106 bug. `tests/mistrust-sets.spec.js` now compares each slide's
   column profile against the strip *at its manifest offset*.
2. **Dimension assertions in both generator and test.** Done, at both points, for the stated reason:
   the generator catches a resize before composing, the test catches a manifest edited afterwards.
3. **Coordinate mechanism was unspecified.** Resolved: read from the Figma Design panel through
   OpenTabs against the user's live session. Not the REST API — that needs a personal access token,
   and no `FIGMA_*` credential exists in `.env`, the shared master, or the voidware keystore.
4. **Fail loudly on a missing or malformed manifest.** Done, and negative-testing found this was
   *not* enough on its own: with the manifest deleted nothing registers as stale, so every set was
   skipped and the run exited 0. `main()` now validates before the staleness logic. Exits 1.
5. **Decide the fate of the raster exports before implementing, not after.** Agreed. They stay, as
   source-of-record only, no longer a build or test input.
6. **Staleness mitigation is weaker than claimed.** Accepted as stated; a pure translation is caught
   by nothing. Written into the script header and `AGENTS.md` as a standing instruction to re-read
   coordinates on every export rather than dressed up as solved.
7. **Manifest schema unspecified.** Keyed by `slide` (1-30), not name, because names change. Node
   ids carried for traceability. Validated on load: exactly 30 entries, integer `x`/`width`/
   `height`, positive dimensions, no duplicates, no gaps in 1-30.

## Steps

1. **[done]** Capture geometry from the verified-good committed state.
2. **[done, pulled forward]** Land the generator + test refactor against the *current* slides and
   prove it behaviour-preserving: regeneration produced **byte-identical** `set-N.webp` in both
   trees, same 19px and 1px dedupe reported. Guards negative-tested — gap, resize, short manifest
   and missing manifest each throw with an actionable message. Suite 173 tests, set-strip specs
   6 → 8, all green. Doing this before the artwork swap keeps the two diffs separately reviewable.
3. Wait for the user's go on the overlay.
4. Export the 30 frames via OpenTabs against the user's live session; read frame coordinates in the
   same pass; cross-check against step 1.
5. Write the manifest. Swap the slide PNGs in. Revert byte-identical ones so the diff is honest.
6. [done in step 2] Rework the generator and the test onto the manifest.
7. Regenerate (default mode, never `--all` — mtime-driven rebuilds bury a real revision under
   libwebp noise).
8. Verify. Re-read `SLIDE_ALT` against any slide whose words changed.
9. Docs: `LOGBOOK.md`, `TODO.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `shxdowmap refresh`.

## Verification

- `node scripts/generate-mistrust-assets.js` reports only genuinely changed sources.
- `npx playwright test tests/mistrust-sets.spec.js` green against the reworked assertions.
- `npx playwright test tests/mistrust-slideshow.spec.js` green (set title cards on 1 / 11 / 21).
- Full suite, with any visual-baseline movement inspected as a diff image **before** re-baselining.
- Seam inspection at 1:1 on the composed strips, specifically across the Section 81 overlay.
- `npx tsc --noEmit`.

## Observed: a font-load flake in the full suite, unrelated to this work

The post-refactor full run came back **169 passed, 4 failed** — `index @ 768 dark`,
`projects @ 1024 light`, `projects @ 1440 dark`, `contact @ 1024 dark`. All four failed identically,
timing out in `visual-baseline.spec.js:136` waiting on
`document.fonts.status === 'loaded'`, **not** on a pixel diff. Re-running
`tests/visual-baseline.spec.js` standalone: **40 passed**.

Not caused by this change — the assets it regenerates are byte-identical, so the rendered pages are
unchanged, and nothing here touches font loading. It reads as contention under six workers sharing
one server. Distinct from the documented ~1-in-3 bubble flake at Contact @ 1440. Recorded rather
than chased; it belongs in `TODO.md`, not in this plan's scope.

## Risks

- **The manifest goes stale silently if frames move.** The mitigation is dimension assertions plus
  re-reading on every export; neither catches a pure translation. Accepted, with the reasoning
  recorded here and in the script header.
- **`SLIDE_ALT` drift.** The artwork is the source of truth for alt text *and* lightbox captions. A
  re-worded slide corrupts both silently. Any slide whose pixels changed gets read back.
- **Re-baselining as laundering.** 8 of the 40 visual baselines cover `projects-mistrust`. Movement
  must be adjudicated from the diff image before `--update-snapshots`, per Entry 113.
- **Two hands in one Figma file.** The user is editing live. The export pass takes the tab briefly
  and only after they say go.

## Parallel tracks

Sequential by necessity. The export gates the manifest, the manifest gates the generator, the
generator gates verification, and the whole chain waits on the user's overlay. The one genuinely
independent piece — capturing the bootstrap geometry — was pulled forward and is done.
