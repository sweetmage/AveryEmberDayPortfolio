# Plan: Gallery Tag System

**Date:** 2026-07-24
**Status:** Approved — user decisions applied, implementation started
**Plan type:** Nanoagent plan (estimated 2–3 nano-agent iterations for implementation)

## User Decisions (applied 2026-07-24)

1. **Production tags only** — no Tools facet. The filter is a single-select bar.
2. **Filter buttons:** `All | Digital | Traditional | Both`. Hybrid works show under "Both" only; "Digital" and "Traditional" are inclusive (show anything containing that tag).
3. **Card display:** each piece shows its tags as small non-interactive pills below the title. Hybrid pieces display both "Traditional" and "Digital".
4. **"Photography, Digital" → "Digital"** — In Danger gets the "Digital" tag only.
5. **Description field** added to the data model now (empty strings), but **not rendered yet** — user will fill descriptions later and ask for UI inclusion.
6. **Tag typeface:** `font-body` (Inter), per the user's 2026-07-24 decision.

## Data Model

```ts
// app/gallery/gallery-data.ts
export interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  tags: string[];           // e.g. ["Traditional", "Digital"]
  description: string;      // empty for now; user fills later
}

export const galleryItems: GalleryItem[] = [
  { src: '/images/myart/Gallery/SelfPortraitSeries/Self Portrait Series - In Danger - Final.webp', alt: 'In Danger', caption: 'In Danger', width: 1200, height: 1600, tags: ['Digital'], description: '' },
  { src: '/images/myart/Gallery/chillFinal.webp', alt: 'Chill', caption: 'Chill', width: 1200, height: 1970, tags: ['Traditional', 'Digital'], description: '' },
  { src: '/images/myart/Gallery/grossFinal.webp', alt: 'Gross', caption: 'Gross', width: 1200, height: 1481, tags: ['Traditional', 'Digital'], description: '' },
  { src: '/images/myart/Gallery/EmergenceFinal.webp', alt: 'Emergence', caption: 'Emergence', width: 1200, height: 1600, tags: ['Digital'], description: '' },
  { src: '/images/myart/Gallery/FacesFinal.webp', alt: 'Faces', caption: 'Faces', width: 1200, height: 1556, tags: ['Traditional'], description: '' },
  { src: '/images/myart/Gallery/lollypopFinal.webp', alt: 'Lollipop', caption: 'Lollipop', width: 1200, height: 1559, tags: ['Traditional'], description: '' },
  { src: '/images/myart/Gallery/overflowFinal.webp', alt: 'Overflow', caption: 'Overflow', width: 1200, height: 1643, tags: ['Traditional', 'Digital'], description: '' },
  { src: '/images/myart/Gallery/stairsFinal.webp', alt: 'Stairs', caption: 'Stairs', width: 1200, height: 1953, tags: ['Traditional', 'Digital'], description: '' },
  { src: '/images/myart/Gallery/beheadedFinal.webp', alt: 'Beheaded', caption: 'Beheaded', width: 1200, height: 1571, tags: ['Traditional', 'Digital'], description: '' },
  { src: '/images/myart/Gallery/ShadowFinal.webp', alt: 'Shadow', caption: 'Shadow', width: 1200, height: 1440, tags: ['Traditional'], description: '' },
  { src: '/images/myart/Gallery/txlakelandscapeFinal.webp', alt: 'TX Lake Landscape', caption: 'TX Lake Landscape', width: 1200, height: 1011, tags: ['Traditional', 'Digital'], description: '' },
];
```

## Architecture

### Server / client split

`app/gallery/page.tsx` stays a server component (exports `metadata`). It imports a new `'use client'` `GalleryGrid` component, matching the Projects precedent.

### GalleryGrid.tsx (`'use client'`)

- State: `activeFilter: 'all' | 'digital' | 'traditional' | 'both'`.
- `filteredItems` derived via `useMemo`:
  - `'all'` → all items
  - `'digital'` → tags.includes('Digital')
  - `'traditional'` → tags.includes('Traditional')
  - `'both'` → tags.includes('Digital') && tags.includes('Traditional')
- URL sync: `history.replaceState` updates hash (`#filter=digital` etc.) on change; reads hash on mount.
- Renders filter bar above the grid + filtered grid.

### Filter UI layout

**Filter bar** (single-select, `aria-pressed` toggle buttons):
- Horizontal row: `All | Digital | Traditional | Both`
- Positioned inside the same `<section>` as the grid, sharing its `max-w` container and gutters.
- At 360px: 4 buttons total ~238px → fits in ~328px usable width without wrapping.
- Uses `.brand-chip` styled `<button>` elements with `[data-pressed="true"]` for the active state.

### Card tags

Each `figcaption` renders:
1. Title (existing heading font treatment)
2. Tag row: flex wrap of `<span className="brand-chip">` for each tag in `item.tags`

Tags are non-interactive labels, so they use `<span>` (no `aria-pressed`). They share the `.brand-chip` visual base but never get the `[data-pressed="true"]` state.

### CSS / brand system

