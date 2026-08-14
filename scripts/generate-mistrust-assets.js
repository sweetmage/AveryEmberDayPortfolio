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
 * their GEOMETRY from `frame-geometry.json`, the committed manifest of where each frame actually
 * sits on the Figma canvas. That split is deliberate, and both halves were learned the hard way:
 *
 *   - Pixels from slides, because the raster set exports have shipped wrong content before. On
 *     2026-07-27 Set 3 was found to contain Set 2's slides (11-20) instead of its own (21-30).
 *     Sourcing pixels per-slide makes that class of bug structurally impossible.
 *   - Geometry from the manifest, because consecutive slides can SHARE artwork. Slides 1 and 2
 *     overlap by 19px: slide 1's trailing 19 columns and slide 2's leading 19 are 99.7% the same
 *     pixels (the residue is antialiasing on the orange arc). Laying slides out at cumulative
 *     native widths therefore DUPLICATED that band, which is what put the visible notch in the
 *     orange arc of `set-1.webp` between 2026-07-27 and 2026-08-01.
 *
 * Until 2026-08-14 those offsets were recovered by template-matching each slide into the
 * `sets/A History of Mistrust Set N.png` raster exports. That worked, but it made every build
 * depend on a picture *of* the layout staying in sync with the artwork — and the user's Figma
 * export has never included the `sets/` folder (Entry 113), so any repaint of a slide broke the
 * match and blocked the build. The manifest reads the layout instead of recovering it, which also
 * means a pure artwork revision can no longer fail geometry at all.
 *
 * The tradeoff, stated plainly: the manifest CAN go stale if frames are moved or resized in Figma,
 * and no amount of pixel inspection detects a pure translation. A resize is caught — every slide
 * PNG is asserted against its manifest dimensions below — and so are gaps and non-monotonic
 * layouts. A frame nudged sideways is not. Re-read the coordinates whenever you re-export; see
 * AGENTS.md.
 *
 * Usage: node scripts/generate-mistrust-assets.js [--all]
 * Plans: 2026-07-27-contact-unhide-mistrust-assets,
 *        2026-08-01-mistrust-set-seam-dedupe-shxdowloop
 *        (both archived 2026-08-09 — see docs/archives/plans.md),
 *        2026-08-14-mistrust-reexport-frame-geometry
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

/**
 * Source paths with uncommitted content changes (modified or untracked), as absolute paths.
 *
 * Slide PNGs and the geometry manifest are both build inputs, so both count. Derived `.webp`
 * output is deliberately excluded — a rebuilt output is not a reason to rebuild it again.
 */
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
    const lower = p.toLowerCase();
    if (lower.endsWith('.png') || lower.endsWith('frame-geometry.json')) {
      changed.add(path.join(ROOT, p));
    }
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

const MANIFEST = path.join(ROOT, REL, 'frame-geometry.json');

let manifestCache = null;

/**
 * Load and validate the frame geometry manifest.
 *
 * Every field is checked on load rather than at point of use, because a half-valid manifest
 * produces a plausible-looking strip with a silent defect, which is the failure mode this whole
 * mechanism exists to prevent.
 */
