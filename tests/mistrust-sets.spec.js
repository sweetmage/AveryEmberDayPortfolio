// @ts-check
import { test, expect } from '@playwright/test';
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
 * drew it twice. `scripts/generate-mistrust-assets.js` now takes each slide's offset from the
 * Figma set export. These assertions hold the *committed* output to that contract, so a stale or
 * hand-edited strip fails here rather than silently on a page nobody screenshots.
 *
 * No browser is used; this is pure asset verification that rides along with the gate.
 */

// Playwright transpiles specs to CJS, so `__dirname` is available and `import.meta` is not.
const ROOT = path.join(__dirname, '..');
const REL = 'images/myart/A History of Mistrust';

const composedPath = (tree, n) => path.join(ROOT, tree, REL, 'sets', `set-${n}.webp`);
const exportPath = (n) => path.join(ROOT, REL, 'sets', `A History of Mistrust Set ${n}.png`);

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

for (const n of [1, 2, 3]) {
  test(`set-${n}.webp reproduces its Figma export`, async () => {
    const composed = await columnProfile(composedPath('.', n));
    const exported = await columnProfile(exportPath(n));

    // Geometry is the whole point: a wrong offset anywhere changes the total width.
    expect(composed.width, `set-${n} width`).toBe(exported.width);
    expect(composed.height, `set-${n} height`).toBe(exported.height);

    // The strip is lossy webp against a lossless PNG, so exact equality is not the bar. A
    // misplaced slide shows up as whole regions drifting, which these two bounds catch while
    // leaving ample room for q80 encoding noise. Observed on the correct build: mean ~0.1,
    // worst 3, zero columns over 8.
    let sum = 0;
    let over8 = 0;
    for (let x = 0; x < composed.width; x++) {
      const d = Math.abs(composed.data[x] - exported.data[x]);
      sum += d;
      if (d > 8) over8++;
    }

    expect(over8, `set-${n}: columns drifting more than 8 grey levels from the export`).toBe(0);
    expect(sum / composed.width, `set-${n}: mean column difference from the export`).toBeLessThan(1);
  });

  test(`set-${n}.webp is identical in both trees`, async () => {
    // `images/` feeds the legacy root site, `public/` feeds the Next export. They must not drift.
    const a = await sharp(composedPath('.', n)).raw().toBuffer();
    const b = await sharp(composedPath('public', n)).raw().toBuffer();
    expect(Buffer.compare(a, b), `set-${n} differs between images/ and public/`).toBe(0);
  });
}
