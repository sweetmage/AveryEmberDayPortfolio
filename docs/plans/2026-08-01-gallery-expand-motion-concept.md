# Gallery expand-on-click — visual & motion concept

**Status:** concept, not started (user direction 2026-08-01 — plan only)
**Companion to:** [`2026-08-01-copy-pass-and-gallery-descriptions.md`](./2026-08-01-copy-pass-and-gallery-descriptions.md)
**Scope:** `app/gallery/GalleryGrid.tsx`, `brand.css` (or a new `gallery.css`), one new motion-enabled spec

The concept: a gallery card is a **quiet tile that becomes a spread**. Collapsed, it is art plus a
title plus a single teasing line. Clicked, it claims more of the row, the art gets bigger, the
writing arrives, and the rest of the grid steps aside rather than being covered up.

The whole point of expanding in place rather than opening a lightbox is that **the grid never goes
away** — you stay where you are, the page reorganises around your attention. That has to be
*legible*, which is a motion problem, not a layout problem.

---

## 1. The interaction

| State | What is on the card |
|---|---|
| **Collapsed** (default) | Square art, title (an `<h3>`), tools line, and a **one-line** description preview, clipped with an ellipsis |
| **Expanded** | Same card, wider and taller: larger art, full description, title and tools unchanged in place |

- **One card open at a time.** Opening a second collapses the first. Multiple open cards turn the
  grid into a ragged column and destroy the scan-ability the gallery exists for.
- **Click anywhere on the card** toggles it. **Escape** collapses.
- The expanded card keeps its position in the grid order. The grid continues below it, as asked.

### Width behaviour per breakpoint

"Expands width-wise" only means something where there is more than one column, so state it explicitly
or it reads as broken on a phone:

| Breakpoint | Columns | Expanded span |
|---|---|---|
| `< md` | 1 | Already full width — **height only** |
| `md → xl` | 2 | Span 2 (full row) |
| `xl+` | 3 | **Span 2 of 3** (decided 2026-08-01) |

At `xl`, spanning 2 leaves one companion tile beside the expanded card, so the grid keeps its energy
rather than switching into a different mode.

**Consequence to design for:** at `xl` the companion tile sits beside a card that is now much taller.
Whatever the row-sizing rules end up being, that neighbour must not stretch to match — it should stay
its natural size and let the row grow around it, or the "expand" reads as "everything got huge".

---

## 2. The hard part, up front

**CSS Grid does not animate span changes, and it does not tween siblings into their new positions.**
Change `grid-column: span 1` to `span 2` and every affected card *teleports*. That single fact drives
the whole implementation choice, and it is the thing most likely to eat a day if it is discovered
during the build instead of now.

**Recommended: the View Transitions API.** `document.startViewTransition(() => setState(...))`
snapshots the grid before and after and tweens the difference — including every sibling that moved —
for roughly the cost of wrapping the state update. It also solves the filter animation (§4) with the
same mechanism, which is the real argument for it: one primitive, two features.

- Give each card a stable `view-transition-name` derived from `item.src`.
- Where the API is missing, the state change simply applies instantly. The feature still works; it
  just is not animated. That is an acceptable floor and needs no second code path.
- **Reduced motion must bypass `startViewTransition` entirely** and call the update directly — a view
  transition animates by default, so honouring the preference is opt-*out*, not opt-in.

**Fallback if that floor is judged too plain: FLIP.** Measure every card's
`getBoundingClientRect()` before the change, apply the change, measure again, set inverting
transforms, then animate them to identity with the Web Animations API. Works everywhere, but it is
materially more code and has real edge cases (images finishing decode mid-measure, scroll position
shifting between the two measurements). Only reach for it if the no-animation fallback is
unacceptable.

---

## 3. Choreography of the expand

The card drives; everything else reacts. Rough timings, to be tuned against the real thing:

1. **Siblings displace** — the cards after the expanding one move to their new positions. Slightly
   *shorter* duration than the card's own growth, so the grid feels like it is yielding to the card
   rather than dragging it.
2. **The card grows** — width and height together, `~320ms`, decelerating
   (`cubic-bezier(0.2, 0, 0, 1)`). Arriving content should slow into place, not coast to a stop.
3. **The art scales up** inside the growing card, on the same curve, so the image and its frame feel
   like one object rather than an image being stretched by a box.
4. **The description arrives last**, fading in on a ~60ms delay. If it fades simultaneously with the
   layout move, two things compete for the eye and the text reads as jitter.

**Collapse reverses and runs faster (~220ms).** Dismissal should feel immediate; only arrival earns
a leisurely curve.

### Motion tokens

The repo has `--brand-transition-fast: 140ms ease` and `--brand-transition: 220ms ease`. Neither is
right for a layout move of this size. Add one:

```css
--brand-transition-layout: 320ms cubic-bezier(0.2, 0, 0, 1);
```

Keep it in `brand.css` with the other tokens so the gallery does not invent private timing values —
the site already has a single motion vocabulary and this should join it, not sit beside it.

---

## 4. Filter transitions

Currently filtering swaps the list and the grid jumps. With the same primitive as §2:

