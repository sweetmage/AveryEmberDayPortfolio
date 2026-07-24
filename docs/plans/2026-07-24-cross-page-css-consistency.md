# Cross-page CSS consistency — Home vs Gallery (2026-07-24)

## Goal

Home (`app/page.tsx`) and Gallery (`app/gallery/page.tsx`) render titles, frames,
and text colors with two unrelated systems. Unify them on the newer
`PageHeader` language (display font + iridescent underline) and on brand tokens,
and rename the Gallery header from "Art Gallery" to "Gallery".

## Findings (current state)

| Concern | Home | Gallery |
|---|---|---|
| Section/page title | bare `<h2>About Me</h2>` → falls to `site.css` base `h2`: heading font, `1.1em`, UPPERCASE, `0.06em` tracking, `--brand-text-muted`, flat gray `border-bottom` | `PageHeader`: display font, `clamp(2rem,5vw,3rem)`, normal case, `--brand-text`, purple/cyan glow, `.brand-spectrum-bar` underline |
| Card frame | `.about-box`: `rounded-lg border border-line bg-surface-1 p-6 shadow-card` | `.gallery-item`: `rounded-sm bg-[#1c1c20]/80 p-4`, no border, no shadow |
| Body/caption color | `p` → `--brand-text-soft` (token) | `figcaption` → `text-white` (hardcoded) |

Two real defects fall out of this, not just drift:

1. `bg-[#1c1c20]/80` and `text-white` are hardcoded dark values. The site has a
   real light theme (`:root[data-theme="light"]`, plus a
   `prefers-color-scheme` no-JS fallback), so gallery cards render a dark slab
   with white text on the light off-white background.
2. `PageHeader`'s glow is an inline `text-shadow` tuned for dark only. The
   existing `.brand-glow-text` helper that would have handled both themes is
   keyed on `html.dark`, which this site never sets — it switches on
   `data-theme`. That helper is dead code.

`app/projects/{BrandProject,MistrustProject}.tsx` already hand-roll the same
title recipe at a smaller size (`clamp(1.5rem,3.5vw,2.25rem)`), so the shared
class should cover them too.

## Approach

Extract the title treatment into one `brand.css` component class instead of
repeating the utility soup, then point every title at it.

### 1. `brand.css` — new title primitives

- `.brand-page-title` — display font, `clamp(2rem,5vw,3rem)`, regular weight,
  `line-height: 1.1`, normal case/tracking, `--brand-text`, no border/padding,
  theme-aware glow (dark default + `data-theme="light"` and
  `prefers-color-scheme` light overrides).
- `.brand-page-title--section` — the smaller `clamp(1.5rem,3.5vw,2.25rem)` step
  for in-page section and project titles.
- `.brand-title-bar` — sizing modifier for `.brand-spectrum-bar` when used as a
  title underline (`height: 3px; margin-top: 0.75rem`). Declared after
  `.brand-spectrum-bar` in the same layer so the height wins.

### 2. `app/PageHeader.tsx`

Replace the inline utility string with `brand-page-title`, and the bar with
`brand-spectrum-bar brand-title-bar`. No visual change intended on Projects.

### 3. `app/page.tsx` (Home)

`<h2>About Me</h2>` → `brand-page-title brand-page-title--section` plus the
same spectrum underline, so the Home section title reads as the same family as
the Gallery/Projects page titles at one size step down.

### 4. `app/projects/BrandProject.tsx`, `MistrustProject.tsx`

Swap the duplicated inline recipe for `brand-page-title brand-page-title--section`,
keeping `project-title` (JS/scoping hook) and `mb-4`.

### 5. `app/gallery/page.tsx`

- Frame: `rounded-sm bg-[#1c1c20]/80` → `rounded-lg border border-line
  bg-surface-1 shadow-card`, matching `.about-box`. Keep `p-4` (art needs less
  inset than prose).
- Caption: `text-white` → `text-text-soft`, matching Home's prose token.
- Header rename: `PageHeader title`, the `sr-only` `<h1>`, and the page metadata
  `title` / `openGraph.title` all become "Gallery".

## Out of scope

- Legacy root-level `index.html`, `gallery/`, `projects/`, `style.css`,
  `brand.css`-adjacent static files are the pre-Next site; not touched.
- The now-mostly-unused `site.css` base `h2` rule stays for those legacy pages.
- `.brand-glow-text` dead-code removal (separate cleanup; not load-bearing).

## Verification

- `npm run build` (static export) succeeds.
- Visual check at wide + narrow in both themes: Home "About Me" and Gallery
  "Gallery" share font/color/underline; gallery cards match the About card's
  border/radius/shadow and stay readable in light theme.

## Risks

- Home's hero already has a full-bleed spectrum bar; the About underline sits a
  full section gap below it, but confirm visually that it doesn't read as a
  repeat.
- `.brand-title-bar` relies on source order inside the components layer — if
  `brand.css` is ever split, keep it after `.brand-spectrum-bar`.
