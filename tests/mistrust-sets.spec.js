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

/**
 * The 30-slide mosaic on the project page: every square must match its region of the Figma set
 * export at its edges, which is where a seam shows.
 *
 * The mosaic lays slides out as equal squares with no gutter, so the plain slide files drew the
 * 19px band slides 1 and 2 share twice (the break in the orange ring the user caught on
 * 2026-10-05, after Entry 114 had fixed the same seam in the strips only), and `object-fit: cover`
 * scaled the non-square slide 21 2.3% larger than slide 22. The generator now cuts seamless tiles
 * for those slides from the strip and records every slide's region in
 * `app/projects/mistrust-tiles.json`.
 *
 * Measured 2026-10-05, mean grey-level difference over the 12 outer columns each side: every
 * square is ≤0.61 against the export; the old mosaic was 4.07 (slide 1), 2.36 (slide 2) and 1.44
 * (slide 21). The bound sits between the two.
 */
const manifest = JSON.parse(
  require('node:fs').readFileSync(path.join(ROOT, 'app', 'projects', 'mistrust-tiles.json'), 'utf8')
);
const EDGE_COLUMNS = 12;
const EDGE_BOUND = 1;

async function squareGrey(input, size) {
  return sharp(input).greyscale().resize(size, size, { fit: 'fill' }).raw().toBuffer();
}

function edgeDifference(a, b, size) {
  let sum = 0;
  let count = 0;
  for (let y = 0; y < size; y++) {
    for (let i = 0; i < EDGE_COLUMNS; i++) {
      for (const x of [i, size - 1 - i]) {
        sum += Math.abs(a[y * size + x] - b[y * size + x]);
        count++;
      }
    }
  }
  return sum / count;
}

for (const set of manifest.sets) {
  test(`set ${set.set} mosaic squares join exactly as the Figma export does`, async () => {
    const size = manifest.tileSize;
    const exported = exportPath(set.set);
    const height = (await sharp(exported).metadata()).height;

    // The regions must tile the export end to end with no gap and no overlap.
    expect(set.tiles[0].start).toBe(0);
    expect(set.tiles.at(-1).end).toBe(set.width);
    for (let i = 1; i < set.tiles.length; i++) expect(set.tiles[i].start).toBe(set.tiles[i - 1].end);

    for (const t of set.tiles) {
      const nn = String(t.slide).padStart(2, '0');
      const file = `${t.seamless ? 'tile' : 'slide'}-${nn}.webp`;
      const want = await squareGrey(
        await sharp(exported).extract({ left: t.start, top: 0, width: t.end - t.start, height }).toBuffer(),
        size
      );
      for (const tree of ['.', 'public']) {
        const filePath = path.join(ROOT, tree, REL, 'slides', file);
        // The mosaic draws a plain slide with `object-fit: cover`, which only leaves it
        // undistorted when it is square. A non-square slide must have a seamless tile instead.
        const { width, height: h } = await sharp(filePath).metadata();
        expect(width, `slide ${t.slide} (${tree}/…/${file}) must be square to sit in the mosaic`).toBe(h);
        const got = await squareGrey(filePath, size);
        expect(edgeDifference(got, want, size), `slide ${t.slide} (${tree}/…/${file}) edges vs export`)
          .toBeLessThan(EDGE_BOUND);
      }
    }
  });
}
