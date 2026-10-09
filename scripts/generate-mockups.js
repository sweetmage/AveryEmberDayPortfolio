#!/usr/bin/env node
/**
 * Generate print mockups (canvas / framed / poster on a wall, skateboard deck on
 * concrete) from the gallery artwork. No stock photos: every scene is drawn in code.
 *
 * Reads images/mockups/mockups.json, writes
 * `<output.dir>/<slug>-<kind>.webp` at the canvas size the manifest gives for the kind.
 *
 * Rules the drawing keeps:
 *  - The artwork is the artwork's own pixels, resized with its aspect preserved
 *    (asserted within 1%). Nothing is drawn over it: frame, mat, tape, shadows and
 *    canvas edge all sit OUTSIDE the art rectangle.
 *  - The skateboard is the one exception, on purpose: the art is cover-cropped into
 *    the deck outline and the deck's concave shading is multiplied/screened over it,
 *    because a flat print on a bent deck would read as a sticker.
 *  - Output is deterministic: seeded noise, no clocks, fixed WebP settings, so a
 *    re-run produces identical bytes.
 *
 * Optional per-scene override (no current scene uses it): give a scene
 * `"background": "<path to photo>"` and `"placement": {"x","y","w","h"}` (output px).
 * The photo is cover-resized to the canvas instead of drawing the wall/floor, and the
 * art object (art plus frame/mat/paper, or the deck) is fitted and centred inside
 * `placement`. Wall lighting is not re-applied; the photo is assumed to carry its own.
 *
 * Usage: node scripts/generate-mockups.js [--only <slug>]
 * Plan: docs/plans/2026-10-09-print-mockups-shxdowloop.md
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'images/mockups/mockups.json');

const WEBP = { quality: 82, effort: 6 };
const MAX_KB = 180;

const FLOOR_FRAC = 0.14; // wall scenes: floor strip height
const CENTER_Y_FRAC = 0.42; // wall scenes: art object vertical centre
const PORTRAIT_LONG_FRAC = 0.62; // of canvas height
const LANDSCAPE_WIDTH_FRAC = 0.46; // of canvas width
const DECK_LENGTH_FRAC = 0.84;
const DECK_WIDTH_RATIO = 0.26;

const FRAME_COLOR = '#1a1a1a';
const MAT_COLOR = '#f7f6f2';
const PAPER_COLOR = '#f4f3ee';

// ---------------------------------------------------------------- utilities

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smooth = (t) => t * t * (3 - 2 * t);

/** Bilinear value noise in [-1, 1], one lattice cell = cellX x cellY pixels. */
function valueNoise(w, h, cellX, cellY, rng) {
  const gw = Math.ceil(w / cellX) + 2;
  const gh = Math.ceil(h / cellY) + 2;
  const grid = new Float32Array(gw * gh);
  for (let i = 0; i < grid.length; i++) grid[i] = rng() * 2 - 1;
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const gy = y / cellY;
    const y0 = Math.floor(gy);
    const fy = smooth(gy - y0);
    for (let x = 0; x < w; x++) {
      const gx = x / cellX;
      const x0 = Math.floor(gx);
      const fx = smooth(gx - x0);
      const i = y0 * gw + x0;
      const top = grid[i] + (grid[i + 1] - grid[i]) * fx;
      const bot = grid[i + gw] + (grid[i + gw + 1] - grid[i + gw]) * fx;
      out[y * w + x] = top + (bot - top) * fy;
    }
  }
  return out;
}

function svgBuf(w, h, inner) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`
  );
}

/** Blurred, offset silhouettes. Each shape is SVG markup filled with `color`. */
function shadowLayer(w, h, shadows) {
  const defs = shadows
    .map(
      (s, i) =>
        `<filter id="b${i}" filterUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">` +
        `<feGaussianBlur stdDeviation="${s.sigma}"/></filter>`
    )
    .join('');
  const body = shadows
    .map(
      (s, i) =>
        `<g filter="url(#b${i})" opacity="${s.opacity}" fill="${s.color || '#1c140e'}" transform="translate(${s.dx} ${s.dy})">${s.shape}</g>`
    )
    .join('');
  return svgBuf(w, h, `<defs>${defs}</defs>${body}`);
}

// ------------------------------------------------------------ scene drawing

/**
 * Wall + floor as a raw RGB buffer: plaster noise, side light falloff, vignette,
 * baseboard and a contact shadow where the floor meets the wall.
 */
