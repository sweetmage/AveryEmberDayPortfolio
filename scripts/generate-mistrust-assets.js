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
 * their GEOMETRY from `frame-geometry.json`, the absolute Figma canvas x/width/height of all 30
 * frames, read from the Design panel on 2026-08-25:
 *
 *   - Pixels from slides, because the raster set exports have shipped wrong content before. On
 *     2026-07-27 Set 3 was found to contain Set 2's slides (11-20) instead of its own (21-30).
 *   - Geometry from the manifest, not from template-matching slides into the raster
 *     `sets/A History of Mistrust Set N.png` exports (2026-08-01 to 2026-11-17). Matching cannot
 *     see through flat margins: it placed slide 2 19px inside slide 1 and slide 22 abutting 21,
 *     where the frames really sit at 1080 and 10px inside. That only looked right while the old
 *     slide 1/2 art happened to repeat a 19px band of the orange arc; the 2026-08-25 repaint
 *     (Comet's Figma export) does not, so the matched layout would have notched the arc.
 *     The `Set N.png` files are no longer read.
 *
 * The manifest CAN go stale if a frame is moved or resized in Figma. A resize is caught (each PNG
 * must match its manifest size); a pure sideways move is not. Re-read the coordinates whenever you
 * re-export. Plan: docs/plans/2026-08-14-mistrust-reexport-frame-geometry.md.
 *
 * **The 30-slide mosaic on the project page needs seamless tiles of its own.** It lays the slides
 * out as equal squares with no gutter, so the individual slide files reproduce exactly the seams
 * this script removes from the strips: 22 repeats 21's last 10 columns, 24|25 repeats one column
 * (before the 2026-08-25 repaint, the old slide 1/2 art also repeated a 19px band of the orange
 * ring, the break the user caught on 2026-10-05), and slide 21
 * (1056x1080) is scaled 2.3% larger than its neighbour by `object-fit: cover`. So each set's strip
 * is also cut into one region per slide, splitting any shared band down the middle, and every
 * slide whose region is not simply "its own square, untouched" gets a `slides/tile-NN.webp` cut
 * from the strip and fitted to 720x720, plus a 1080x1080 `tile-NN@2x.webp`. The regions and which slides got a tile are written to
 * `app/portfolio/mistrust-tiles.json`, which the mosaic and `tests/mistrust-sets.spec.js` read.
 * The slideshow stage and the lightbox use the tiles too: both are edge-to-edge sliding tracks, so
 * two neighbours share the screen mid-swipe (the user caught the stage still showing the seam on
 * 2026-10-05, after the mosaic alone had been fixed). Only the filmstrip keeps the untouched slides,
 * because its thumbnails sit 8px apart and never touch.
 *
 * The manifest is validated on load, every slide must match its frame size, and offsets may not
 * run backwards or leave a gap. Anything else throws rather than quietly shipping a bad mosaic.
 *
 * Usage: node scripts/generate-mistrust-assets.js [--all | --sets]
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
const TILE_SIZE = 720;
// The seamless tiles come in the same two sizes as the slides they replace: 720 for the stage and
// the mosaic (like `slide-NN.webp`), 1080 for the lightbox (like `slide-NN@2x.webp`).
const TILE_VARIANTS = [
  { size: TILE_SIZE, suffix: '' },
  { size: 1080, suffix: '@2x' },
];
const TILE_MANIFEST = path.join(ROOT, 'app', 'portfolio', 'mistrust-tiles.json');

// --all rebuilds every output. The default rebuilds only the sources whose *content* changed
// per git, which matters because a Figma re-export rewrites the mtime of all 30 PNGs even when
// only a handful differ — mtime would rebuild everything and bury the real diff under encoder
// noise from a different libwebp build.
const all = process.argv.includes('--all');
// --sets rebuilds the three strips and their mosaic tiles without touching the 60 slide webps.
const setsOnly = process.argv.includes('--sets');

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
    const lower = p.toLowerCase();
    if (lower.endsWith('.png') || lower.endsWith('frame-geometry.json')) changed.add(path.join(ROOT, p));
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
 * Where each slide's mosaic tile starts and ends inside set n's strip.
 *
 * Where two slides overlap, the cut falls in the middle of the shared band, so neither tile
 * carries the whole band and the pair joins exactly as the strip does. A slide needs its own
 * tile when its region is anything other than its native, square self.
 */
function tileRegions(members, metas, offsets, width) {
  const cuts = [0];
  for (let i = 0; i < members.length - 1; i++) {
    const shared = offsets[i] + metas[i].width - offsets[i + 1];
    cuts.push(offsets[i + 1] + Math.floor(shared / 2));
  }
  cuts.push(width);
  return members.map((slide, i) => {
    const start = cuts[i];
    const end = cuts[i + 1];
    const untouched =
      start === offsets[i] && end === offsets[i] + metas[i].width && metas[i].width === metas[i].height;
    return { slide, start, end, seamless: !untouched };
  });
}

/**
 * Compose set n from its 10 slide PNGs at the offsets the frames actually sit at in Figma.
 *
 * Slides keep their NATIVE widths — slide 21 is 1056x1080, not square, so fixed 1080px slots
 * would leave a blank gutter beside it. Offsets come from `layoutSet`, which reads
 * `frame-geometry.json`: the real frame overlaps (22 inside 21 by 10px, 25 inside 24 by 1px).
 */
async function buildSet(n) {
  const members = setMembers(n);

  const metas = await Promise.all(
    members.map((slide) => sharp(sourceSlide(slide)).metadata())
  );

  const { offsets, width, height, overlap } = layoutSet(n, members, metas);

  if (overlap > 0) {
    console.log(`set-${n}: ${overlap}px of frame overlap absorbed across ${members.length} slides`);
  }

  const composite = members.map((slide, i) => ({
    input: sourceSlide(slide),
    left: offsets[i],
    top: 0,
  }));

  // Lossless first: the set strip and the mosaic tiles are both cut from this one image.
  const strip = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite(composite)
    .png()
    .toBuffer();
  const buf = await sharp(strip).webp({ quality: QUALITY }).toBuffer();

  const regions = tileRegions(members, metas, offsets, width);
  for (const r of regions.filter((region) => region.seamless)) {
    for (const { size, suffix } of TILE_VARIANTS) {
      const tile = await sharp(strip)
        .extract({ left: r.start, top: 0, width: r.end - r.start, height })
        .resize(size, size, { fit: 'fill' })
        .webp({ quality: QUALITY })
        .toBuffer();
      for (const tree of TREES) {
        const dest = path.join(tree, 'slides', `tile-${String(r.slide).padStart(2, '0')}${suffix}.webp`);
        fs.writeFileSync(dest, tile);
        console.log(`${path.relative(ROOT, dest).replace(/\\/g, '/')} (${Math.round(tile.length / 1024)} KB)`);
      }
    }
  }

  for (const tree of TREES) {
    const dest = path.join(tree, 'sets', `set-${n}.webp`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    const kb = Math.round(buf.length / 1024);
    console.log(`${path.relative(ROOT, dest).replace(/\\/g, '/')} (${kb} KB)`);
  }
  return TREES.length;
}

/** Record every slide's mosaic region, for the mosaic and its test. Cheap: geometry only. */
async function writeTileManifest() {
  const sets = [];
  for (let n = 1; n <= SET_COUNT; n++) {
    const members = setMembers(n);
    const metas = await Promise.all(members.map((slide) => sharp(sourceSlide(slide)).metadata()));
    const { offsets, width } = layoutSet(n, members, metas);
    sets.push({ set: n, width, tiles: tileRegions(members, metas, offsets, width) });
  }
  const json = `${JSON.stringify({ tileSize: TILE_SIZE, sets }, null, 2)}\n`;
  fs.writeFileSync(TILE_MANIFEST, json);
  console.log(path.relative(ROOT, TILE_MANIFEST).replace(/\\/g, '/'));
}

async function main() {
  const queue = jobs();

  const missing = [...new Set(queue.map((j) => j.src))].filter((s) => !fs.existsSync(s));
  if (missing.length) {
    for (const m of missing) console.error(`MISSING SOURCE: ${path.relative(ROOT, m)}`);
    process.exit(1);
  }

  frameGeometry(); // validate the manifest before writing anything
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

  // A set is stale when any of its 10 slides changed OR when the geometry manifest changed: the
  // manifest supplies the layout, so a re-read moves the seams even when no slide moved.
  for (let n = 1; n <= SET_COUNT; n++) {
    const touched =
      !changed ||
      setsOnly ||
      changed.has(MANIFEST) ||
      setMembers(n).some((s) => changed.has(sourceSlide(s)));
    if (!touched && fs.existsSync(path.join(TREES[0], 'sets', `set-${n}.webp`))) {
      skipped += TREES.length;
      continue;
    }
    generated += await buildSet(n);
  }

  await writeTileManifest();

  console.log(`\nDone: ${generated} generated, ${skipped} up to date.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
