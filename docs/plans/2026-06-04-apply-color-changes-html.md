# Apply Recent Color Changes to All HTML Files

**Date:** 2026-06-04  
**Goal:** Ensure every `.html` file aligns with the accessible palette changes from LOGBOOK Entry 032 and fix known accessibility gaps in project page inline styles.

## Background

LOGBOOK Entry 032 updated `brand.css`, `style.css`, `resume/AveryEmberDay_Resume_2026_Brand.html`, and `docs/accessibility.md` with new WCAG 2.1 AA–compliant token values:

- Dark `--brand-text-faint`: `#72726b` → `#82827a` (5.11:1)
- Light `--brand-text-faint`: `#9A9890` → `#5A5850` (6.26:1)
- Light `--brand-neon`: `#008EAA` → `#006e82` (5.19:1)
- Light `--brand-gold`: `#B86E10` → `#995008` (5.26:1)
- Synced iridescent `--brand-ir-3` / `--brand-ir-6`
- Fixed `var(--brand-text-base)` → `var(--brand-text)` in `style.css`

## Files to Touch

1. **`docs/color-contrast-preview.html`**
   - Update "Current" values to the new accessible palette.
   - Update "My pick" column to match actual choices from Entry 032.
   - Change legend from "Current (failing)" to "Current (passing)".
   - Keep old values as "Previous" for historical reference.

2. **`projects/history-of-mistrust.html`**
   - `.section-title` hardcoded `color: #7eb8ff;` → `var(--brand-ir-4)`.
   - Reason: `#7eb8ff` on light bg (#F2F0EC) is 1.81:1 — fails AA even for large text. `var(--brand-ir-4)` gives `#9acdff` (11.83:1 dark) / `#1A7ACC` (3.93:1 light, passes AA for large text at 1.5rem bold).

3. **`projects/brand-avery-ember-day.html`**
   - `.section-title` hardcoded `color: #7eb8ff;` → `var(--brand-ir-4)`.
   - Literal color swatch references (backgrounds, hex labels) remain unchanged as they document the actual brand palette.

4. **`projects/patriots-low-thirds.html`**
   - `.section-title` hardcoded `color: #7eb8ff;` → `var(--brand-ir-4)`.

## Reuse / Dependencies

- `brand.css` tokens are the source of truth.
- No new dependencies.

## Risks

- Changing `.section-title` color in light mode from `#7eb8ff` (sky blue) to `#1A7ACC` (navy blue) is a visible shift, but it is necessary for accessibility and themability.
- `docs/color-contrast-preview.html` is informational; changing it does not affect the live site UI.

## Verification

- Grep for old failing hex values (`#72726b`, `#9A9890`, `#B86E10`, `#008EAA`) across all HTML files → should only remain in `docs/color-contrast-preview.html` as "Previous" labels.
- Grep for `var(--brand-text-base)` across all HTML → zero hits.
- Confirm `#7eb8ff` no longer used for text color in project pages.
- Calculate contrast for new `.section-title` token in both themes.

## Steps

1. Update `docs/color-contrast-preview.html`.
2. Update `.section-title` in three project pages.
3. Run grep verification.
4. Update `LOGBOOK.md` with an entry documenting the changes.
5. Final diff review.