function drawWall(name, scene, W, H) {
  const rng = mulberry32(hashSeed(`wall:${name}`));
  const fine = new Float32Array(W * H);
  for (let i = 0; i < fine.length; i++) fine[i] = rng() * 2 - 1;
  const mott = valueNoise(W, H, 46, 46, rng);
  const mottLo = valueNoise(W, H, 220, 220, rng);
  const streak = valueNoise(W, H, 260, 5, rng);

  const wall = hexToRgb(scene.wall);
  const floor = hexToRgb(scene.floor);
  const floorTop = Math.round(H * (1 - FLOOR_FRAC));
  const boardH = Math.round(H * 0.032);
  const boardTop = floorTop - boardH;
  const leftLit = scene.light !== 'right';

  const buf = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y++) {
    const dy = (y - H / 2) / (H / 2);
    for (let x = 0; x < W; x++) {
      const t = x / (W - 1);
      const side = leftLit ? 1 - 2 * t : 2 * t - 1;
      const dx = (x - W / 2) / (W / 2);
      const r2 = (dx * dx + dy * dy) / 2;
      const light = (1 + 0.075 * side + 0.035 * (0.5 - y / H)) * (1 - 0.17 * Math.pow(r2, 1.15));
      const i = y * W + x;

      let base;
      let k = 1;
      let noise;
      if (y >= floorTop) {
        base = floor;
        k = 1 - 0.34 * Math.exp(-(y - floorTop) / 20); // wall/floor contact shadow
        noise = fine[i] * 1.1 + streak[i] * 2.4 + mottLo[i] * 1.5;
      } else {
        base = wall;
        noise = fine[i] * 1.4 + mott[i] * 1.5 + mottLo[i] * 1.8;
        if (y >= boardTop) {
          const u = (y - boardTop) / boardH;
          k = 1.04 - 0.05 * u;
          if (y === floorTop - 1) k = 0.8; // board resting on the floor
          if (y === boardTop) k = 1.08; // top edge catches the light
        } else {
          k = 1 - 0.07 * smooth(clamp((y - (boardTop - 130)) / 130, 0, 1)); // ambient occlusion
          if (y === boardTop - 1) k = 0.86; // thin shadow above the board
        }
      }
      const o = i * 3;
      for (let c = 0; c < 3; c++) {
        buf[o + c] = clamp(Math.round(base[c] * light * k + noise), 0, 255);
      }
    }
  }
  return { input: buf, floorTop };
}

/** Concrete: noise, soft mottling, sparse pores, gentle light and vignette. */
function drawConcrete(scene, W, H) {
  const rng = mulberry32(hashSeed('concrete'));
  const fine = new Float32Array(W * H);
  for (let i = 0; i < fine.length; i++) fine[i] = rng() * 2 - 1;
  const m1 = valueNoise(W, H, 90, 90, rng);
  const m2 = valueNoise(W, H, 28, 28, rng);
  const m3 = valueNoise(W, H, 400, 400, rng);
  const base = hexToRgb(scene.floor);

  const buf = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y++) {
    const dy = (y - H / 2) / (H / 2);
    for (let x = 0; x < W; x++) {
      const dx = (x - W / 2) / (W / 2);
      const r2 = (dx * dx + dy * dy) / 2;
      const light = (1 + 0.07 * (0.5 - x / W) + 0.04 * (0.5 - y / H)) * (1 - 0.2 * Math.pow(r2, 1.1));
      const i = y * W + x;
      let n = fine[i] * 2.2 + m2[i] * 4 + m1[i] * 5.5 + m3[i] * 7;
      if (rng() < 0.0016) n -= 9 + rng() * 10; // pores
      const o = i * 3;
      // slight warm/cool drift so the grey is not dead flat
      buf[o] = clamp(Math.round(base[0] * light + n + m3[i] * 1.2), 0, 255);
      buf[o + 1] = clamp(Math.round(base[1] * light + n), 0, 255);
      buf[o + 2] = clamp(Math.round(base[2] * light + n - m3[i] * 1.2), 0, 255);
    }
  }
  return buf;
}

// ----------------------------------------------------------------- layouts

// Space the object takes around the art, as pad = k * longSide + c (per side).
const PAD = {
  canvas: { k: 0, c: 3 },
  framed: { k: 0.07 + 0.016, c: 0 },
  poster: { k: 0.02, c: 1 },
};

