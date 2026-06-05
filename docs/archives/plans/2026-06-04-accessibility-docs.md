# Plan: Accessibility Documentation — brand.css

**Date:** 2026-06-04  
**Agent:** Kilo (Claude route, shxdow-flow)  
**Status:** Archived (completed)

---

## Goal

Create a living accessibility reference document (`docs/accessibility.md`) that captures how the current `brand.css` token system and component library satisfy WCAG 2.1 and AudioEye guidelines — plus marks known gaps and conventions that future contributors must follow.

No CSS changes are in scope for this plan. This is a documentation-only task.

---

## Context

An AudioEye-aligned accessibility audit of `brand.css` identified five areas where the codebase's design decisions intersect with WCAG conformance:

1. **Dark mode contrast** — `#0A0A0A` bg + `#f3f3ee` text → >10:1 ratio (exceeds AA/AAA)
2. **Light mode contrast adjustment** — accent shifts from `#CC44FF` (dark) to `#8B22E0` (light); text shifts from `#f3f3ee` to `#1C1C1A` on `#F2F0EC` bg
3. **Text hierarchy & muted swatches** — four tiers (`--brand-text`, `--brand-text-soft`, `--brand-text-muted`, `--brand-text-faint`); muted/faint are intentionally restricted to non-essential metadata
4. **Non-color interactivity indicators** — `.brand-card:hover` uses `translateY(-4px)` + shadow (not color alone); `.brand-btn:focus-visible` uses `outline: 2px solid var(--brand-border-focus); outline-offset: 2px`
5. **Reduced-motion & photosensitivity** — `@media (prefers-reduced-motion: reduce)` halts blob animations, bubble floats, iridescent border orbits, and bg drift; sets `animation-duration: 0.01ms`

---

## Approach

Write `docs/accessibility.md` as a structured reference covering:
- Contrast ratio table (dark + light, primary text, accent, muted tiers) with specific hex pairs and calculated ratios
- Per-section prose aligned to the five audit areas above
- Usage constraints: where muted/faint tokens are permitted vs. prohibited
- Focus indicator contract: explicit spec for `outline` on interactive elements
- Reduced-motion contract: what is suppressed and how to extend it when adding new animations
- Gap register: known remaining risks (muted/faint body-copy misuse, iridescent border-only conveying state, `.brand-circle-icon` using `--brand-text-muted`)
- Future contributor checklist

---

## Files Touched

| File | Action |
|------|--------|
| `docs/accessibility.md` | **Create** — primary deliverable |
| `TODO.md` | **Update** — add entry to Completed Plans Archive |
| `LOGBOOK.md` | **Update** — new entry |

No changes to `brand.css`, `style.css`, HTML pages, or scripts.

---

## Steps

1. Write `docs/accessibility.md` using the structure above, citing specific token names and hex values from `brand.css`
2. Add a completed-plan entry in `TODO.md` under the Completed Plans Archive section
3. Add a LOGBOOK entry documenting what was created and why

---

## Verification

- All hex pairs cited in the doc are verifiable against `brand.css` tokens (no invented values)
- Contrast ratios computed from actual token values using WCAG relative luminance formula
- Muted/faint usage constraints match `.brand-eyebrow`, `.brand-section-label`, `.brand-footer-credit` patterns actually present in `brand.css`
- Reduced-motion block at `brand.css:1126–1134` accurately described
- `focus-visible` spec at `brand.css:963–966` accurately described

---

## Risks

- **Contrast ratio precision:** Ratios stated from formula; not verified with a live tool run. Mark clearly as calculated approximations; user should validate with axe/WAVE before publishing accessibility statement.
- **Scope creep:** Do not audit `style.css` or project-specific HTML in this pass — that is a separate task.
- **Muted token misuse in HTML:** The doc can only prescribe usage rules; enforcement requires a future linting/audit pass against actual HTML pages.

---

## Review Owner

Main agent (Kilo) performs final diff review before handoff. User reviews and commits.