- **Leaving** — fade out with a slight scale-down (`0.96`), fast (~140ms). Departing things should
  not linger.
- **Staying** — tween to their new grid positions. This is the one that makes filtering feel
  designed rather than reloaded, and it is free once View Transitions is in.
- **Entering** — fade up from `0.96`, **staggered by grid position**, ~25ms per card, so arrival
  reads as a wave rather than a pop. Cap the total stagger (~300ms) so a future larger gallery does
  not turn filtering into a slideshow.

**Open behaviour:** if a card is expanded when the filter changes and the card no longer matches —
collapse it first, then filter. Filtering out an expanded card mid-animation is visually incoherent.

---

## 5. Accessibility — non-negotiable

- The toggle must be a real **`<button>`** with **`aria-expanded`** and `aria-controls`, not a click
  handler on the `<figure>`. Keyboard operable for free, state announced for free.
- Watch for **nested interactive elements** while restructuring — a button inside a button is
  invalid and breaks assistive tech. The card is currently `<figure>` + `<figcaption>`.
- **Focus stays on the trigger** through expand and collapse. The revealed text follows in DOM order,
  so it is reachable without a focus jump.
- The one-line preview should be a **visual** clamp (`line-clamp`), with the full description present
  for assistive tech — do not truncate the actual string.
- **Escape collapses** the open card.
- **Scroll anchoring:** expanding a card low on the page pushes content and can shove the card
  itself off-screen. Scroll it into view when that happens — `behavior: 'smooth'`, or `'auto'` under
  reduced motion.
- Every animation above collapses to an **instant state change** under
  `prefers-reduced-motion: reduce`. Required by `AGENTS.md`, and the expand must remain fully
  functional in that mode.

---

## 6. Two traps this repo has already fallen into

- **`.gallery-item` is a bubble exclusion selector.** `DEFAULT_EXCLUSIONS` matches by selector, so
  retagging or renaming the card silently drops it out of the physics exclusion zones with no error
  and nothing red in the suite. This has happened **twice** already (the hero logo, Entry 090; the
  Projects rail, Entry 085/093). Restructuring the card for expansion is exactly the shape of change
  that causes it. Keep `.gallery-item` on the same element and add a bubble spec case in the same
  commit.
- **The visual suite cannot see any of this.** It captures under `prefers-reduced-motion`, where
  every animation here is disabled by design — so the entire feature is invisible to the gate, the
  same blind spot that hid a bubble regression for a week. This needs a **motion-enabled spec**, and
  per `tests/bubbles-exclusion.spec.js` those must run `test.describe.configure({ mode: 'serial' })`
  or rAF starvation under parallel load produces failures that read exactly like real regressions.

**What that spec should assert:** `aria-expanded` flips; the card's measured box actually grows in
both axes; a second card's expansion collapses the first; Escape collapses; the reduced-motion path
changes state without animating; and the filter path behaves when a card is open.

---

## 7. Artwork size cap

**Decided 2026-08-01: the artwork never exceeds the height of the viewport.** Collapsed cards keep
their existing `max-h-[70vh]`; the expanded card's art is capped at one screen, so a tall piece on a
big monitor can never require scrolling to see a single image.

Two mechanical details that decide whether this actually behaves as intended:

- **Use `dvh`, not `vh`.** On mobile, `100vh` is the viewport *including* the browser chrome that
  hides on scroll, so a `100vh` image is cut off at rest — the classic mobile `vh` bug. `100dvh`
  tracks the dynamic viewport and is what "one screen" means to a person holding a phone.
- **Subtract the nav.** `.brand-nav` is sticky, so it overlays the top of the page. Art at a literal
  `100dvh` is always partly underneath it. For the cap to mean "fully visible in one screen", it
  wants to be:

  ```css
  max-height: calc(100dvh - var(--brand-nav-height));
  ```

  Flagging rather than assuming — if the intent is instead "the art may run edge to edge and the nav
  floats over it", drop the subtraction. The sticky nav makes this a real visual difference, not a
  rounding error.

**Interaction with §3:** the cap is what the art animates *toward*, so the growth curve should target
the capped size directly. Animating to an uncapped size and then clamping produces a visible hitch at
the end of the expand.

## 8. Open questions

- **Q-M2 — Should the expanded piece be deep-linkable?** The filter already writes `#filter=digital`,
  so the pattern exists. `#piece=lollipop` would make individual works shareable. Nice, not free.

## 9. Verification

- Motion-enabled spec green (serial, per §6)
- Full visual suite green twice — captures are unaffected in principle, since the gate runs under
  reduced motion, so **any** baseline movement here is a signal worth reading, not rubber-stamping
- `node scripts/measure-content-widths.js` exit 0 — the expanded card must not break the shared
  container geometry
- Manual pass at 360 / 768 / 1440 / 2560, both themes, plus one run with reduced motion forced on
- Bubble exclusion spec still green with the restructured card
- **Expanded art never exceeds one screen** — check on a short viewport (e.g. 1440×720) and on a
  phone with the browser chrome both shown and hidden, since that is where `vh` vs `dvh` diverges