New in `brand.css` (repo root):
- `.brand-chip` — small pill: `display:inline-flex`, `align-items:center`, `padding: 0.25rem 0.75rem`, `border-radius: 9999px`, `font-size: 0.875rem`, `font-family: var(--brand-font-body)`, `border: 1px solid var(--brand-border)`, `background: transparent`, `color: var(--brand-text-soft)`.
- `.brand-chip[data-pressed="true"]` — active filter state: `background: var(--brand-accent-dim)`, `color: var(--brand-text)`, `border-color: var(--brand-accent)`.
- `.brand-chip:hover` — `background: var(--brand-surface-3)` (applies to buttons only; spans ignore hover).
- `.brand-chip:focus-visible` — `outline: 2px solid var(--brand-accent); outline-offset: 2px;`.
- `.brand-chip-group` — `display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center;`.

No new tokens needed.

### Accessibility

- **Filter bar:** `aria-pressed` on each `<button>`. Exactly one pressed at a time. Group labelled via visible text or `aria-label`.
- **Live region:** `aria-live="polite"` announcing result count ("Showing 8 of 11 works").
- **Reduced motion:** no animations; items appear/disappear instantly.

### Bubble engine / exclusion zones

- Filter bar container carries `.bubble-exclude` (already in `DEFAULT_EXCLUSIONS`).
- Add gallery filter-bar case to `tests/bubbles-exclusion.spec.js` at 768px and 1440px.
- Trap warning: `scripts/bubbles.js` is duplicated to `public/scripts/bubbles.js`; keep both in sync.

## Parallel Tracks

| Track | Goal | Files | Dependencies | Verification |
|---|---|---|---|---|
| A. Data model | Create `gallery-data.ts` with tags + descriptions | `app/gallery/gallery-data.ts`, `app/gallery/page.tsx` | None | `npx next build` |
| B. CSS tokens | Add `.brand-chip` / `.brand-chip-group` to `brand.css` | `brand.css` (repo root) | None | `npm run css:build`, rules present |
| C. Client grid | Write `GalleryGrid.tsx` with filter state, URL sync, card tags | `app/gallery/GalleryGrid.tsx`, `app/gallery/page.tsx` | Track A + B | Functional: filters, hash, 0-results, card tags visible |
| D. Bubble exclusion | Add gallery bubble test | `tests/bubbles-exclusion.spec.js` | Track C | `npm test -- bubbles-exclusion` |
| E. Visual gate | Re-baseline gallery snapshots | `tests/visual-baseline.spec.js-snapshots/` | Track C + D | `npm test` green twice |

**Execution order:** A + B parallel → C → D → E.

## Milestones

### Milestone 1: Data model + CSS primitives (Tracks A + B)

1. Create `app/gallery/gallery-data.ts` with typed `GalleryItem` array and export.
2. Update `app/gallery/page.tsx` to import from new module.
3. Add `.brand-chip`, `[data-pressed="true"]`, `:hover`, `:focus-visible`, `.brand-chip-group` to `brand.css`.
4. Run `npm run css:build`.
5. Run `npx next build` — clean.

**Acceptance:** build clean, gallery page visually unchanged (no filter bar yet).

### Milestone 2: Client filter component (Track C)

1. Create `app/gallery/GalleryGrid.tsx` (`'use client'`).
2. State: `activeFilter` with `useMemo` derived `filteredItems`.
3. Hash read/write for URL sync.
4. Render filter bar (4 buttons) + grid with card tags.
5. 0-results state.
6. `aria-live="polite"` count.
7. `.bubble-exclude` on filter bar container.
8. Wire into `page.tsx`.
9. Build + manual verification at 360/768/1024/1440/2560/3440.

**Acceptance:** filters work, hash syncs, card tags render, 0-results state works, no console errors.

### Milestone 3: Bubble exclusion + test (Track D)

1. Add gallery filter-bar case to `tests/bubbles-exclusion.spec.js`.
2. Run `npm test -- bubbles-exclusion` — green.

### Milestone 4: Visual baseline regeneration (Track E)

1. Run `npx playwright test --update-snapshots`.
2. Adjudicate baselines.
3. Run full suite twice — green both times.

## Verification

| Check | Command / Method | Gate |
|---|---|---|
| Build | `npx next build` | Clean (8/8 pages) |
| Functional | Manual browser test at 360/768/1024/1440/2560/3440 | Filters toggle, hash syncs, card tags visible, 0-results works |
| Accessibility | axe DevTools + screen-reader probe | No violations; result count announced |
| Bubble exclusion | `npm test -- bubbles-exclusion` | Pass |
| Visual regression | `npx playwright test` (full suite, twice) | 51/51 green, snapshot count stable |
| Responsive | Playwright captures at all breakpoints | No overflow; filter bar fits at 360px |

## Risks

| Risk | Mitigation |
|---|---|
| **Bulk snapshot update skips** | Per AGENTS.md: update, run full suite twice; re-update individual tests if needed. |
| **Bubble exclusion silent drop** | Use `.bubble-exclude` (already in `DEFAULT_EXCLUSIONS`) + structural bubble spec. |
| **Hash-based URL sync** | Client-only; safe for static export. |
| **Card tag vertical space** | Tag row adds ~28px per card. At 360px single-column, total page height increases ~308px (11 items). Acceptable. |
| **Description field not rendered** | User explicitly deferred; field is in data model but not referenced in JSX. |

## Out of Scope

- Tools facet (multi-select chips) — deferred by user decision.
- Animated filter transitions — deferred to respect `prefers-reduced-motion`.
- Description rendering — user will fill descriptions and ask for UI inclusion separately.
- Projects-page tag system.

## Next Step

Implement Milestone 1 (Tracks A + B in parallel), then Milestone 2 (Track C).
