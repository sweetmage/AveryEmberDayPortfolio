# Color Palette Contrast Adjustment Plan

**Date:** 2026-06-04  
**Task:** Adjust color palette for contrast (from `TODO.md`)  
**Goal:** Provide alternate hex values that fulfill WCAG 2.1 AA (4.5:1 for normal text) without dramatically changing the brand palette.  
**Scope:** `brand.css` token system, `style.css`, and `docs/accessibility.md`

---

## 1. Current State — Accurate Contrast Audit

The `docs/accessibility.md` reference contains **two incorrect contrast claims** that must be corrected before any colors are changed:

| Claimed in doc | Actual ratio | Status |
|---|---|---|
| Light `--brand-gold` (`#B86E10`) on `#F2F0EC` ≈ 5.3:1 | **3.50:1** | ❌ Fails AA |
| Light `--brand-neon` (`#008EAA`) on `#F2F0EC` = "adequate" | **3.39:1** | ❌ Fails AA |

These errors mean the light-mode accent palette is **not** accessible for normal text.

### Tokens that fail WCAG AA for normal text

| Token | Theme | Current hex | Background | Actual ratio | WCAG AA? |
|---|---|---|---|---|---|
| `--brand-text-faint` | Dark | `#72726b` | `#0A0A0A` | **4.09:1** | ❌ Fail |
| `--brand-text-faint` | Light | `#9A9890` | `#F2F0EC` | **2.54:1** | ❌ Fail |
| `--brand-gold` | Light | `#B86E10` | `#F2F0EC` | **3.50:1** | ❌ Fail |
| `--brand-neon` | Light | `#008EAA` | `#F2F0EC` | **3.39:1** | ❌ Fail |

### Tokens that pass (confirmed)

| Token | Theme | Current hex | Background | Actual ratio | WCAG AA? |
|---|---|---|---|---|---|
| `--brand-text` | Both | `#f3f3ee` / `#1C1C1A` | `#0A0A0A` / `#F2F0EC` | 18.7:1 / 16.8:1 | ✅ AAA |
| `--brand-text-soft` | Both | `#d7d7d1` / `#313130` | `#0A0A0A` / `#F2F0EC` | 13.7:1 / 11.4:1 | ✅ AAA |
| `--brand-text-muted` | Dark | `#a2a29a` | `#0A0A0A` | 7.4:1 | ✅ AA |
| `--brand-text-muted` | Light | `#6A6860` | `#F2F0EC` | **4.90:1** | ✅ AA (barely) |
| `--brand-accent` | Dark | `#CC44FF` | `#0A0A0A` | **5.50:1** | ✅ AA |
| `--brand-accent` | Light | `#8B22E0` | `#F2F0EC` | **5.42:1** | ✅ AA |
| `--brand-gold` | Dark | `#f5b96a` | `#0A0A0A` | 11.34:1 | ✅ AAA |
| `--brand-neon` | Dark | `#00FFFF` | `#0A0A0A` | 15.79:1 | ✅ AAA |

### Non-token bug found

`style.css` lines 263 and 268 reference `--brand-text-base`, which **does not exist** in `brand.css`. This is a broken CSS variable that should be `--brand-text`.

---

## 2. Where the Failing Colors Are Used

### `--brand-text-faint`
- Dark: `brand.css:127`, `brand.css:268` (light override), eyebrow labels, timestamps, decorative section labels
- Light: `brand.css:200`, eyebrow labels, timestamps, decorative section labels
- Risk: Already labeled "decorative only" in `accessibility.md`, but used in HTML across multiple pages. Easy to accidentally misuse.

### `--brand-gold` (light mode)
- `brand.css:206`, `style.css:521` (`.back-link:hover`), `style.css:590` (`.inline-link`)
- These are interactive/text elements. Hover state and inline links must meet AA.

### `--brand-neon` (light mode)
- `brand.css:205`, used in iridescent gradients and as a border accent. The `resume/AveryEmberDay_Resume_2026_Brand.html` print override already shifts it to `#007a8a` (4.45:1, just shy of 4.5:1).
- If used as solid text anywhere, it fails.

---

## 3. Alternate Options

For each failing token, three options are provided:

- **Option A — Conservative:** The smallest possible hex shift that hits exactly 4.5:1. Keeps the color as close to the original as possible.
- **Option B — Comfortable:** A slightly stronger shift that lands around 5:1–6:1, giving a safety buffer for monitor calibration variance.
- **Option C — Reclassify:** Do not change the hex. Instead, audit all HTML/CSS usage and restrict the token to decorative-only contexts (large text, icons, borders, hover accents that also have non-color indicators).

### 3.1 Dark `--brand-text-faint` (`#72726b` → ?)

| Option | Proposed hex | Ratio | Notes |
|---|---|---|---|
| A (conservative) | `#797972` | 4.52:1 | Barely perceptible shift; keeps the "faint" feel |
| B (comfortable) | `#82827a` | 5.11:1 | Slightly more visible; still clearly a faint tier |
| C (reclassify) | Keep `#72726b` | 4.09:1 | Enforce decorative-only with a lint rule or HTML audit |

> **Recommendation:** Option A. The shift is imperceptible to most viewers but turns a 4.09:1 failure into a 4.52:1 pass.

### 3.2 Light `--brand-text-faint` (`#9A9890` → ?)

This is the hardest token because the background is very light. To hit 4.5:1, the color must become significantly darker, which collapses the visual gap between `--brand-text-faint` and `--brand-text-muted`.

