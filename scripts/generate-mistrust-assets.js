#!/usr/bin/env node
/**
 * Regenerate the served webp assets for "A History of Mistrust" from the Figma PNG exports.
 *
 * Sources live in `images/myart/A History of Mistrust/`; outputs are written to BOTH that tree
 * and the `public/` mirror, because `public/` is what the Next export serves and `images/` is
 * what the legacy root site links.
 *
 * The three wide `sets/set-N.webp` strips are composed here from the individual slide PNGs
 * rather than from the `sets/A History of Mistrust Set N.png` Figma exports. Those exports were
 * verified defective on 2026-07-27: Set 1 clipped 50px off the right edge of its first slide
 * (10750px wide instead of 10800), and Set 3 contained Set 2's slides (11-20) instead of its own
 * (21-30). Composing from the per-slide files is deterministic, always current, and removes the
 * whole class of bad-export bug. The set PNGs are kept as source-of-record but are not consumed.
 *
 * Usage: node scripts/generate-mistrust-assets.js [--all]
 * Plan: docs/plans/2026-07-27-contact-unhide-mistrust-assets.md
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const REL = 'images/myart/A History of Mistrust';
const TREES = [path.join(ROOT, REL), path.join(ROOT, 'public', REL)];

const QUALITY = 80;
const SLIDE_COUNT = 30;
const SET_COUNT = 3;

// --all rebuilds every output. The default rebuilds only the sources whose *content* changed
// per git, which matters because a Figma re-export rewrites the mtime of all 30 PNGs even when
// only a handful differ — mtime would rebuild everything and bury the real diff under encoder
// noise from a different libwebp build.
const all = process.argv.includes('--all');

/** Source paths with uncommitted content changes (modified or untracked), as absolute paths. */
function changedSources() {
  const out = execFileSync('git', ['status', '--porcelain', '--', REL], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  const changed = new Set();
  for (const line of out.split('\n')) {
    if (!line.trim()) continue;
    // Porcelain v1: XY then a space then the path, quoted when it contains spaces.
    let p = line.slice(3).trim();
    if (p.startsWith('"') && p.endsWith('"')) p = JSON.parse(p);
    if (p.toLowerCase().endsWith('.png')) changed.add(path.join(ROOT, p));
  }
  return changed;
}

function sourceSlide(n) {
  return path.join(ROOT, REL, `Instagram post - ${n}.png`);
}

/** The 10 slide numbers that make up set n. */
function setMembers(n) {
  return Array.from({ length: 10 }, (_, i) => (n - 1) * 10 + i + 1);
}

/** Build the per-slide job list: one entry per output file, across both trees. */
function jobs() {
  const out = [];

  for (let n = 1; n <= SLIDE_COUNT; n++) {
    const src = sourceSlide(n);
    const nn = String(n).padStart(2, '0');
    for (const tree of TREES) {
      out.push({ src, dest: path.join(tree, 'slides', `slide-${nn}.webp`), width: 720 });
      out.push({ src, dest: path.join(tree, 'slides', `slide-${nn}@2x.webp`), width: null });
    }
  }

  return out;
}

/**
 * Compose set n as a horizontal strip of its 10 slides laid out at their NATIVE widths.
 *
 * Not every slide is square — slide 21 is 1056x1080, and has been since before this run. Packing
 * into fixed 1080px slots would leave a visible blank gutter beside it, so tiles butt against
 * each other at whatever width they are. This reproduces the layout of the previously committed
 * strips (set-3 was 10776px = 1056 + 9x1080), which is why they read as seamless.
 */
async function buildSet(n) {
  const members = setMembers(n);

  const metas = await Promise.all(
    members.map((slide) => sharp(sourceSlide(slide)).metadata())
  );

  let x = 0;
  const composite = members.map((slide, i) => {
    const left = x;
    x += metas[i].width;
    return { input: sourceSlide(slide), left, top: 0 };
  });

  const height = Math.max(...metas.map((m) => m.height));

  const buf = await sharp({
    create: {
      width: x,
      height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite(composite)
    .webp({ quality: QUALITY })
    .toBuffer();

  for (const tree of TREES) {
    const dest = path.join(tree, 'sets', `set-${n}.webp`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    const kb = Math.round(buf.length / 1024);
    console.log(`${path.relative(ROOT, dest).replace(/\\/g, '/')} (${kb} KB)`);
  }
  return TREES.length;
}

async function main() {
  const queue = jobs();

  const missing = [...new Set(queue.map((j) => j.src))].filter((s) => !fs.existsSync(s));
  if (missing.length) {
    for (const m of missing) console.error(`MISSING SOURCE: ${path.relative(ROOT, m)}`);
    process.exit(1);
  }

  const changed = all ? null : changedSources();
  if (changed) {
    console.log(`Changed sources per git: ${changed.size}`);
  }

  let generated = 0;
  let skipped = 0;

  for (const { src, dest, width } of queue) {
    if (changed && !changed.has(src) && fs.existsSync(dest)) {
      skipped++;
      continue;
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true });

    const pipeline = sharp(src);
    if (width) {
      const meta = await sharp(src).metadata();
      if (width >= meta.width) {
        console.warn(
          `SKIP (would upscale ${meta.width}px -> ${width}px): ${path.relative(ROOT, dest)}`
        );
        continue;
      }
      pipeline.resize({ width });
    }
    await pipeline.webp({ quality: QUALITY }).toFile(dest);

    const kb = Math.round(fs.statSync(dest).size / 1024);
    console.log(`${path.relative(ROOT, dest).replace(/\\/g, '/')} (${kb} KB)`);
    generated++;
  }

  // Sets are always rebuilt: they are derived from 10 slides each, so "did any member change"
  // is the real staleness question and recomposing is cheap.
  for (let n = 1; n <= SET_COUNT; n++) {
    const touched = setMembers(n).some((s) => !changed || changed.has(sourceSlide(s)));
    if (!touched && fs.existsSync(path.join(TREES[0], 'sets', `set-${n}.webp`))) {
      skipped += TREES.length;
      continue;
    }
    generated += await buildSet(n);
  }

  console.log(`\nDone: ${generated} generated, ${skipped} up to date.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
