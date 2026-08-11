#!/usr/bin/env node
/**
 * Regenerate the served webp assets for "A History of Mistrust" from the Figma PNG exports.
 *
 * Sources live in `images/myart/A History of Mistrust/`; outputs are written to BOTH that tree
 * and the `public/` mirror, because `public/` is what the Next export serves and `images/` is
 * what the legacy root site links.
 *
 * **The two trees are not symmetric, on purpose.** `images/` holds sources AND outputs;
 * `public/` holds outputs ONLY. Everything under `public/` is copied verbatim into the export
 * and published, so a source PNG left there is 6 MB nobody ever requests — which is exactly what
 * happened until 2026-08-09 (Entry 129), when 30 slide PNGs, the 3 MB cover, an unused moodboard
 * and `slides.md` were removed from the mirror. This script already reads every source from
 * `ROOT/REL` (the `images/` tree) and never from `public/`, so that deletion cannot break
 * generation. **Do not add source files to `public/`, and do not "restore symmetry" between the
 * trees.**
 *
 * The three wide `sets/set-N.webp` strips take their PIXELS from the individual slide PNGs and
 * their GEOMETRY from the `sets/A History of Mistrust Set N.png` Figma exports. That split is
 * deliberate, and both halves of it were learned the hard way:
 *
 *   - Pixels from slides, because the exports have shipped wrong content before. On 2026-07-27
 *     Set 3 was found to contain Set 2's slides (11-20) instead of its own (21-30). Sourcing
 *     pixels per-slide makes that class of bug structurally impossible.
 *   - Geometry from the exports, because consecutive slides can SHARE artwork. Slides 1 and 2
 *     overlap by 19px: slide 1's trailing 19 columns and slide 2's leading 19 are 99.7% the same
 *     pixels (the residue is antialiasing on the orange arc). Laying slides out at cumulative
 *     native widths therefore DUPLICATED that band, which is what put the visible notch in the
 *     orange arc of `set-1.webp` between 2026-07-27 and 2026-08-01. The export knows the true
 *     offsets; deriving them by matching each slide into the strip recovers them exactly.
 *
 * The 2026-07-27 note that composition "removes the whole class of bad-export bug" was half
 * right: it removes wrong-content bugs and introduced a seam bug of its own.
 *
 * Offsets are derived, not trusted: each slide is template-matched into its strip and must land
 * at a near-zero distance, and the resulting layout must reproduce the export's width exactly.
 * Anything else throws rather than quietly shipping a bad mosaic.
 *
 * Usage: node scripts/generate-mistrust-assets.js [--all]
 * Plans: 2026-07-27-contact-unhide-mistrust-assets,
 *        2026-08-01-mistrust-set-seam-dedupe-shxdowloop
 *        (both archived 2026-08-09 — see docs/archives/plans.md)
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

function setExport(n) {
  return path.join(ROOT, REL, 'sets', `A History of Mistrust Set ${n}.png`);
}

/**
 * Collapse an image to one row of per-column average brightness.
 *
 * `resize(width, 1)` is exactly a column mean, which turns a 10800px strip into a 1D signal that
 * a slide-sized template can be slid along. It matches to 1px while staying cheap enough to run
 * for every slide on every build.
 */
async function columnProfile(file) {
  const meta = await sharp(file).metadata();
  const data = await sharp(file)
    .greyscale()
    .resize(meta.width, 1, { fit: 'fill' })
    .raw()
    .toBuffer();
  return { data, width: meta.width, height: meta.height };
}

/** Mean absolute difference of `tmpl` against `strip` at `off`, or Infinity if it overruns. */
function matchAt(strip, tmpl, off) {
  if (off < 0 || off + tmpl.length > strip.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < tmpl.length; i++) sum += Math.abs(strip[off + i] - tmpl[i]);
  return sum / tmpl.length;
}

// A correct match sits at ~0; the nearest wrong slide in the same set scores >12. Anything above
// this is a layout we do not understand, and guessing would ship a broken mosaic.
const MATCH_TOLERANCE = 2.0;
// Slides may overlap their predecessor, never by more than this. Bounds the search window.
const MAX_OVERLAP = 96;

