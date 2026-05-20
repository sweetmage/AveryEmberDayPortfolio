## Entry 001 — 2026-05-20

**Agent:** claude-sonnet-4-6 (lumis, executor)
**Cycle:** brand-migration
**Task:** Apply new brand CSS from BrandForge-v2 to portfolio website

### Changes

- **brand.css** (new) — dark-first `--brand-*` token system extracted from BrandForge-v2. Includes `@property --brand-orbit-angle`, all keyframe animations (float, blob-layer-rotate, micro-float, bg-drift, outline-orbit, outline-pulse, rainbow-sweep), page glow background, noise texture layer, and hero blob CSS.
- **style.css** (rewritten) — all old `--purple/--mint/--neon-pink/--black/--lavender/--blue` vars removed. All component styles migrated to `--brand-*` tokens. Fonts switched to Sriracha (display), Outfit (heading), Inter (body) with local Funcity/Sonny Cond as fallbacks. Nav, header, cards, tags, footer, contact, gallery, case study, back-link, return-to-top all updated to brand aesthetic (iridescent gradients, glow shadows, rounded surfaces, uppercase nav).
- **index.html** — Google Fonts added, brand.css linked, `.brand-page-bg`/`.brand-page-noise` divs injected, hero blob layer added.
- **gallery/gallery.html, gallery/digital.html, gallery/physical.html** — Google Fonts + `../brand.css` link + background divs added.
- **projects/a-history-of-mistrust.html, brand-avery-ember-day.html, patriots-low-thirds.html, self-portrait-series.html** — Google Fonts + `../brand.css` link + background divs added. Inline `var(--neon-pink)` → `var(--brand-accent)`, `var(--purple)` → `var(--brand-border-mid)` in a-history-of-mistrust.html.
- **.claude/launch.json** (new) — local serve config on port 3478.

### Intentionally excluded
- `resume/` — all three resume files have self-contained CSS for print/PDF use; not part of the brand system.
- `projects/RNG/` — standalone mini-app with its own Bootstrap styles.

---

## Entry 002 — 2026-05-20

**Agent:** NOVA (claude-sonnet-4-6)
**Cycle:** hero-bubbles-rebuild
**Task:** Rebuild hero animation bubbles — organic morphing, independent per-blob motion

### Changes

- **brand.css** — hero blob section rebuilt:
  - Added 5 organic morph keyframes (`brand-blob-morph-1` through `brand-blob-morph-5`) using 8-value `border-radius` syntax
  - Added 5 unique float path keyframes (`brand-float-1` through `brand-float-5`) with distinct X/Y/scale trajectories
  - Removed container-level rotation (`brand-blob-layer-rotate`) from `.brand-hero-blobs`
  - Removed `border-radius: 50%` from `.brand-hero-blob` base; added `will-change: transform, border-radius`
  - Each blob now runs a compound animation: unique `brand-float-N` + `brand-blob-morph-N` at independent durations/offsets
  - All blob colors, sizes, positions, and box-shadows unchanged

### Method

Nano-agent implementation (hero-bubble-rebuild) + nano-agent readonly review + NOVA main-agent diff review.