function frameGeometry() {
  if (manifestCache) return manifestCache;

  if (!fs.existsSync(MANIFEST)) {
    throw new Error(
      `Missing geometry manifest: ${path.relative(ROOT, MANIFEST)}\n` +
        "Set strips take their layout from this file; see this script's header and AGENTS.md."
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  } catch (err) {
    throw new Error(`${path.relative(ROOT, MANIFEST)} is not valid JSON: ${err.message}`);
  }

  const frames = parsed.frames;
  if (!Array.isArray(frames) || frames.length !== SLIDE_COUNT) {
    throw new Error(
      `${path.relative(ROOT, MANIFEST)} must hold exactly ${SLIDE_COUNT} frames, ` +
        `found ${Array.isArray(frames) ? frames.length : typeof frames}.`
    );
  }

  const bySlide = new Map();
  for (const f of frames) {
    for (const key of ['slide', 'x', 'width', 'height']) {
      if (!Number.isInteger(f[key])) {
        throw new Error(
          `${path.relative(ROOT, MANIFEST)}: frame ${JSON.stringify(f.name ?? f.slide)} has a ` +
            `missing or non-integer "${key}".`
        );
      }
    }
    if (f.width <= 0 || f.height <= 0) {
      throw new Error(`${path.relative(ROOT, MANIFEST)}: slide ${f.slide} has a non-positive size.`);
    }
    if (bySlide.has(f.slide)) {
      throw new Error(`${path.relative(ROOT, MANIFEST)}: slide ${f.slide} appears twice.`);
    }
    bySlide.set(f.slide, f);
  }

  for (let n = 1; n <= SLIDE_COUNT; n++) {
    if (!bySlide.has(n)) {
      throw new Error(`${path.relative(ROOT, MANIFEST)}: no entry for slide ${n}.`);
    }
  }

  manifestCache = { ...parsed, bySlide };
  return manifestCache;
}

/**
 * Lay set n out from the manifest's canvas coordinates.
 *
 * Offsets are relative to the leftmost frame in the set, so the manifest can carry absolute Figma
 * canvas coordinates or set-relative ones interchangeably. Everything else here is a guard:
 *
 *   - Each slide PNG must match its manifest dimensions. This is what catches a frame resized in
 *     Figma without the manifest being re-read, and it is the reason a resize cannot ship.
 *   - Offsets must not run backwards, and must not leave a gap. A gap would paint background
 *     between two slides; a backwards offset means the manifest is not in slide order.
 *
 * What these guards cannot catch is a frame translated in Figma without being resized. Nothing in
 * the pixels reveals it. Re-read the coordinates whenever you re-export.
 */
function layoutSet(n, members, metas) {
  const { bySlide } = frameGeometry();
  const entries = members.map((slide) => bySlide.get(slide));

  members.forEach((slide, i) => {
    const { width, height } = metas[i];
    const f = entries[i];
    if (width !== f.width || height !== f.height) {
      throw new Error(
        `Set ${n}: slide ${slide} is ${width}x${height} but the manifest says ` +
          `${f.width}x${f.height}.\nThe frame was resized in Figma, or the manifest is stale. ` +
          `Re-read the coordinates into ${path.relative(ROOT, MANIFEST)} before regenerating.`
      );
    }
  });

  const originX = Math.min(...entries.map((f) => f.x));
  const offsets = entries.map((f) => f.x - originX);

  for (let i = 1; i < offsets.length; i++) {
    const prevEnd = offsets[i - 1] + metas[i - 1].width;
    if (offsets[i] < offsets[i - 1]) {
      throw new Error(
        `Set ${n}: slide ${members[i]} starts at ${offsets[i]}px, left of slide ` +
          `${members[i - 1]} at ${offsets[i - 1]}px. The manifest is not in slide order.`
      );
    }
    if (offsets[i] > prevEnd) {
      throw new Error(
        `Set ${n}: ${offsets[i] - prevEnd}px gap between slides ${members[i - 1]} and ` +
          `${members[i]}. Composing would paint background through the seam; refusing.`
      );
    }
  }

  const width = Math.max(...offsets.map((o, i) => o + metas[i].width));
  const height = Math.max(...metas.map((m) => m.height));
  const overlap = metas.reduce((sum, m) => sum + m.width, 0) - width;

  return { offsets, width, height, overlap };
}

/**
 * Compose set n from its 10 slide PNGs at the offsets the frames actually sit at in Figma.
 *
 * Slides keep their NATIVE widths — slide 21 is 1056x1080, not square, so fixed 1080px slots
 * would leave a blank gutter beside it. Offsets come from `layoutSet`, which is what closes
 * the shared-bleed seams that cumulative-width packing used to duplicate.
 */
async function buildSet(n) {
  const members = setMembers(n);

  const metas = await Promise.all(
    members.map((slide) => sharp(sourceSlide(slide)).metadata())
  );

  const { offsets, width, height, overlap } = layoutSet(n, members, metas);

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
  // Validate the manifest before anything else, not lazily inside buildSet. A missing or broken
  // manifest with no stale sets would otherwise skip every set and exit 0, reporting success for
  // a build whose layout source had been deleted.
  frameGeometry();

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

  // A set is stale when any of its 10 slides changed OR when the geometry manifest changed — the
  // manifest supplies the layout, so an edit there moves the seams even when no slide moved. That
  // is exactly what a re-export used to do on 2026-08-01.
  const manifestChanged = changed ? changed.has(MANIFEST) : true;
  for (let n = 1; n <= SET_COUNT; n++) {
    const touched =
      !changed ||
      manifestChanged ||
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
