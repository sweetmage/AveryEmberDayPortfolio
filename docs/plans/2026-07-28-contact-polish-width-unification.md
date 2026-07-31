# Plan — Contact page polish + site-wide content width unification

**Date:** 2026-07-28
**Branch:** `develop` (deploy pause until 2026-08-06 — commit here, do not push `portfoliowebsite`)
**Status:** shipped 2026-07-28 (LOGBOOK Entry 107; committed 2026-07-31)

## Goal

Six items from the user, in one pass:

1. Delete the scratch `public/alt-review.html`. **(done)**
2. Fix the hydration error from the theme-init `<Script>` placement.
3. Add bubble-repel (exclusion) coverage to the Contact page.
4. Unify content widths so every section shares one left/right edge at every viewport.
5. Remove the duplicate social links from Contact (already in the footer).
6. Redesign the Send button.

## Measured starting state (2026-07-28)

Rendered left edge / width of the main content block, dev server, `tmp/measure-widths.js`:

| Surface | 768 | 1024 | 1440 | 2560 | 3440 |
|---|---|---|---|---|---|
| Projects / Gallery title | 24 | 24 | **44** | **604** | **1044** |
| Contact `<h1>` | 24 | 24 | **144** | **704** | **1144** |
| Home About box | 69 | 88 | **208** | **768** | **1208** |

Three different edges from 1440px up, diverging further as the viewport grows. Causes:

- **Three max-widths.** `--brand-content-max` is 1200px (`brand.css:95`) and drives the global
  `main` cap (`src/css/site.css:104-109`), `.brand-container` (`brand.css:547`), Contact, and
  `/contact/thanks/`. Projects and Gallery hardcode `max-w-[1400px]` in three places
  (`app/PageHeader.tsx:14`, `app/projects/ProjectTabs.tsx:95`, `app/gallery/GalleryGrid.tsx:83`)
  and opt their `<main>` out of the global cap.
- **Three gutter systems.** `main` uses `clamp(16px,4vw,40px)`, `.brand-container` uses
  `clamp(20px,5vw,48px)`, Projects/Gallery use a flat `px-6` (24px).
- **Compounding nesting on Home.** About sits inside `<main>` (1200 + 40px) *and*
  `.brand-container` (1200 + 48px), so its gutters add: 120 + 40 + 48 = 208px at 1440.

There is also a fourth tier: the Gallery grid caps at `max-w-[900px]` below `lg`
(`app/gallery/GalleryGrid.tsx:130`). It only binds in the 900-1023px band. Out of scope; noted.

## Decisions (user, 2026-07-28)

- **Align edges, cap the reading measure.** Containers and headings share one edge at all widths;
  prose and form fields stop at a readable measure inside. Chosen over stretching body copy to
  1352px (~180 characters per line, roughly double a comfortable measure) and over a two-column
  Contact redesign.
- **Send button: spectrum underline on hover/focus.** Reuses the spectrum treatment already under
  the nav and page titles rather than inventing a new button language.

## Approach

### One geometry, one token

Adopt the Entry 100 recipe everywhere: **the outer container carries the max-width and no
horizontal padding; children supply a flat 24px gutter.** That is what makes edges line up —
compounding padding is the current bug.

- `brand.css:95` — `--brand-content-max: 1200px` → **1400px**.
- `src/css/site.css:104-109` — `main` keeps `max-width: var(--brand-content-max)` and
  `margin: 0 auto`, but **`padding: 0`**. This is the fix for the compounding gutters; every page
  either supplies its own `px-6` or nests a `.brand-container` that does.
- `brand.css:547` — `.brand-container` padding → flat **`0 24px`**.
- Replace the three hardcoded `max-w-[1400px]` with `max-w-(--brand-content-max)` so there is a
  single source of truth.

Expected result: left edge **44px at 1440**, **604 at 2560**, **1044 at 3440** on *every* page.

`.brand-nav` overrides `.brand-container` with `max-width: none` (`brand.css:595`) and is
unaffected. The footer picks up the new width and aligns with page content — intended.

### Readable measure inside the aligned container

- `.about-box` — cap the prose at a readable measure, left-aligned so its left edge still matches
  the `About Me` heading and the Projects title.
