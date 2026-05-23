# Nanoagent Plan: Branded Resume 2026-05-22

## Goal
Create `resume/AveryEmberDay_Resume_2026_Brand.html` — a resume that uses the brand.css token system fully, replacing all custom CSS with `--brand-*` variables and `brand-*` classes. Includes the BubbleLogo SVG, light/dark theme via `data-theme`, and print-friendly single-page layout.

## Approach
- Source content: `resume/AveryEmberDay_Resume_2026.html`
- Source tokens: `brand.css` (linked via `../brand.css`)
- Logo: `../images/icons/BubbleLogo/bubbleLogo-white.svg` (dark), `bubbleLogo-black.svg` (light, via CSS class swap)
- Theme toggle: mirror pattern from `index.html`
- Fonts: Sriracha (name/display), Outfit (section headings), Inter (body) — all from brand.css @import
- No external font imports — brand.css handles it

## Files to Touch
- CREATE: `resume/AveryEmberDay_Resume_2026_Brand.html`
- CREATE: `docs/plans/` (this file)

## Nano-Agent Roles
1. **explore** (readonly): Check brand-avery-ember-day.html, Dark resume, resume.html for brand-* patterns → findings
2. **implement** (if dispatched): bounded to resume/ only

## Verification
- Open in browser, check dark/light toggle, check print preview
- Confirm brand fonts render, logo appears, colors match brand palette

## Review Owner
Main agent (shxdow-flow) performs final diff review.

## Risks
- Print layout: brand.css is dark-first; need explicit `@media print` overrides for legible paper output
- Logo color: white SVG invisible on light bg — handle via separate logo variants per theme or CSS filter
- brand.css `@import` in `<head>` has Google Fonts; resume must link brand.css, not re-import fonts
