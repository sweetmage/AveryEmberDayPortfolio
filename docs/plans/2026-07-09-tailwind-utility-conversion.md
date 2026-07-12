# Plan — Tailwind Utility Conversion + Nav Trim

**Date:** 2026-07-09
**Status:** ✅ Complete (2026-07-09) — see LOGBOOK Entry 060
**Branch:** `shxdowloop/2026-07-05/bubble-physics-and-review-fixes`

## Goal

1. **Nav trim:** top bar shows only **Work** and **About** (plain links, no submenu, no Contact, no Hire Me CTA, no hamburger — two links fit every viewport).
2. **Tailwind conversion, all 5 pages:** author page markup in Tailwind utilities; keep only irreplaceable custom CSS as component classes.

## Approach

- **Utilities take over** everything class-based in `src/css/site.css`: grids, cards, hero text, footer icons, gallery, case-study layout, tags, placeholders, skip-link.
- **Stays as CSS** (irreplaceable / theme- or JS-coupled):
  - `brand.css` component visuals: `.brand-nav` bar, `.brand-footer`, bubbles/blobs + keyframes, spectrum bar, page bg/noise, theme toggle, `#return-to-top`.
  - `@layer base` element typography (body, h1–h3, p, figcaption) — idiomatic Tailwind.
  - `.hero-logo` / nav logo theme-swap rules (`content: url(...)` per `[data-theme]`).
- **Class names referenced by JS stay in the markup** even when their styles move to utilities (bubble exclusion zones + Script.js hooks): `.project-card`, `.about-box`, `.hero-name`, `.hero-sub`, `.gallery-header`, `.gallery-item`, `.wip-notice`, `.case-study-hero`, `.case-study-section` (+ its `h2`), `.brand-nav*`, `.brand-footer*`, `#hero`, `#work`, `#about`, `#theme-toggle`, `#return-to-top`.
- **Dark variant:** add `@custom-variant dark` keyed to `[data-theme="dark"]` in `app.css` so `dark:` utilities work with the existing theme toggle.
- **Preset additions** (`src/css/tailwind-preset.css`): bridge `--brand-border` → `line`, `--brand-border-mid` → `line-mid`, `--brand-accent-dim` → `accent-dim`, `--brand-gold-dim` → `gold-dim`; bridge `--brand-shadow-lg`.

## Sequence

1. Preset + `app.css` variant additions.
2. `index.html` — nav trim + full conversion (reference pattern).
3. `src/css/site.css` — delete converted rules.
4. `gallery/gallery.html`, 3 project pages — nav trim + conversion.
5. Rebuild `style.css`; browser-verify all pages (both themes, mobile width); Playwright smoke + baselines.
6. Docs, commit, push.

## Risks

- Removing hamburger: mobile nav must still show both links → nav-links get always-visible utility layout.
- Baselines will change (nav + pixel shifts) — suite refreshes them; manual visual check is the gate.
- `Script.js` submenu/hamburger code becomes dead but is guard-wrapped (no errors); leave in place.
