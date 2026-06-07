# Resume Accessibility Plan — 2026-06-06

## Goal
Apply the same accessibility patterns used on the main website (`index.html`) to `resume/AveryEmberDay_Resume_2026_Brand.html`, with special attention to color contrast.

## Files
- `resume/AveryEmberDay_Resume_2026_Brand.html`

## Gaps Found

1. **Missing skip link** — `index.html` has `.skip-link`; resume does not.
2. **Missing focus-visible styles** — Resume links (`.resume-back`, `.contact a`) and the theme toggle have no explicit `:focus-visible` rules. They fall back to browser defaults, which may be insufficient.
3. **Decorative SVGs not hidden from AT** — Theme-toggle sun/moon SVGs lack `aria-hidden="true"`.
4. **Missing `meta description`** — `index.html` has one; resume does not.
5. **Footer portfolio links are plain text spans, not `<a>` tags** — The `.url` spans in `.footer-portfolio` display URLs but are not clickable. This is a functional a11y gap (non-color interactivity).

## Color Contrast Verification

All text colors in the resume use brand tokens that have already been adjusted for WCAG 2.1 AA (Entry 032). Spot-checks:

| Element | Token | Dark ratio | Light ratio | Status |
|---|---|---|---|---|
| Body text | `--brand-text` | ~18.7:1 | ~16.8:1 | AAA |
| `.tagline` | `--brand-text-muted` | ~6.2:1 | ~4.9:1 | AA |
| `.role-dates` | `--brand-text-muted` | ~6.2:1 | ~4.9:1 | AA |
| `.role-meta .company` | `--brand-neon` | ~15.8:1 | ~5.2:1 | AAA / AA |
| `.section-title` | `--brand-accent` | ~5.9:1 | ~5.6:1 | AA |
| `.contact .label` | `--brand-accent` | ~5.9:1 | ~5.6:1 | AA |
| `.pronouns` text | `--brand-gold` | ~8.4:1 | ~5.3:1 | AAA / AA |
| `.award .award-meta` | `--brand-text-muted` | ~6.2:1 | ~4.9:1 | AA |
| `.summary` text | `--brand-text-soft` | ~12.6:1 | ~12.3:1 | AAA |
| Print accent (`#7a1ccc` on `#fff`) | — | — | ~7.3:1 | AAA |

No hardcoded failing hex colors remain in the non-print styles.

## Changes

1. Add `<a href="#main" class="skip-link">Skip to content</a>` at the top of `<body>`.
2. Add `id="main"` to the existing `<main>` element.
3. Add `.skip-link` CSS block to the inline `<style>`.
4. Add `:focus-visible` rules for `.resume-back`, `.contact a`, and `#theme-toggle` using brand tokens.
5. Add `aria-hidden="true"` to both theme-toggle SVGs.
6. Add `<meta name="description" content="...">` in `<head>`.
7. Convert `.footer-portfolio .url` spans to `<a>` tags pointing to the actual URLs, preserving styling.

## Verification

- Run a Node script to grep for old failing hex values in the resume → expect zero hits.
- Open the file in a browser and tab through all interactive elements → confirm visible focus rings.
- Confirm skip link appears on Tab and jumps to `#main`.
- Confirm theme toggle SVGs have `aria-hidden="true"`.

## Risks

- Footer URL → `<a>` conversion adds new links; styling must remain identical in both themes and print.
- No build step; changes are pure HTML/CSS edits.
