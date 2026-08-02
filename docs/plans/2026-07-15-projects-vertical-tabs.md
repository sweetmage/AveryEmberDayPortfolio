# Projects vertical tab rail + gallery back-link removal — 2026-07-15

**Status:** Complete — shipped to production 2026-07-22 (LOGBOOK Entries 079, 080).

**Goal:** (1) Projects page tabs become a vertical tab bar beside the content on large screens (user: "tabs need to be horizontal" = tab rail + panel side by side; clarified via structured question to "vertical tab bar"). (2) Remove the gallery page's "← Home" back link (redundant now that the nav has Home).

## Approach

- `app/projects/ProjectTabs.tsx`
  - Wrap tablist + panels in a `lg:flex` layout: tab rail `lg:w-52` sticky (`lg:top-16`, nav is 44px sticky) on the left, panels in a `lg:flex-1 lg:min-w-0` container.
  - Below `lg` (1024px) the current horizontal pill row on top is kept — a side rail at tablet/phone widths starves the slideshows/grids.
  - Tab buttons gain `lg:w-full lg:justify-start` (full-width rail entries, same brand-btn primary/secondary styling).
  - `aria-orientation` tracks the breakpoint via `matchMedia('(min-width: 1024px)')`; keyboard handler accepts both arrow axes (orientation is responsive).
- `app/gallery/page.tsx` — delete the back-link `<Link>` block and the now-unused `next/link` import.
- Docs: AGENTS.md stale lines (nav roster still says "Work + About only"; Deploy still says `publish = "."`) corrected to post-restructure reality.

## Out of scope

- The dirty Nav.tsx/Footer.tsx contact-link comment-outs (user-owned, Netlify-forms-gated).
- Tag filters, carousel polish (existing TODO threads).

## Verification

- `npm run build:next` green.
- Playwright suite (`npm test`) green; self-refreshing baseline captures restored to the committed set afterward (Entry 076 model), visual adjudication via fresh scratchpad captures instead.
- Screenshots of built site at 1440/1024/768/390: rail beside content at ≥1024, pills on top below, keyboard + hash deep-link behavior intact, gallery has no back link.
- Pro nano-agent shippability review; main-agent final diff review.

## Risks

- Sticky rail overlapping the lightbox: lightbox is `position: fixed` overlay at page level — unaffected.
- Slideshow/lightbox JS queries by class at document level; extra wrapper div around panels is inert to it.
