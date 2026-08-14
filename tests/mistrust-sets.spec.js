// @ts-check
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Integrity of the three wide `sets/set-N.webp` strips.
 *
 * These need their own gate because the visual baselines cannot cover them: the Next app renders
 * its own CSS mosaic from the individual slides (see `app/projects/SlideGrid.tsx`), so the
 * `projects-mistrust` screenshots stay green no matter what the strips look like. The only
 * consumer is the legacy root page `projects/history-of-mistrust.html`, which the suite does not
 * screenshot, plus whoever the full-set artefact is shared with.
 *
 * That blind spot is how a duplicated 19px seam shipped in `set-1.webp` from 2026-07-27 until
 * 2026-08-01: slides 1 and 2 share a band of artwork, and composing at cumulative native widths
 * drew it twice.
 *
 * These assertions hold the *committed* strips to `frame-geometry.json`, the manifest of where
 * each frame sits on the Figma canvas, which is where `scripts/generate-mistrust-assets.js` takes
 * its layout from as of 2026-08-14. Until then the offsets were recovered by template-matching
 * each slide into the `sets/A History of Mistrust Set N.png` raster exports, and this file held
 * the strips to those exports. Those PNGs are still kept as source-of-record but are no longer a
 * build input or a test input; see the script header and AGENTS.md.
 *
 * **Total width is deliberately not the only check.** Getting the width right while placing the
 * wrong slide at an offset is a real failure mode — Set 3 shipped Set 2's slides once already
 * (Entry 106) — so every slide is verified to actually appear at its own manifest offset.
 *
 * No browser is used; this is pure asset verification that rides along with the gate.
 */

// Playwright transpiles specs to CJS, so `__dirname` is available and `import.meta` is not.
const ROOT = path.join(__dirname, '..');
const REL = 'images/myart/A History of Mistrust';
const SLIDE_COUNT = 30;

const composedPath = (tree, n) => path.join(ROOT, tree, REL, 'sets', `set-${n}.webp`);
const sourceSlide = (n) => path.join(ROOT, REL, `Instagram post - ${n}.png`);
const setMembers = (n) => Array.from({ length: 10 }, (_, i) => (n - 1) * 10 + i + 1);

const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, REL, 'frame-geometry.json'), 'utf8')
);
const bySlide = new Map(manifest.frames.map((f) => [f.slide, f]));

/** One row of per-column average brightness; `resize(w, 1)` is exactly a column mean. */
async function columnProfile(file) {
  const meta = await sharp(file).metadata();
  const data = await sharp(file)
    .greyscale()
    .resize(meta.width, 1, { fit: 'fill' })
    .raw()
    .toBuffer();
  return { data, width: meta.width, height: meta.height };
}

/** The layout the generator would compose for set n, straight from the manifest. */
function layoutFor(n) {
  const entries = setMembers(n).map((slide) => bySlide.get(slide));
  const originX = Math.min(...entries.map((f) => f.x));
  const slides = entries.map((f) => ({ ...f, offset: f.x - originX }));
  return {
    slides,
    width: Math.max(...slides.map((s) => s.offset + s.width)),
    height: Math.max(...slides.map((s) => s.height)),
  };
}

test('frame-geometry.json describes all 30 slides', () => {
  expect(manifest.frames).toHaveLength(SLIDE_COUNT);
  for (let n = 1; n <= SLIDE_COUNT; n++) {
    const f = bySlide.get(n);
    expect(f, `no manifest entry for slide ${n}`).toBeDefined();
    expect(Number.isInteger(f.x), `slide ${n} x`).toBe(true);
    expect(f.width, `slide ${n} width`).toBeGreaterThan(0);
    expect(f.height, `slide ${n} height`).toBeGreaterThan(0);
  }
});

test('every slide PNG matches its manifest dimensions', async () => {
  // The generator asserts this too. Both assert on purpose: the generator catches a resize before
  // it composes, and this catches a manifest edited after the last regeneration.
  for (let n = 1; n <= SLIDE_COUNT; n++) {
    const meta = await sharp(sourceSlide(n)).metadata();
    const f = bySlide.get(n);
    expect(
      { w: meta.width, h: meta.height },
      `slide ${n} differs from frame-geometry.json`
    ).toEqual({ w: f.width, h: f.height });
  }
});

for (const n of [1, 2, 3]) {
  test(`set-${n}.webp matches the geometry manifest`, async () => {
    const layout = layoutFor(n);
    const composed = await columnProfile(composedPath('.', n));

    // Geometry is the whole point: a wrong offset anywhere changes the total width.
    expect(composed.width, `set-${n} width`).toBe(layout.width);
    expect(composed.height, `set-${n} height`).toBe(layout.height);

    // Width alone would pass a strip built from the right slides in the wrong order, so each
    // slide is checked where the manifest says it lives.
    //
    // The strip is lossy webp against lossless PNG sources, so exact equality is not the bar. A
    // misplaced slide shows up as whole regions drifting, which these two bounds catch while
    // leaving ample room for q80 encoding noise.
    //
    // Overlapping bands are compared as-is rather than excluded: the composite draws left to
    // right, so where slides overlap the strip holds the later slide's pixels. That only stays
    // within tolerance because the overlapping artwork really is shared — slide 1's trailing 19
    // columns and slide 2's leading 19 are 99.7% identical. If a future overlap were not shared
    // artwork, this assertion failing is the correct outcome.
    for (const s of layout.slides) {
      const slide = await columnProfile(sourceSlide(s.slide));

      let sum = 0;
      let over8 = 0;
      for (let x = 0; x < slide.width; x++) {
        const d = Math.abs(composed.data[s.offset + x] - slide.data[x]);
        sum += d;
        if (d > 8) over8++;
      }

      expect(
        over8,
        `set-${n}: slide ${s.slide} at x=${s.offset} has columns drifting more than 8 grey levels`
      ).toBe(0);
      expect(
        sum / slide.width,
        `set-${n}: slide ${s.slide} at x=${s.offset} mean column difference`
      ).toBeLessThan(1);
    }
  });

  test(`set-${n}.webp is identical in both trees`, async () => {
    // `images/` feeds the legacy root site, `public/` feeds the Next export. They must not drift.
    const a = await sharp(composedPath('.', n)).raw().toBuffer();
    const b = await sharp(composedPath('public', n)).raw().toBuffer();
    expect(Buffer.compare(a, b), `set-${n} differs between images/ and public/`).toBe(0);
  });
}