/** Largest art long side so that art + padding fits inside a box. */
function fitLong(kind, aw, ah, boxW, boxH) {
  const { k, c } = PAD[kind];
  const long = Math.max(aw, ah);
  const byW = (boxW - 2 * c) / (aw / long + 2 * k);
  const byH = (boxH - 2 * c) / (ah / long + 2 * k);
  return Math.min(byW, byH);
}

function wallBox(W, H, floorTop) {
  const cy = H * CENTER_Y_FRAC;
  const half = Math.min(cy - H * 0.06, floorTop - H * 0.05 - cy);
  return { cx: W / 2, cy, w: W * 0.88, h: half * 2 };
}

function artRect(kind, aw, ah, targetLong, box) {
  const long = Math.min(targetLong, fitLong(kind, aw, ah, box.w, box.h));
  const scale = long / Math.max(aw, ah);
  const w = Math.round(aw * scale);
  const h = Math.round(ah * scale);
  const err = Math.abs(w / h / (aw / ah) - 1);
  if (err > 0.01) throw new Error(`aspect drift ${(err * 100).toFixed(2)}% (${w}x${h} vs ${aw}x${ah})`);
  return { x: Math.round(box.cx - w / 2), y: Math.round(box.cy - h / 2), w, h, long: Math.max(w, h) };
}

// ------------------------------------------------------------ art objects

/** Shadow offsets point away from the light. */
function shadowDir(light) {
  return light === 'right' ? -1 : 1;
}

function canvasObject(a, W, H, light, bandRgb) {
  const dir = shadowDir(light);
  const band = 3;
  const bx = a.x - band;
  const by = a.y - band;
  const bw = a.w + band * 2;
  const bh = a.h + band * 2;
  const rect = `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}"/>`;
  const under = shadowLayer(W, H, [
    { shape: rect, dx: 16 * dir, dy: 22, sigma: 15, opacity: 0.3 },
    { shape: rect, dx: 3 * dir, dy: 4, sigma: 3, opacity: 0.38 },
  ]).toString();
  const [r, g, b] = bandRgb.map((v) => Math.round(v * 0.55));
  // Depth of the wrapped edge: darker where it turns away from the light.
  const lit = dir > 0 ? 'left' : 'right';
  const body =
    `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="rgb(${r},${g},${b})"/>` +
    (lit === 'left'
      ? `<rect x="${bx}" y="${by}" width="1.5" height="${bh}" fill="#fff" opacity="0.12"/>`
      : `<rect x="${bx + bw - 1.5}" y="${by}" width="1.5" height="${bh}" fill="#fff" opacity="0.12"/>`) +
    `<rect x="${bx}" y="${by}" width="${bw}" height="1" fill="#fff" opacity="0.14"/>`;
  return { under: stripSvg(under) + body, over: '' };
}

function framedObject(a, W, H, light) {
  const dir = shadowDir(light);
  const f = Math.max(4, Math.round(a.long * 0.016));
  const m = Math.round(a.long * 0.07);
  const ox = a.x - m - f;
  const oy = a.y - m - f;
  const ow = a.w + 2 * (m + f);
  const oh = a.h + 2 * (m + f);
  const rect = `<rect x="${ox}" y="${oy}" width="${ow}" height="${oh}"/>`;
  const under = shadowLayer(W, H, [
    { shape: rect, dx: 16 * dir, dy: 22, sigma: 15, opacity: 0.3 },
    { shape: rect, dx: 3 * dir, dy: 4, sigma: 3, opacity: 0.38 },
  ]).toString();
  const ix = ox + f;
  const iy = oy + f;
  const iw = ow - 2 * f;
  const ih = oh - 2 * f;
  const ch = Math.max(2, Math.round(f * 0.3)); // chamfer on the frame's inner lip
  const body =
    `<rect x="${ox}" y="${oy}" width="${ow}" height="${oh}" fill="${FRAME_COLOR}"/>` +
    // outer edge catches light on the lit side and top
    `<path d="M${ox + 0.5} ${oy + oh} V${oy + 0.5} H${ox + ow}" fill="none" stroke="#fff" stroke-opacity="0.2" stroke-width="1"/>` +
    // chamfer: top/left lip lit, bottom/right in shade
    `<path d="M${ix} ${iy + ih} V${iy} H${ix + iw} l${-ch} ${ch} H${ix + ch} V${iy + ih - ch} Z" fill="#fff" fill-opacity="0.14"/>` +
    `<path d="M${ix + iw} ${iy} V${iy + ih} H${ix} l${ch} ${-ch} H${ix + iw - ch} V${iy + ch} Z" fill="#000" fill-opacity="0.45"/>` +
    `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${MAT_COLOR}"/>` +
    // the frame's lip shades the mat just inside it
    `<rect x="${ix}" y="${iy}" width="${iw}" height="3" fill="#000" opacity="0.07"/>` +
    `<rect x="${ix}" y="${iy}" width="3" height="${ih}" fill="#000" opacity="0.05"/>` +
    // bevel of the mat opening, drawn outside the art rectangle
    `<path d="M${a.x - 1} ${a.y + a.h} V${a.y - 1} H${a.x + a.w}" fill="none" stroke="#cfcbc1" stroke-width="2"/>` +
    `<path d="M${a.x + a.w + 1} ${a.y - 1} V${a.y + a.h + 1} H${a.x - 1}" fill="none" stroke="#fffffd" stroke-width="2"/>`;
  return { under: stripSvg(under) + body, over: '' };
}