/**
 * Recover each slide's true x offset inside set n's Figma export.
 *
 * Slides are placed left to right; each one is searched for in a window that starts up to
 * MAX_OVERLAP before where it would sit if it simply butted against its predecessor. The window
 * extends a little past that point too, so a gap is detected rather than silently mismatched.
 */
async function deriveOffsets(n, members, metas) {
  const exportPath = setExport(n);
  if (!fs.existsSync(exportPath)) {
    throw new Error(
      `Missing set export: ${path.relative(ROOT, exportPath)}\n` +
        'Set strips take their geometry from these files; see this script\'s header.'
    );
  }

  const strip = await columnProfile(exportPath);
  const offsets = [];
  let cursor = 0;

  for (let i = 0; i < members.length; i++) {
    const tmpl = await columnProfile(sourceSlide(members[i]));

    let best = { off: -1, d: Infinity };
    for (let off = Math.max(0, cursor - MAX_OVERLAP); off <= cursor + MAX_OVERLAP; off++) {
      const d = matchAt(strip.data, tmpl.data, off);
      if (d < best.d) best = { off, d };
    }

    if (best.d > MATCH_TOLERANCE) {
      throw new Error(
        `Set ${n}: slide ${members[i]} does not match its strip ` +
          `(best distance ${best.d.toFixed(2)} at x=${best.off}, tolerance ${MATCH_TOLERANCE}).\n` +
          `Either ${path.basename(exportPath)} holds the wrong slides, or the slide PNGs and the ` +
          'set export are from different Figma revisions. Re-export before regenerating.'
      );
    }

    offsets.push(best.off);
    cursor = best.off + metas[i].width;
  }

  const composedWidth = Math.max(...offsets.map((o, i) => o + metas[i].width));
  if (composedWidth !== strip.width) {
    throw new Error(
      `Set ${n}: derived layout is ${composedWidth}px but ${path.basename(exportPath)} is ` +
        `${strip.width}px. The offsets do not reproduce the export; refusing to ship the mosaic.`
    );
  }

  // The canvas takes the export's height, so a taller slide would be silently cropped.
  const tallest = Math.max(...metas.map((m) => m.height));
  if (tallest !== strip.height) {
    throw new Error(
      `Set ${n}: tallest slide is ${tallest}px but ${path.basename(exportPath)} is ` +
        `${strip.height}px tall. Composing would crop; refusing.`
    );
  }

  const overlap = members.reduce((sum, _, i) => sum + metas[i].width, 0) - composedWidth;
  return { offsets, width: composedWidth, height: strip.height, overlap };
}

/**
 * Compose set n from its 10 slide PNGs at the offsets its Figma export actually uses.
 *
 * Slides keep their NATIVE widths — slide 21 is 1056x1080, not square, so fixed 1080px slots
 * would leave a blank gutter beside it. Offsets come from `deriveOffsets`, which is what closes
 * the shared-bleed seams that cumulative-width packing used to duplicate.
 */
async function buildSet(n) {
  const members = setMembers(n);

  const metas = await Promise.all(
    members.map((slide) => sharp(sourceSlide(slide)).metadata())
  );

  const { offsets, width, height, overlap } = await deriveOffsets(n, members, metas);

  if (overlap > 0) {
    console.log(`set-${n}: deduped ${overlap}px of shared bleed across ${members.length} slides`);
  }

  const composite = members.map((slide, i) => ({
    input: sourceSlide(slide),
    left: offsets[i],
    top: 0,
  }));

  const buf = await sharp({
    create: {
      width,
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

  // A set is stale when any of its 10 slides changed OR when its Figma export changed — the
  // export supplies the layout, so a re-export moves the seams even when no slide moved. That is
  // exactly what happened on 2026-08-01.
  for (let n = 1; n <= SET_COUNT; n++) {
    const touched =
      !changed ||
      changed.has(setExport(n)) ||
      setMembers(n).some((s) => changed.has(sourceSlide(s)));
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