- Contact form — currently `mx-auto max-w-[600px]`, which floats it centre-of-page and off the
  h1's edge. Left-align it and widen slightly (600 → 720) per "widen slightly on wider screens".
- Contact intro `<p>` already caps at 560px; leave it.

### Contact page

- **Remove `ConnectLinks`** and its now-unused import — duplicated in the footer.
- **Bubble exclusion.** `h1`, `p`, and `.brand-btn` are already covered by `DEFAULT_EXCLUSIONS`
  (`scripts/bubbles.js:59-102`), but the **form is not** — nothing matches `form`, `input`,
  `textarea`, or `label`. Add the semantic `.bubble-exclude` marker to the `<form>`; it is one
  box covering every field. Same for `/contact/thanks/`, whose `<h1>`/`<p>` are covered but which
  should be checked for gaps.
- Edit `scripts/bubbles.js` **and copy to `public/scripts/bubbles.js`** — the latter is the copy
  the export serves, and they drift silently.

### Send button

- New `.brand-btn-spectrum` modifier in `brand.css`: solid accent at rest, spectrum sweep on the
  bottom edge on hover/focus-visible, reusing the existing `--brand-ir-*` ramp.
- **Fix `.brand-btn:focus-visible` (`brand.css:1071-1074`) to `--brand-accent`.** It is the only
  focus rule in the file still on `--brand-border-focus` — `rgba(255,255,255,0.24)` in dark, a
  nearly invisible ring — while `#theme-toggle` (`:275`), `.brand-nav-logo` (`:647`),
  `.project-tab` (`:825`) and `.brand-chip` (`:1299`) all use the accent. AGENTS.md documents the
  accent as the contract. This affects every `.brand-btn` on the site, not just Send.
- Any new animation gets a `prefers-reduced-motion` path.

### Hydration fix

`app/layout.tsx:26-29` renders `<Script strategy="beforeInteractive">` as a direct child of
`<html>`, outside `<head>`. React logs *"Cannot render a sync or defer `<script>` outside the main
document"* plus a hydration error on every load. Move it inside `<body>`; `beforeInteractive` still
hoists it into `<head>` during SSR.

**CSP is not a blocker.** `netlify.toml:44` is `script-src 'self' 'unsafe-inline'` — no pinned
sha256 hashes, and `theme-init.js` is an external file anyway. AGENTS.md's claim that the CSP pins
inline theme-script hashes is **stale and should be corrected**.

Verify no theme flash on hard reload in both themes after the move.

## Verification

| Check | Method | Gate |
|---|---|---|
| Edge alignment | `tmp/measure-widths.js` at 768/1024/1440/2560/3440 | identical left edge + right inset per viewport across all pages |
| No h-scroll | `documentElement.scrollWidth === clientWidth` | equal at 360px |
| Reading measure | measure `.about-box` and form field width | prose under ~75ch |
| Bubble exclusion | `tests/bubbles-exclusion.spec.js` + a new contact-form case | green; zero frames overlapping the form |
| Focus ring | tab through Send + secondary buttons | 2px `--brand-accent`, both themes |
| Hydration | dev console on `/` | no hydration error, no theme flash |
| Reduced motion | spectrum sweep under `prefers-reduced-motion` | no animation |
| Suite | `npm test` | green twice in a row after re-baseline |

## Risks

1. **Every page re-baselines again.** Width changes touch all 5 pages plus the footer. Same
   procedure: run red first, confirm each failure is intended, then update, then green twice.
2. **`main { padding: 0 }` is a global change.** Any page relying on the implicit gutter loses it.
   Contact/thanks carry `px-6`; Projects/Gallery opt out entirely; Home nests `.brand-container`.
   The legacy root `index.html` also links the built `style.css` — it is not deployed, but check
   the diff is limited to the intended rules.
3. **Widening the footer** changes a surface the user did not explicitly ask about. It is required
   for "all the same width" to be true, but flag it.
4. **Bubble exclusions are matched by selector**, so `.bubble-exclude` on the form must survive any
   later retag — the documented trap that has already bitten twice (hero logo, Projects rail). Add
   a spec case rather than trusting the class to stay.
5. **`--brand-content-max` is consumed in more places than the survey covered.** Grep the full repo
   before changing the token, including `app.css`, `src/css/**` and the legacy pages.