function posterObject(a, W, H, light) {
  const dir = shadowDir(light);
  const m = Math.max(10, Math.round(a.long * 0.02));
  const px = a.x - m;
  const py = a.y - m;
  const pw = a.w + 2 * m;
  const ph = a.h + 2 * m;
  const rect = `<rect x="${px}" y="${py}" width="${pw}" height="${ph}"/>`;
  const under = shadowLayer(W, H, [
    { shape: rect, dx: 9 * dir, dy: 13, sigma: 10, opacity: 0.28 },
    { shape: rect, dx: 2 * dir, dy: 3, sigma: 2.2, opacity: 0.34 },
  ]).toString();
  const body =
    `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${PAPER_COLOR}"/>` +
    `<rect x="${px + 0.5}" y="${py + 0.5}" width="${pw - 1}" height="${ph - 1}" fill="none" stroke="#e4e2da" stroke-width="1"/>`;

  // Tape straddles the top edge; its lowest corner must stay above the art.
  const tapeW = 56;
  const tapeH = 18;
  const rot = 4;
  const lowest = tapeH / 2 + (tapeW / 2) * Math.sin((rot * Math.PI) / 180);
  const tapeCy = py - 2;
  if (tapeCy + lowest >= a.y - 1) throw new Error('tape would touch the art; paper margin too thin');
  const strip = (cx, deg) => {
    const x = -tapeW / 2;
    const y = -tapeH / 2;
    const z = 2.2; // torn, zig-zag ends
    const pts = [
      [x, y], [x + tapeW, y], [x + tapeW - z, y + tapeH * 0.25], [x + tapeW, y + tapeH * 0.5],
      [x + tapeW - z, y + tapeH * 0.75], [x + tapeW, y + tapeH], [x, y + tapeH],
      [x + z, y + tapeH * 0.75], [x, y + tapeH * 0.5], [x + z, y + tapeH * 0.25],
    ]
      .map((p) => p.join(','))
      .join(' ');
    return (
      `<g transform="translate(${cx} ${tapeCy}) rotate(${deg})">` +
      `<polygon points="${pts}" fill="#efe6c4" fill-opacity="0.58"/>` +
      `<polygon points="${pts}" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="0.8"/>` +
      `</g>`
    );
  };
  const over = strip(px + 18, -rot) + strip(px + pw - 18, rot);
  return { under: stripSvg(under) + body, over };
}

/** Pull the inner markup out of a standalone svg string so layers share one SVG. */
function stripSvg(s) {
  return s.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
}

// ---------------------------------------------------------------- skateboard

function deckPath(cx, top, len, wid) {
  const rx = wid / 2;
  const ry = wid * 0.5; // slightly longer than round: popsicle nose and tail
  const l = cx - rx;
  const r = cx + rx;
  const bot = top + len;
  return (
    `M${l} ${top + ry} A${rx} ${ry} 0 0 1 ${r} ${top + ry} L${r} ${bot - ry} ` +
    `A${rx} ${ry} 0 0 1 ${l} ${bot - ry} Z`
  );
}

