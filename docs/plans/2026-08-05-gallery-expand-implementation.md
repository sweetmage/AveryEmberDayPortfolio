# Gallery expand-on-click — implementation plan (Track B)

**Status:** complete, 2026-08-05 — shipped in LOGBOOK Entry 118. Two things changed during the build:
the scroll-into-view approach (`scrollIntoView({ block: 'nearest' })` was wrong for a card taller than
the viewport, found by the capture pass, replaced with an explicit condition) and `align-self: start`
on the expanded card. The §4 entrance stagger was deliberately not built; the reason is in `TODO.md`.
**Concept doc (the spec):** [`2026-08-01-gallery-expand-motion-concept.md`](./2026-08-01-gallery-expand-motion-concept.md)
**Branch:** `develop` (deploy pause until Aug 7 — commit only, never push `portfoliowebsite`)
**Execution target:** all commands run in the agent's own shell (Windows PowerShell on AVERYBOT).

This plan turns the concept into concrete file changes. Where it makes a call the concept left open,
the call and its reason are stated here rather than discovered in the diff.

---

## Goal

A gallery card is a quiet tile that becomes a spread. Click it and it claims two columns and two rows,
the art grows, the description arrives, and the rest of the grid steps aside. No lightbox, no
navigation, no loss of place.

**Done when:** the motion-enabled spec is green, the visual gate is green twice, content-width
measurement exits 0, the bubble spec is still green, and a manual pass at 360/768/1440/2560 in both
themes plus one forced-reduced-motion run shows no defects.

---

## Decisions this plan makes

### D1 — The expanded card spans 2 columns **and 2 rows**

The concept flagged the real hazard: at `xl` the companion tile beside an expanded card must not
stretch to match it, or the expand reads as "everything got huge". That hazard is worse than the
concept knew, because the grid carries `md:auto-rows-[1fr]`. In an auto-height grid, `1fr` row tracks
all resolve to the tallest row's content — so a card that merely got taller would drag **every row in
the gallery** to its new height.

`grid-column: span 2` + `grid-row: span 2` solves it without touching `auto-rows`. Row tracks stay
uniform at height `H`; the expanded card occupies a 2×2 block (`2H` plus one gap of growth); every
other card keeps its natural `H`. The neighbour does not stretch because it was never in the same
track as the thing that grew.

Both spans are scoped to `@media (min-width: 768px)`. Below `md` the grid is one column, and
`grid-column: span 2` there would create an implicit second column and break the layout outright.
Below `md` the expand is height-only, exactly as the concept's breakpoint table says.

### D2 — The toggle is one overlay `<button>` covering the card

The concept requires a real `<button>` with `aria-expanded`, and separately requires that clicking
anywhere on the card toggles it. Those two are only compatible one way: a transparent button
absolutely positioned over the whole card, carrying the accessible name and the ARIA state.

- `<figcaption>` must stay a direct child of `<figure>`, so it cannot live inside the button.
- Nothing else inside the card is interactive, so there is no nested-interactive violation. **That is a
  standing constraint, not an observation:** adding any link or control inside the card later would
  nest it inside this button. The spec asserts the card contains exactly one interactive element.
- `.gallery-item` **stays on the `<figure>`**, unmoved and unrenamed. See R1.

**The focus ring must be inset.** `.brand-frame` sets `overflow: hidden` (`brand.css:1345`), and a
normal outline is painted *outside* the element box, so a ring at the default offset on a button
covering the full card is clipped away by the frame — an invisible focus indicator on the only
interactive element on the page. The ring therefore uses `outline-offset: -3px`, drawing just inside
the rounded frame where nothing clips it. The 2px `var(--brand-accent)` half of the site-wide
focus-visible contract is unchanged. Do **not** solve this by removing `overflow: hidden` — that is
what keeps the artwork inside the frame's radius.

### D2a — Expanded state is driven by `data-expanded` on the `<figure>`

One attribute, read by every rule that changes: the 2×2 span, the art cap, and the description
clamp/reveal. Concretely:

| Thing | Collapsed | Expanded |
|---|---|---|
| Art height cap | `max-h-[70vh]` (unchanged from today) | `calc(100dvh - var(--brand-nav-height))` |
| Description | `line-clamp: 1` — **visual only**, the full string stays in the DOM for assistive tech, per the concept's §5 | `line-clamp: none` |
| Grid span | `span 1` | `span 2 / span 2` at `md+`, height-only below |

### D3 — Missing copy degrades, it does not placehold

All 11 `description` values are `''` and stay that way — Track A/C is the user's copy pass. The
description block renders only when the string is non-empty, and `aria-controls` is only emitted when
there is a panel to control. Until the copy lands, expanding grows the art; when the copy lands the
text arrives with no further code change. Shipping lorem ipsum into `gallery-data.ts` would be a lie
in the data file that someone eventually publishes.

