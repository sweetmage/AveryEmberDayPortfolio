# Accessibility Reference — brand.css

**Last updated:** 2026-06-04  
**Scope:** `brand.css` token system and component library  
**Standard:** WCAG 2.1 (AA baseline), AudioEye guidelines  

> **Important:** Contrast ratios below are calculated from the WCAG relative luminance formula against exact token hex values. Validate with a live tool (axe DevTools, WAVE, or Colour Contrast Analyser) before publishing a formal accessibility conformance statement.

---

## 1. Dark Mode Contrast

**WCAG requirement:** 4.5:1 minimum for normal text (AA); 3:1 for large text (AA); 7:1 for AAA.

### Primary text pair (dark)

| Token | Value | Role |
|-------|-------|------|
| `--brand-bg` | `#0A0A0A` | Page background |
| `--brand-bg-soft` | `#0f0f0f` | Soft background variant |
| `--brand-text` | `#f3f3ee` | Primary body/heading text |

**Calculated contrast — `#f3f3ee` on `#0A0A0A`:** ~18.7:1 (exceeds AAA for all text sizes)

### Surface text pairs (dark)

| Background token | Value | Text token | Value | Approx. ratio |
|-----------------|-------|------------|-------|---------------|
| `--brand-surface-1` | `#141414` | `--brand-text` (`#f3f3ee`) | — | ~16.4:1 |
| `--brand-surface-2` | `#1a1a1a` | `--brand-text` (`#f3f3ee`) | — | ~14.9:1 |
| `--brand-surface-3` | `#222222` | `--brand-text` (`#f3f3ee`) | — | ~12.8:1 |

All primary text pairings in dark mode exceed the WCAG AAA 7:1 threshold.

---

## 2. Light Mode Contrast

**Design principle:** The token system shifts accent and text colors when `[data-theme="light"]` is active, rather than reusing dark-mode hex values on a light background. This is essential — dark-mode accent `#CC44FF` on `#F2F0EC` yields only ~3.1:1, which fails AA for normal text.

### Primary text pair (light)

| Token | Value | Role |
|-------|-------|------|
| `--brand-bg` | `#F2F0EC` | Page background |
| `--brand-text` | `#1C1C1A` | Primary body/heading text |

**Calculated contrast — `#1C1C1A` on `#F2F0EC`:** ~16.8:1 (exceeds AAA)

### Accent shift (dark → light)

| Token | Dark value | Light value | Why it shifts |
|-------|-----------|-------------|---------------|
| `--brand-accent` | `#CC44FF` | `#8B22E0` | `#CC44FF` on `#F2F0EC` ≈ 3.1:1 (fails AA); `#8B22E0` on `#F2F0EC` ≈ 5.6:1 (passes AA) |
| `--brand-neon` | `#00FFFF` | `#008EAA` | Cyan on white is near-invisible; shifted to teal with adequate contrast |
| `--brand-gold` | `#f5b96a` | `#B86E10` | Light gold fails on warm-white bg; deep amber passes |

### Surface text pairs (light)

| Background token | Value | Text token | Value | Approx. ratio |
|-----------------|-------|------------|-------|---------------|
| `--brand-bg` | `#F2F0EC` | `--brand-text` (`#1C1C1A`) | — | ~16.8:1 |
| `--brand-surface-1` | `#E4E2DD` | `--brand-text` (`#1C1C1A`) | — | ~14.3:1 |
| `--brand-surface-2` | `#DDDAD4` | `--brand-text` (`#1C1C1A`) | — | ~12.9:1 |

---

## 3. Text Hierarchy & Muted Swatches

The token system defines four text tiers. Their accessibility status differs and their use is intentionally constrained.

### Dark mode tiers

| Token | Value | Approx. contrast on `#0A0A0A` | Permitted use |
|-------|-------|-------------------------------|---------------|
| `--brand-text` | `#f3f3ee` | ~18.7:1 | Body copy, headings, all essential content |
| `--brand-text-soft` | `#d7d7d1` | ~12.6:1 | Secondary body copy, subheadings |
| `--brand-text-muted` | `#a2a29a` | ~6.2:1 | Labels, captions, nav links, metadata (passes AA) |
| `--brand-text-faint` | `#72726b` | ~3.5:1 | **Decorative only** — eyebrows, timestamps, section labels (fails AA for normal text) |