async function skateboardBuffer(item, artPath, scene, W, H, box) {
  const len = Math.round(Math.min(H * DECK_LENGTH_FRAC, box ? box.h : Infinity, box ? box.w / DECK_WIDTH_RATIO : Infinity));
  const wid = Math.round(len * DECK_WIDTH_RATIO);
  const cx = box ? Math.round(box.cx) : Math.round(W / 2);
  const cy = box ? Math.round(box.cy) : Math.round(H / 2);
  const top = cy - Math.round(len / 2);
  const left = cx - Math.round(wid / 2);
  const d = deckPath(cx, top, len, wid);
  const dLocal = deckPath(wid / 2, 0, len, wid);

  // Cover-crop: scale to fill the deck, crop horizontally at focusX, centre vertically.
  const meta = await sharp(artPath).metadata();
  const scale = Math.max(wid / meta.width, len / meta.height);
  const sw = Math.max(wid, Math.round(meta.width * scale));
  const sh = Math.max(len, Math.round(meta.height * scale));
  const focusX = item.focusX == null ? 0.5 : item.focusX;
  const cropX = Math.round((sw - wid) * clamp(focusX, 0, 1));
  const cropY = Math.round((sh - len) / 2);
  const tile = await sharp(artPath)
    .resize(sw, sh, { fit: 'fill' })
    .extract({ left: cropX, top: cropY, width: wid, height: len })
    .toBuffer();

  const concave = svgBuf(
    wid,
    len,
    `<defs>` +
      `<linearGradient id="h" x1="0" x2="1" y1="0" y2="0">` +
      `<stop offset="0" stop-color="#dcdcdc"/><stop offset="0.2" stop-color="#f7f7f7"/>` +
      `<stop offset="0.5" stop-color="#c8c8c8"/><stop offset="0.8" stop-color="#f4f4f4"/>` +
      `<stop offset="1" stop-color="#d6d6d6"/></linearGradient>` +
      `</defs><rect width="${wid}" height="${len}" fill="url(#h)"/>`
  );
  const kick = svgBuf(
    wid,
    len,
    `<defs><linearGradient id="v" x1="0" x2="0" y1="0" y2="1">` +
      `<stop offset="0" stop-color="#d4d4d4"/><stop offset="0.1" stop-color="#fff"/>` +
      `<stop offset="0.9" stop-color="#fff"/><stop offset="1" stop-color="#d4d4d4"/></linearGradient></defs>` +
      `<rect width="${wid}" height="${len}" fill="url(#v)"/>`
  );
  const spec = svgBuf(
    wid,
    len,
    `<defs><linearGradient id="s" x1="0" x2="1" y1="0" y2="0">` +
      `<stop offset="0.2" stop-color="#fff" stop-opacity="0"/><stop offset="0.3" stop-color="#fff" stop-opacity="0.24"/>` +
      `<stop offset="0.4" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
      `<linearGradient id="f" x1="0" x2="0" y1="0" y2="1">` +
      `<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.2" stop-color="#fff"/>` +
      `<stop offset="0.8" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
      `<mask id="m"><rect width="${wid}" height="${len}" fill="url(#f)"/></mask></defs>` +
      `<rect width="${wid}" height="${len}" fill="url(#s)" mask="url(#m)"/>`
  );
  const clip = svgBuf(wid, len, `<path d="${dLocal}" fill="#000"/>`);

  const shaded = await sharp(tile)
    .composite([
      { input: concave, blend: 'multiply' },
      { input: kick, blend: 'multiply' },
      { input: spec, blend: 'screen' },
    ])
    .png()
    .toBuffer();
  const deckArt = await sharp(shaded)
    .composite([{ input: clip, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const under = shadowLayer(W, H, [
    { shape: `<path d="${d}"/>`, dx: 26, dy: 34, sigma: 26, opacity: 0.72 },
    { shape: `<path d="${d}"/>`, dx: 6, dy: 9, sigma: 5, opacity: 0.7 },
  ]).toString();
  // Maple ply edge: stroked wider than the art clip so only its outer half shows.
  const rim =
    `<path d="${d}" fill="none" stroke="#a97d47" stroke-width="11" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="#d4ae78" stroke-width="8" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="#e6c995" stroke-opacity="0.55" stroke-width="2" stroke-linejoin="round"/>`;
  return { deckArt, left, top, svg: stripSvg(under) + rim, deck: { len, wid } };
}

// -------------------------------------------------------------------- main

function loadManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

async function overrideBackground(scene, W, H) {
  return sharp(path.resolve(ROOT, scene.background)).resize(W, H, { fit: 'cover' }).removeAlpha().raw().toBuffer();
}

async function render(manifest, item) {
  const scene = manifest.scenes[item.scene];
  if (!scene) throw new Error(`unknown scene "${item.scene}"`);
  const size = manifest.output[item.kind === 'skateboard' ? 'skateboard' : 'wall'];
  if (!size) throw new Error(`no output size for kind "${item.kind}"`);
  const { width: W, height: H } = size;
  const artPath = path.join(ROOT, item.art);
  if (!fs.existsSync(artPath)) throw new Error(`missing art: ${item.art}`);

  const useBg = Boolean(scene.background);
  if (useBg && !scene.placement) throw new Error(`scene "${item.scene}" has background but no placement`);
  const pl = scene.placement;
  const placeBox = pl && { cx: pl.x + pl.w / 2, cy: pl.y + pl.h / 2, w: pl.w, h: pl.h };

  let bgRaw;
  let floorTop = 0;
  if (useBg) {
    bgRaw = await overrideBackground(scene, W, H);
  } else if (item.kind === 'skateboard') {
    bgRaw = drawConcrete(scene, W, H);
  } else {
    const wall = drawWall(item.scene, scene, W, H);
    bgRaw = wall.input;
    floorTop = wall.floorTop;
  }
  const base = sharp(bgRaw, { raw: { width: W, height: H, channels: 3 } });
  const layers = [];

  if (item.kind === 'skateboard') {
    const deck = await skateboardBuffer(item, artPath, scene, W, H, placeBox);
    layers.push({ input: svgBuf(W, H, deck.svg), left: 0, top: 0 });
    layers.push({ input: deck.deckArt, left: deck.left, top: deck.top });
  } else {
    const meta = await sharp(artPath).metadata();
    const aw = meta.width;
    const ah = meta.height;
    const portrait = ah >= aw;
    const target = portrait ? H * PORTRAIT_LONG_FRAC : (W * LANDSCAPE_WIDTH_FRAC * Math.max(aw, ah)) / aw;
    const box = placeBox || wallBox(W, H, floorTop);
    const a = artRect(item.kind, aw, ah, placeBox ? Infinity : target, box);

    const art = await sharp(artPath).resize(a.w, a.h, { fit: 'fill' }).toBuffer();
    const stats = await sharp(art).stats();
    const mean = stats.channels.slice(0, 3).map((c) => c.mean);
    const light = scene.light || 'left';
    const obj =
      item.kind === 'canvas'
        ? canvasObject(a, W, H, light, mean)
        : item.kind === 'framed'
          ? framedObject(a, W, H, light)
          : item.kind === 'poster'
            ? posterObject(a, W, H, light)
            : null;
    if (!obj) throw new Error(`unknown kind "${item.kind}"`);
    layers.push({ input: svgBuf(W, H, obj.under), left: 0, top: 0 });
    layers.push({ input: art, left: a.x, top: a.y });
    if (obj.over) layers.push({ input: svgBuf(W, H, obj.over), left: 0, top: 0 });
  }

  return base.composite(layers).webp(WEBP).toBuffer();
}

async function main() {
  const args = process.argv.slice(2);
  const onlyIdx = args.indexOf('--only');
  const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;
  if (onlyIdx >= 0 && !only) {
    console.error('--only needs a slug');
    process.exit(1);
  }

  const manifest = loadManifest();
  const items = manifest.items.filter((it) => !only || it.slug === only);
  if (only && items.length === 0) {
    console.error(`no item with slug "${only}"`);
    process.exit(1);
  }

  const outDir = path.join(ROOT, manifest.output.dir);
  fs.mkdirSync(outDir, { recursive: true });

  let failed = 0;
  for (const item of items) {
    const rel = path.join(manifest.output.dir, `${item.slug}-${item.kind}.webp`);
    try {
      const buf = await render(manifest, item);
      fs.writeFileSync(path.join(ROOT, rel), buf);
      const kb = buf.length / 1024;
      const flag = kb > MAX_KB ? `  OVER ${MAX_KB} KB BUDGET` : '';
      console.log(`${rel} (${Math.round(kb)} KB)${flag}`);
    } catch (err) {
      console.error(`FAILED ${item.slug}-${item.kind}: ${err.message}`);
      failed++;
    }
  }
  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
