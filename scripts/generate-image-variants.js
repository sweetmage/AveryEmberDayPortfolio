#!/usr/bin/env node
/**
 * Generate downscaled srcset variants for project + gallery thumbnails.
 * Writes `<basename>-<width>w.<ext>` next to each source file (same format).
 * Skips variants that already exist and are newer than the source. Never upscales.
 *
 * Usage: node scripts/generate-image-variants.js [--force]
 * Plan: 2026-07-13-srcset-variants (archived — docs/archives/plans.md)
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');

const MANIFEST = [
  { src: 'public/images/projects/brand-thumb.jpg', widths: [480, 960] },
  { src: 'public/images/projects/mistrust-thumb.jpg', widths: [480] },
  ...[
    'Self Portrait Series - In Danger - Final.webp',
  ].map((f) => ({
    src: `public/images/myart/Gallery/SelfPortraitSeries/${f}`,
    widths: [480, 900],
  })),
  ...[
    'beheadedFinal.webp',
    'chillFinal.webp',
    'EmergenceFinal.webp',
    'FacesFinal.webp',
    'grossFinal.webp',
    'lollypopFinal.webp',
    'overflowFinal.webp',
    'ShadowFinal.webp',
    'stairsFinal.webp',
    'txlakelandscapeFinal.webp',
  ].map((f) => ({
    src: `public/images/myart/Gallery/${f}`,
    widths: [480, 900],
  })),
];

const force = process.argv.includes('--force');

async function main() {
  let generated = 0;
  let skipped = 0;

  for (const { src, widths } of MANIFEST) {
    const srcPath = path.join(ROOT, src);
    if (!fs.existsSync(srcPath)) {
      console.error(`MISSING SOURCE: ${src}`);
      process.exitCode = 1;
      continue;
    }

    const { width: srcWidth } = await sharp(srcPath).metadata();
    const ext = path.extname(srcPath);
    const base = srcPath.slice(0, -ext.length);
    const srcMtime = fs.statSync(srcPath).mtimeMs;

    for (const w of widths) {
      if (w >= srcWidth) {
        console.warn(`SKIP (would upscale ${srcWidth}px -> ${w}px): ${src}`);
        continue;
      }
      const outPath = `${base}-${w}w${ext}`;
      if (
        !force &&
        fs.existsSync(outPath) &&
        fs.statSync(outPath).mtimeMs > srcMtime
      ) {
        skipped++;
        continue;
      }
      const pipeline = sharp(srcPath).resize({ width: w });
      if (ext === '.jpg' || ext === '.jpeg') {
        pipeline.jpeg({ quality: 80, mozjpeg: true });
      } else if (ext === '.webp') {
        pipeline.webp({ quality: 80 });
      }
      await pipeline.toFile(outPath);
      const kb = Math.round(fs.statSync(outPath).size / 1024);
      console.log(`${path.relative(ROOT, outPath)} (${kb} KB)`);
      generated++;
    }
  }

  console.log(`\nDone: ${generated} generated, ${skipped} up to date.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