### D4 — `view-transition-name` is derived from the item's index in the **full** item list

**A deliberate divergence from the concept's §2**, which says to derive the name from `item.src`.
Position-derived names would make a card that moves from slot 5 to slot 2 during a filter read as two
different elements and cross-fade instead of travelling, which is the one filter behaviour worth
having — and a `src`-derived slug buys the same stability while being unreadable in devtools and
awkward to target from CSS. Full-list index is stable for the life of the item and yields static,
predictable names (`vt-gal-0` … `vt-gal-10`) that the stagger rules in §4 can target. Applied as an
inline style, not a CSS class, so there are no per-index rules to keep in sync.

Names must be unique or the transition silently does nothing, so the spec asserts uniqueness rather
than trusting the derivation.

### D7 — The manual `startViewTransition` pattern, and why not React's

React 19 has a `<ViewTransition>` component that wraps this API and whose docs say never to call
`document.startViewTransition` yourself. It is **not usable here**: `<ViewTransition>` ships in React's
experimental channel only, and this project pins stable `react: ^19.0.0`, which does not export it. The
manual pattern is therefore the only one available, not a legacy choice.

Recorded as a migration risk: if this repo ever moves to the experimental channel or React ships
`<ViewTransition>` stable, this handler must be refactored, because a manual call plus React's own
would interrupt each other.

Two mechanics the handler depends on:

- **`flushSync`** so the DOM is updated before the post-snapshot is taken. Without it React batches and
  the transition captures two identical frames — no animation, no error (R5).
- **The next state is computed *before* the callback and set absolutely**, never with a toggle updater.
  If `startViewTransition` throws (a transition already running) the fallback path runs the same
  updater, and an absolute set is idempotent where a toggle would flip straight back.

### D8 — Collapse-on-filter happens inside the *same* view transition

And only when the open card no longer matches the new filter, per the concept's §4 — a card that
survives its filter stays open and travels to its new position. Collapsing in a separate transition
would either double-animate or jump. One `startViewTransition` call captures one before/after pair and
animates the collapse and the reflow together.

### D9 — Escape is a document-level listener

Bound only while a card is open. A `onKeyDown` on the button would only fire while the button holds
focus, so Escape would do nothing after the user clicks the card and then moves the mouse — which is
the common case.

### D5 — Art cap subtracts the nav

`max-height: calc(100dvh - var(--brand-nav-height))`, per the concept's own recommendation. The nav is
sticky and overlays the top of the page, so a literal `100dvh` image is always partly underneath it and
"never exceeds one screen" would be false. `dvh`, not `vh`, so mobile browser chrome is handled.

### D6 — Q-M2 (deep-linkable `#piece=…`) is **not** in this track

It is listed in the concept as an open question, not a requirement, and it collides with the existing
`#filter=` hash writer. Deferred to a future milestone, recorded in `TODO.md` with that reason.

---

## Files to touch

| File | Change |
|---|---|
| `app/gallery/GalleryGrid.tsx` | Expand state, the overlay toggle, `startViewTransition` wrapper, Escape handler, scroll-into-view, caption → `<h3>`, description panel |
| `brand.css` | `--brand-transition-layout` token, `.gallery-item` expanded rules, art cap, description clamp/reveal, view-transition keyframes + stagger |
| `tests/gallery-expand.spec.js` (new) | Motion-enabled spec, `mode: 'serial'` |
| `style.css` | Rebuilt via `npm run css:build` (tracked artifact — commit it) |
| `TODO.md`, `LOGBOOK.md`, `docs/plans/README.md` | Documentation |

**Not touched:** `gallery-data.ts` (D3), `public/scripts/bubbles.js` (R1 — `.gallery-item` already
listed and stays), `playwright.config.js` (R2).

---

## Steps

1. **`brand.css` tokens and card rules.** `--brand-transition-layout: 320ms cubic-bezier(0.2,0,0,1)`
   beside the two existing transition tokens. `.gallery-item` expanded state: the `md+` 2×2 span, the
   art cap, the description clamp (collapsed) and reveal (expanded), the overlay-button reset and its
   focus ring.
2. **`GalleryGrid.tsx` structure.** Caption `<div>` → `<h3>` keeping identical typography classes.
   Add the overlay button, the description panel, `aria-expanded`/`aria-controls`, `data-expanded` on
   the `<figure>`, and the per-card `view-transition-name` style.
3. **`GalleryGrid.tsx` behaviour.** `expandedSrc` state; toggle wrapped in `startViewTransition` +
   `flushSync`; reduced-motion and no-API paths call the updater directly; Escape collapses; expanding
   scrolls the card into view (`smooth`, or `auto` under reduced motion); a filter change collapses an
   open card first.
4. **View-transition CSS.** Group tween on `--brand-transition-layout`; leave = fade + scale `0.96` at
   140ms; enter = fade up from `0.96` staggered 25ms by index; a `prefers-reduced-motion` block that
   kills every view-transition animation as a second line of defence behind the JS bypass.