| Option | Proposed hex | Ratio | Notes |
|---|---|---|---|
| A (conservative) | `#6f6d65` | 4.55:1 | Only 3% darker than `--brand-text-muted` (`#6A6860`). Visually almost identical. |
| B (comfortable) | `#5A5850` | 6.26:1 | Clearly darker; preserves a distinct faint tier but looks more like "soft" than "faint." |
| C (reclassify) | Keep `#9A9890` | 2.54:1 | **Strongly recommended.** In light mode, the "faint" tier can be dropped entirely. Map all faint usages to `--brand-text-muted` or use an opacity-based decorative treatment instead of a dedicated faint token. |

> **Recommendation:** Option C for light mode. The current `#9A9890` cannot be lightened further (it would become invisible), and darkening it enough to pass destroys the "faint" intent. It is cleaner to eliminate the light-mode faint token and redirect usages to `--brand-text-muted` or an opacity wrapper.

### 3.3 Light `--brand-gold` (`#B86E10` → ?)

| Option | Proposed hex | Ratio | Notes |
|---|---|---|---|
| A (conservative) | `#a55b00` | 4.50:1 | Very close to the original warm amber |
| B (comfortable) | `#995008` | 5.26:1 | Deeper amber; still warm and on-brand |
| C (reclassify) | Keep `#B86E10` | 3.50:1 | Restrict to large text (≥18pt / 24px or 14px bold), decorative borders, or icons. Do not use for body links. |

> **Recommendation:** Option B. `#995008` is a natural deepening of the existing amber that reads as the same brand color family. It also aligns with the print-safe gold already chosen in `resume/AveryEmberDay_Resume_2026_Brand.html` (`#9a5c00`, 4.73:1).

### 3.4 Light `--brand-neon` (`#008EAA` → ?)

| Option | Proposed hex | Ratio | Notes |
|---|---|---|---|
| A (conservative) | `#007793` | 4.54:1 | Minimal shift from teal toward deeper cyan |
| B (comfortable) | `#006e82` | 5.19:1 | Deeper teal; still feels like the same accent |
| C (reclassify) | Keep `#008EAA` | 3.39:1 | Use only for borders, decorative gradients, or large text. Avoid as body/link color in light mode. |

> **Recommendation:** Option A or B. The resume print override (`#007a8a`, 4.45:1) is very close to Option A. Since the iridescent gradient and borders are the primary consumers, Option A (`#007793`) is the least disruptive while making the token safe if it ever appears as solid text.

---

## 4. Implementation Steps

### Step 1 — Fix the documentation
- Update `docs/accessibility.md`: correct the gold and neon contrast values, recalculate the faint tier tables, and add a note about the corrected figures.
- Update `docs/accessibility.md` Known Gaps table: remove or reclassify the fixed items.

### Step 2 — Fix the CSS bug
- In `style.css` lines 263 and 268: change `var(--brand-text-base)` to `var(--brand-text)`.

### Step 3 — Apply chosen alternates to `brand.css`
- Update the four failing tokens in the `[data-theme="light"]` block (lines 187–228 approx) and the `@media (prefers-color-scheme: light)` block (lines 257–272 approx).
- If Option C is chosen for light faint, consider removing the `--brand-text-faint` override in the light theme block and letting it fall back to `--brand-text-muted`, OR explicitly setting it to `--brand-text-muted`.

### Step 4 — Audit downstream consumers
- Search all `.html` files for inline styles or hardcoded hex values that override these tokens (e.g., `#7eb8ff`, `#B86E10` inline styles in project pages).
- Ensure no light-mode page uses the old failing hex values directly.

### Step 5 — Verify
- Run a browser-based contrast audit using WAVE, axe DevTools, or Lighthouse on the homepage and at least one project page in **both** themes.
- Check the print-media resume (`AveryEmberDay_Resume_2026_Brand.html`) to confirm its existing overrides still align with the new palette.

---

## 5. Files to Touch

| File | Change |
|---|---|
| `docs/accessibility.md` | Correct contrast tables for gold, neon, and faint tokens; update Known Gaps |
| `brand.css` | Update 2–4 hex values in the light-mode token block |
| `style.css` | Fix `var(--brand-text-base)` → `var(--brand-text)` |
| `TODO.md` | Mark "adjust color palette for contrast" complete after implementation |

---

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Changing light faint makes it indistinguishable from muted | Adopt Option C (reclassify) and remove the faint tier in light mode rather than darkening it |
| Deepening gold/neon changes brand feel in existing screenshots/marketing | Option A keeps the shift minimal; compare side-by-side in browser before committing |
| Resume print override (`#9a5c00`, `#007a8a`) no longer matches new brand tokens | Update resume inline overrides to match whichever Option B values are chosen |
| HTML pages with hardcoded light-mode colors (e.g., `#7eb8ff` on light bg) | Audit in Step 4; replace hardcoded values with theme-aware variables or ensure they only appear on dark backgrounds |

---

## 7. Decision Needed

Before implementation, confirm:

1. **Which option do you prefer for each failing token?** (A, B, or C — can mix and match)
2. **Do you want to keep a faint text tier in light mode at all,** or collapse it into `--brand-text-muted`?
3. **Should the resume print overrides be updated to match the new brand values,** or stay independent?

Once you choose the options, the implementation is scoped to fewer than 10 line changes across `brand.css`, `style.css`, and `docs/accessibility.md`.
