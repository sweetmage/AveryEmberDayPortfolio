# Mistrust asset re-export — 2026-08-01

**Status:** Complete — committed to `develop` as `06bd820` on 2026-08-01.
**Trigger:** The user re-exported "A History of Mistrust" from Figma to
`D:\My Stuff\creations\Best\A History of Mistrust\A History of Mistrust\` and asked for the repo's
copies to be replaced.

## Goal

Bring the repo's Mistrust source PNGs and every derived asset in line with the new Figma export,
without re-encoding the slides that did not actually change, and re-baseline the visual gate against
the artwork that now ships.

## What the export actually contains

31 PNGs: the wide cover collage `A History of Mistrust.png` plus `Instagram post - 1..30.png`. It
does **not** contain the three `sets/A History of Mistrust Set N.png` Figma strips that the repo
keeps as source-of-record — see Risks.

## Approach

1. Copy all 31 PNGs into **both** trees — `images/myart/A History of Mistrust/` (legacy root site)
   and `public/images/myart/A History of Mistrust/` (Next export). Both are git-tracked.
2. Run `node scripts/generate-mistrust-assets.js` in its **default** (not `--all`) mode. Its
   git-porcelain change detection is the whole point here: a Figma re-export rewrites the mtime of
   every PNG, so an mtime-driven rebuild would re-encode all 30 slides and bury the real diff under
   libwebp noise.
3. Confirm the on-artwork words of any changed slide still match `SLIDE_ALT` in
   `app/projects/mistrustSlides.ts` — that array is alt text *and* lightbox caption source, and the
   artwork is its source of truth.
4. Run the Playwright suite. Re-record only the baselines the new artwork legitimately moves, and
   review the regenerated PNGs by eye before they are committed.

## Files touched

- `images/myart/A History of Mistrust/**` + `public/images/myart/A History of Mistrust/**` — sources
  and derived `slides/*.webp`, `sets/set-N.webp`.
- `tests/visual-baseline.spec.js-snapshots/projects-mistrust-*` — only if the suite reports drift.
- `LOGBOOK.md`, `TODO.md`, this plan.

## Verification

- `git status` diff scoped to the two asset trees, snapshots, and docs — nothing else.
- Slide PNG dimensions unchanged (1080×1080), so `sets/set-1.webp` composition geometry holds.
- `npx playwright test` — full suite, green.
- New slide webps and any regenerated baseline PNG read visually before handoff.

## Risks

- ~~**The set PNGs are now stale.**~~ **Resolved and inverted the same day — see
  [`2026-08-01-mistrust-set-seam-dedupe-shxdowloop.md`](2026-08-01-mistrust-set-seam-dedupe-shxdowloop.md).**
  The user re-exported `sets/` that evening. Investigating those files showed this risk named the
  wrong artefact: the set PNGs were not the broken ones. `Set 1.png`'s apparent clip is a **19px
  band of artwork that slides 1 and 2 genuinely share** (99.7% identical pixels), and the composed
  `set-1.webp` — the file this plan treated as trustworthy — duplicated that band and shipped a
  visible notch in the orange arc. Strips now take pixels from slides and geometry from the exports,
  so the exports are consumed rather than merely kept.
- **Alt-text drift.** If a re-export changes the words on a slide, `SLIDE_ALT` goes wrong silently —
  screen readers and lightbox captions both. Checked explicitly per changed slide, never assumed.
- **Baseline laundering.** `--update-snapshots` without reading the regenerated PNGs defeats the
  visual gate. Every re-recorded snapshot is looked at.

## Outcome

Only **4 of the 31 PNGs differ in content**: the cover collage and Instagram posts 1, 2, 3. The
other 27 are byte-identical to what was already committed, so the re-export was a small revision.
Derived rebuild was therefore 12 slide webps (`slide-01..03` × 1x/2x × both trees) plus
`sets/set-1.webp` in both trees. Slides 1–3 were read back and their words match `SLIDE_ALT[0..2]`
verbatim — no data change needed. `mistrust-thumb.jpg` derives from slide-09, which did not change.