5. **`tests/gallery-expand.spec.js`.** See Verification.
6. **`npm run css:build`**, then the full verification pass, then docs.

---

## Parallel tracks

This work is **deliberately sequential**. The three candidate splits (CSS, component, spec) all read
and write the same contract — the class names, the `data-expanded` attribute and the DOM shape — and a
split would mean two agents inventing that contract twice. The spec cannot be written before the
structure it asserts on exists. Steps 1-3 are one coupled edit by the main agent; step 5 follows it.

The reviews are the parallel part: plan review and shippability review both go to helper agents while
the main agent holds correctness.

---

## Risks and the traps this repo has already hit

- **R1 — `.gallery-item` is a bubble exclusion selector** (`bubbles.js` `DEFAULT_EXCLUSIONS`, line 82).
  It matches by selector, so retagging the card silently drops it out of the physics zones with no
  error and nothing red in the suite. This has happened three times (hero logo, Projects rail, Contact
  form). **Mitigation:** the class stays on the same `<figure>`, and the new spec asserts
  `allRegisteredAsZones('.gallery-item')` so a future rename fails loudly.
- **R2 — the visual gate is blind to all of this.** It captures under `prefers-reduced-motion`, where
  every animation here is disabled by design. That is why a motion-enabled spec is mandatory. It runs
  `test.describe.configure({ mode: 'serial' })` for the same reason `bubbles-exclusion.spec.js` does.
  It does **not** get its own Playwright project — that split was tried on 2026-08-03 and reverted
  (Entry 115); contention was never the real cause there and the isolation bought nothing.
- **R3 — baseline movement is a signal, not a chore.** The collapsed card is meant to look
  byte-identical: the `<h3>` swap keeps the same classes and the overlay button is transparent. If the
  40 visual snapshots move at all, read the diff before updating anything.
- **R4 — `grid-column: span 2` below `md`** creates an implicit column and breaks the grid. Scoped
  behind a media query (D1).
- **R5 — `flushSync` inside `startViewTransition`** is required for the DOM to be updated before the
  post-snapshot is taken. Without it React batches the update and the transition captures two
  identical frames, producing no animation and no error.
- **R6 — `style.css` must be rebuilt and committed** after any class change, and three consecutive
  builds must be byte-identical.
- **R7 — the expanded card must not overflow its 2-row cell.** The cell is a fixed `2H + gap`; art plus
  caption plus description could exceed it, and `.brand-frame`'s `overflow: hidden` would clip the
  text rather than spill it. What prevents this is the card's existing flex column: the `<img>` carries
  `flex-1 min-h-0 object-contain`, so it *shrinks* to whatever the caption and description leave, and
  the art cap is an upper bound rather than a floor. Only load-bearing once real descriptions exist —
  re-check when the copy pass lands.
- **R8 — `sizes` must widen with the card.** The collapsed `sizes` tops out at `46vw`, so an expanded
  card at `md` would display a ~46vw-chosen rung stretched across ~92vw. Expanded cards use `92vw`,
  which over-requests slightly at `xl` — the safe direction.
- **R9 — `aria-expanded` without `aria-controls`.** Until the copy lands there is no panel, so
  `aria-controls` is omitted. `aria-expanded` stays: the button expands *itself*, and the art growing
  is a real state change worth announcing.

---

## Verification

| Check | Command / method |
|---|---|
| Motion spec | `npx playwright test gallery-expand` |
| Full suite, twice | `npm test` — 73 existing + the new cases |
| Content geometry | `node scripts/measure-content-widths.js` (exit 0) |
| Bubble zones intact | `npx playwright test bubbles-exclusion` |
| Types | `npx tsc --noEmit` |
| CSS artifact | `npm run css:build`, diff scoped to the change |
| Manual | 360 / 768 / 1440 / 2560, both themes, plus one reduced-motion run |
| Art cap | Short viewport (1440×720) — expanded art fits one screen under the nav |

**The new spec asserts:**

1. `aria-expanded` flips on click.
2. The card's measured box grows in **both** axes.
3. Expanding a second card collapses the first.
4. Escape collapses, with focus anywhere on the page (D9).
5. The reduced-motion path changes state without animating.
6. Changing the filter collapses an open card that no longer matches, and leaves one that still
   matches open (D8).
7. `.gallery-item` is still a registered bubble exclusion zone (R1).
8. Every card's `view-transition-name` is unique (D4).
9. Focus is still on the overlay button after both expand and collapse.
10. The focus ring is inset and therefore not clipped — `outline-offset` computes negative while the
    button holds focus (D2).
11. Expanded art never exceeds `viewport height − nav height` (D5), asserted at a short viewport
    rather than left to the manual pass.
12. The card contains exactly one interactive element, so the overlay button can never end up
    wrapping another control (D2).
