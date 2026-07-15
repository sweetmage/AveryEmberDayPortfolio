# srcset / @2x Variants for Project + Gallery Thumbnails

**Date:** 2026-07-13
**Source task:** TODO.md → Architecture remediation follow-ups → "`srcset` / `@2x` variants for project + gallery thumbnails"
**Status:** Complete 2026-07-13 (LOGBOOK Entry 073) — 25 variants generated, srcset/sizes wired, build + 33/33 Playwright verified

## Goal

Stop shipping full-resolution images to every viewport. The homepage gallery card loads a 426 KB, 1200×1556 webp (`FacesFinal.webp`) into a ~500 px-wide `aspect-video` crop, and the gallery page loads all 11 full-size webps (up to 426 KB each) into ~438 px-wide grid cells. Generate downscaled variants and wire `srcset`/`sizes` so browsers pick the right size, with the original as the 2x/3x ceiling.

## Current state

- Next.js 15 static export (`output: 'export'`, `images.unoptimized: true`), plain `<img>` tags — no `next/image` optimization available. Variants must be pre-generated files in `public/`.
- Project thumbs: `public/images/projects/brand-thumb.jpg` (1280×720, 35 KB), `mistrust-thumb.jpg` (720×720, 84 KB).
- Gallery: 11 webps in `public/images/myart/Gallery/` (+1 in `SelfPortraitSeries/`), all 1200 px wide, 53–426 KB.
- Rendered widths (from `brand.css` / `site.css` / Tailwind classes):
  - Home project cards: 2-col grid ≥768 px inside `main` (max 1200, pad clamp 16–40) + `brand-container` (pad clamp 20–48), gap 24 → card caps at ~500 px desktop, ~45vw tablet, ~92vw mobile.
  - Gallery grid: `max-w-[900px]`, 2-col ≥768 px, gap 24 → ~438 px desktop, ~46vw tablet, ~92vw mobile.

## Approach

1. **Add `sharp` as a devDependency** (build-time tool only; not shipped).
2. **New script `scripts/generate-image-variants.js`**: manifest-driven resizer.
   - Manifest entries: `{ src, widths[] }`. Output `<basename>-<width>w.<ext>` next to the source, same format as source (jpg→jpg, webp→webp). Skip when variant exists and is newer than source. Never upscale.
   - Project thumbs: `brand-thumb` → 480, 960 (original 1280 is the top rung). `mistrust-thumb` → 480 (original 720 is the top rung).
   - Gallery webps (all 12 incl. SelfPortraitSeries): 480, 900 (original 1200 is the top rung).
3. **Wire `srcset`/`sizes` in JSX**:
   - `app/page.tsx` — 3 card `<img>`s (brand-thumb, mistrust-thumb, FacesFinal):
     `sizes="(min-width: 1200px) 500px, (min-width: 768px) 45vw, 92vw"`.
   - `app/gallery/page.tsx` — add per-item `width`/`height` to the data array (prevents CLS; currently missing) and render `srcset` + `sizes="(min-width: 1000px) 438px, (min-width: 768px) 46vw, 92vw"`.
   - Keep original path as `src` fallback and largest `srcset` rung.
4. **Run the script**, commit-ready variant files land in `public/`.

## Files to touch

- `package.json` (+`sharp` devDep, +`images:variants` npm script)
- `scripts/generate-image-variants.js` (new)
- `app/page.tsx`, `app/gallery/page.tsx`
- `public/images/**` (generated variants)
- `TODO.md`, `LOGBOOK.md`, this plan

## Parallel tracks

Work is small and coupled (script output names must match JSX srcset strings) — single sequential track. No parallel dispatch.

## Verification

- `node scripts/generate-image-variants.js` — all variants generated, correct dimensions, no upscales.
- `npm run build:next` — static export succeeds; grep `out/index.html` and `out/gallery/index.html` for `srcset`.
- `npx playwright test` — existing harness passes (baseline screenshots may need review if rendering shifts; width/height attrs should not change layout since CSS sets `w-full`/`object-contain`).
- Spot-check one variant file's actual pixel width.

## Risks

- **Gallery `width`/`height` + `object-contain`**: CSS `[&_img]:w-full` + `max-h-[70vh] object-contain` controls layout; adding intrinsic dimensions only fixes aspect-ratio reservation. Verify no visual shift via Playwright screenshots.
- **Netlify deploy**: site deploys from committed build output / repo — new files under `public/` flow through `next build` automatically; no config change needed.
- **`SelfPortraitSeries` filename contains spaces** — script must handle it; srcset URLs need the space handling the current `src` already uses (browser encodes it; keep identical path style).
- Variant regeneration is idempotent; originals are never modified.