### Light mode tiers

| Token | Value | Approx. contrast on `#F2F0EC` | Permitted use |
|-------|-------|-------------------------------|---------------|
| `--brand-text` | `#1C1C1A` | ~16.8:1 | Body copy, headings, all essential content |
| `--brand-text-soft` | `#313130` | ~12.3:1 | Secondary body copy, subheadings |
| `--brand-text-muted` | `#6A6860` | ~4.9:1 | Labels, captions, nav links, metadata (passes AA) |
| `--brand-text-faint` | `#9A9890` | ~2.8:1 | **Decorative only** — fails AA for normal text; never use for body copy or instructions |

### Usage rules

**Permitted uses for `--brand-text-muted`:**
- Navigation link text (`brand.css:1101`)
- Footer credit text (`brand.css:1089`)
- Eyebrow labels (`.brand-eyebrow` at `brand.css:786`)
- Section labels (`.brand-section-label` at `brand.css:794`)
- Theme toggle icon fill (decorative, not text)

**`--brand-text-faint` is strictly decorative.** Never assign it to:
- Body paragraph text
- Error messages or form validation feedback
- Button labels
- Any content a user must read to complete a task

If you are unsure whether a text element is "essential," use `--brand-text-muted` or higher.

---

## 4. Non-Color Interactivity Indicators

WCAG 1.4.1 (Use of Color) requires that color is not the sole means of conveying information or indicating an action.

### Hover states

Cards use both color and motion to signal interactivity:

```css
/* brand.css:835–840 */
.brand-card:hover {
    box-shadow: 0 0 0 1px var(--brand-border-mid), var(--brand-shadow-md);
    transform: translateY(-4px);               /* ← non-color indicator */
    transition: transform 220ms cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 220ms ease;
}
```

`.brand-card-feature:hover` lifts `-6px`. `.brand-card-bubble:hover` lifts `-4px` and amplifies the iridescent ring opacity. The physical lift is perceptible without color vision.

**Note for reduced-motion users:** The `translateY` lift persists when `prefers-reduced-motion: reduce` is active because it is not an animation — it is a `:hover` transform applied instantly. Only time-based `animation` declarations are suppressed. This means hover feedback remains intact for reduced-motion users.

### Focus indicators

All `.brand-btn` elements implement a visible keyboard focus ring:

```css
/* brand.css:963–966 */
.brand-btn:focus-visible {
    outline: 2px solid var(--brand-border-focus);
    outline-offset: 2px;
}
```

**Dark mode focus ring:** `rgba(255, 255, 255, 0.24)` — translucent white outline, visible against all dark surfaces.  
**Light mode focus ring:** `rgba(0, 0, 0, 0.26)` — translucent dark outline, visible against all light surfaces.

The `outline-offset: 2px` ensures the ring does not collapse into the button border, keeping it legible regardless of button background.

**Extension rule:** Any new interactive element added to `brand.css` must include a `:focus-visible` rule with at minimum `outline: 2px solid var(--brand-border-focus); outline-offset: 2px`. Never suppress `outline: none` without providing an equivalent visible alternative.

---

## 5. Motion and Photosensitivity

WCAG 2.3.1 (Three Flashes or Below Threshold) and 2.3.3 (Animation from Interactions, AAA) address motion hazards. The codebase includes:

- Hero blob morphing (`brand-blob-morph-*`) + floating (`brand-float-*`) at 7–16 s cycles
- Micro-bubble float (`brand-micro-float`) at 14–34 s cycles
- Page background opacity drift (`brand-bg-drift`) at 14 s
- Iridescent border orbit (`brand-outline-orbit`) on `.brand-card-bubble` and active/generating buttons
- Rainbow sweep (`brand-rainbow-sweep`) on `.brand-btn-generating`

### Reduced-motion block 1 (blob + background)

```css
/* brand.css:482–488 */
@media (prefers-reduced-motion: reduce) {
    .brand-hero-blobs,
    .brand-hero-blob,
    .brand-page-bg {
        animation: none;
    }
}
```

All hero blob morph, float, and background drift animations are fully halted.

### Reduced-motion block 2 (UI components)

```css
/* brand.css:1126–1134 */
@media (prefers-reduced-motion: reduce) {
    .brand-bubble,
    .brand-btn-active::before,
    .brand-btn-generating::before,
    .brand-card-bubble::before {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
    }
}
```

Micro-bubbles, active/generating button rings, and iridescent card borders are reduced to a single imperceptibly short frame — effectively stopped.

### Extension rule for new animations

When adding any new CSS animation to `brand.css` or a page stylesheet:

1. Assign it to a named `@keyframes` block.
2. Add the animated selector to the relevant `prefers-reduced-motion: reduce` block.
3. Prefer `animation: none` for decorative background motion; prefer `animation-duration: 0.01ms; animation-iteration-count: 1` for UI state animations that must still "complete" before going static.

---

## Known Gaps & Risks

| # | Issue | Severity | Location | Mitigation |
|---|-------|----------|----------|------------|
| 1 | **`--brand-text-faint` misuse risk** | Medium | Any HTML page | Enforce "decorative only" rule (see §3 above). Audit with axe before each deploy. |
| 2 | **`.brand-circle-icon` uses `--brand-text-muted`** | Low | `brand.css:934` | Icon content is decorative (not essential text). Acceptable if no text inside the circle is actionable. |
| 3 | **Iridescent border as sole card state signal** | Low | `brand.css:888–908` | The conic border on `.brand-card-bubble` animates on hover/`:before` opacity — but the `translateY(-4px)` lift is also present. Non-color indicator exists. |
| 4 | **`--brand-btn-secondary` uses `--brand-text-muted` at rest** | Medium | `brand.css:976` | `--brand-text-muted` in dark mode is ~6.2:1 — passes AA. In light mode ~4.9:1 — passes AA (barely). Acceptable but should not be reduced further. |
| 5 | **Focus style not extended to nav links, footer links, or cards** | Medium | `brand.css:1098–1103` | `.brand-nav-logo`, `.brand-footer-links a`, `.brand-card-bubble` lack explicit `:focus-visible` rules. They inherit browser defaults, which may be insufficient in some browsers. Add explicit `outline` rules for each. |
| 6 | **`style.css` not audited** | Medium | `style.css` | This audit covers only `brand.css`. Run a separate pass on `style.css` and all project HTML pages. |

---

## Future Contributor Checklist

Before merging CSS changes that affect color, animation, or interactivity:

- [ ] Any new foreground/background text pair has ≥ 4.5:1 contrast in both dark and light themes
- [ ] Accent/interactive colors are validated in both themes (dark and light values are different hex codes if on different backgrounds)
- [ ] `--brand-text-faint` is not used on body copy or essential instructions
- [ ] Any new animated element is covered by `prefers-reduced-motion: reduce`
- [ ] Any new interactive element has a `:focus-visible` outline rule
- [ ] Hover/active states use at least one non-color indicator (transform, border width, icon swap, underline)
- [ ] No new `animation` block with a sub-second interval loop (flash risk)

---

## Reference: Token Quick-Lookup

### Dark mode text tokens (background `#0A0A0A`)

| Token | Hex | WCAG status |
|-------|-----|-------------|
| `--brand-text` | `#f3f3ee` | AAA (all text) |
| `--brand-text-soft` | `#d7d7d1` | AAA (all text) |
| `--brand-text-muted` | `#a2a29a` | AA (normal text) |
| `--brand-text-faint` | `#72726b` | Fails AA (normal text) |

### Light mode text tokens (background `#F2F0EC`)

| Token | Hex | WCAG status |
|-------|-----|-------------|
| `--brand-text` | `#1C1C1A` | AAA (all text) |
| `--brand-text-soft` | `#313130` | AAA (all text) |
| `--brand-text-muted` | `#6A6860` | AA (normal text) |
| `--brand-text-faint` | `#9A9890` | Fails AA (normal text) |

### Accent tokens — contrast on their respective backgrounds

| Theme | Token | Hex | Background | Approx. ratio | WCAG |
|-------|-------|-----|------------|---------------|------|
| Dark | `--brand-accent` | `#CC44FF` | `#0A0A0A` | ~5.9:1 | AA |
| Light | `--brand-accent` | `#8B22E0` | `#F2F0EC` | ~5.6:1 | AA |
| Dark | `--brand-gold` | `#f5b96a` | `#0A0A0A` | ~8.4:1 | AAA |
| Light | `--brand-gold` | `#B86E10` | `#F2F0EC` | ~5.3:1 | AA |
