# Sticky rail, and the one-column rule for the nav

**Date:** 2026-08-10
**Branch:** `develop`
**Status:** **Shipped 2026-08-10** — all four stages built, LOGBOOK Entry 134. Stage 0's
measurement confirmed the diagnosis below (rail top -570px after a 1000px scroll at 1024, travel
0px), so Stage 2 was a *fix*, not an extension. Two things diverged from the plan as written and are
recorded at their stages: the nav is `position: relative` rather than `static` (the spectrum bar is
absolutely positioned inside it and escaped to the initial containing block), and the Gallery result
count stayed inside the sticky wrapper with a `bubble-exclude` added rather than being moved out.
**Ask (user, 2026-08-10):** *"make the vertical tabs sticky (user can see different selections /
current selection on the side the entire time) unless they are only able to see 1 column. on 1
column screen sizes, the top nav bar should stop being fixed/sticky as well."*

---

## The rule this plan installs

**One number governs both behaviours: 768px, because that is where the gallery grid stops being one
column** (`md:grid-cols-2` in `GalleryGrid.tsx:429`). User call, 2026-08-10, chosen over "below the
rail breakpoint (1024px)" and over moving the rail down to `md`.

| Viewport | Gallery grid | Top nav | Tab / filter group |
|---|---|---|---|
| < 768px | 1 column | **static** — scrolls away with the page | static, above the content |
| 768–1023px | 2 columns | sticky | **sticky** horizontal strip under the nav |
| ≥ 1024px | 2–3 columns | sticky | **sticky** vertical rail on the side |

Read as one sentence: *if the user can see more than one column, the nav and the current selection
both stay on screen; if they cannot, nothing is pinned and the whole page scrolls as one piece.*

**Assumed scope** (the user answered the breakpoint question and not this one): both groups — the
Projects tablist and the Gallery filter rail — and the nav change applies site-wide, including Home
and Contact, since the rule is about the viewport and not about which page is open. Say so if
Home/Contact should keep a sticky nav at all widths; it is a one-line media-query change.

---

## Stage 0 — the measurement gate (do this first, headed)

**The rails are probably not sticky today, and that is likely the real complaint.** Derived from the
DOM, not yet measured:

- `ProjectTabs.tsx:114` puts `lg:sticky lg:top-16` on the **tablist itself**. Its parent is
  `div.lg:w-[260px] lg:shrink-0` (line 97), whose only child is that tablist.
- A sticky element can only travel inside its parent's padding box. That parent's height *is* the
  tablist's height, so the travel budget is **≈ 0px** — the rail scrolls off with the page and the
  `sticky` declaration buys nothing.
- The parent is a flex item of `lg:flex lg:items-start` (line 96). `items-start` is what makes it
  content-height instead of stretching to the tall panel beside it — so the flex container's height
  never reaches the sticky element.
- `GalleryGrid.tsx:375–385` is the same shape, with the result-count block adding a few dozen pixels
  of travel and nothing more.

Note the failure mode: the declaration *computes* as `position: sticky` and *behaves* as static. And
the visual gate cannot see it — captures are `fullPage` at scroll 0, where a rail with travel and a
rail without paint identically. That is why it has survived since Entry 079.

**Confirm before writing the fix.** Serve the export, load `/projects/` and `/gallery/` at 1024 /
1440 / 2560 / 3440, scroll 1000px, and record:

1. `tablist.getBoundingClientRect().top` — negative means the diagnosis holds and Stage 2 is a *fix*,
   not an *extension*. Pinned at 64 means something else provides the containing block and Stage 2
   must be re-derived before any code is written.
2. The rail column's height against the panel's height — a column much shorter than its neighbour is
   the direct evidence for the zero-travel reading.
3. `.brand-nav` `getBoundingClientRect().height` at each width, against 64px — quantifies the
   underlap below.

**Headed, not headless** — this repo's convention for anything layout- or focus-shaped. Put the
numbers in the LOGBOOK entry: this repo has already shipped one fix against a hypothesis the
measurement later contradicted (Entry 115 → the 2026-08-09 bubble flake plan), and the probe costs
minutes.

Also confirm the second defect while you are there:

- `lg:top-16` is **64px**. `--brand-nav-height` is `clamp(62px, 6vw, 76px)` (`brand.css:116`).
- 6vw reaches 64px at **1067px** and is clamped to 76px from **1267px** up.
- So at 1440px the pinned rail's first **12px sits behind the nav**. Arithmetic, unverified —
  check it on screen.

---

## Decisions

### D1 — 768px, expressed twice, cross-referenced

Tailwind cannot hand a breakpoint to a hand-written `@media` block, and the nav rule belongs in
`brand.css` beside `.brand-nav` rather than as a utility on the element. So the number lives in two
places: `md:` prefixes in the two components, and one `@media (min-width: 768px)` in `brand.css`.
**Each gets a comment naming the other and naming `md:grid-cols-2` as the origin of the number.**
This repo has been bitten before by a breakpoint that drifted between JS and CSS — see the
`max-[400px]` note in `ProjectTabs.tsx`, where `399` vs `400` produced a 0px-wide divider.

### D2 — 768–1023px gets a sticky *horizontal strip*, not a side rail

The alternative was to move the side rail down to `md:` so the tabs are always "on the side". It
costs too much: at a 768px viewport the rail takes 260px, leaving the panel 508px, minus its 48px
gutter and a 24px gap = **218px per gallery card, down from 348px today — a 37% shrink on tablet**,
on a page whose entire recent design history is about the picture being as large as the frame
allows. A 180px rail still lands at ~258px.

So in that band the existing horizontal group stays where it is and simply pins under the nav. It
satisfies the actual requirement — the current selection stays visible the whole time — at zero cost
to the grid. "On the side" resumes at 1024px, unchanged. **Flag if you would rather have the side
rail at 768px and accept the smaller cards; it is a contained change to the same stage.**

### D3 — the sticky offset becomes a token, not `top-16`

`top: var(--brand-nav-height)` everywhere, replacing `lg:top-16`. Fixes the 12px underlap and means
the nav height has exactly one definition, which is what its comment in `brand.css` already claims.

---

## Stages

### Stage 1 — the nav

`brand.css:602`. `.brand-nav` becomes `position: static` by default and `position: sticky; top: 0`
inside `@media (min-width: 768px)`. Keep `z-index: 50` in both — it still needs to outrank the
sticky strip below it.

Accepted tradeoff, stated so it is not rediscovered as a bug: **on a phone the nav is gone once you
scroll.** Returning to it is a scroll up, or the `#return-to-top` button that already appears past
800px of scroll. That is the point of the request — vertical space on a one-column screen is worth
more than a persistent bar.

### Stage 2 — the two groups

Both files, same shape, applied to the **wrapper** (`ProjectTabs.tsx:97`,
`GalleryGrid.tsx:375`) rather than the inner bar, so the containing block is the tall flex/block
parent and the travel budget is the length of the panel:

- `sticky` from 768px up, `top: var(--brand-nav-height)`.
- A **solid `--brand-bg` background and horizontal padding** on the pinned strip in the 768–1023
  band. Non-negotiable: the group is transparent today, and content scrolling underneath a
  transparent pinned strip is the classic version of this bug.
- `z-index: 40` — under the nav, over the content.
- At ≥1024px the same declarations already do the right thing, so the rule is one block with the
  background scoped to the narrower band.
- `ProjectTabs`'s `isRail` matchMedia (line 55, `(min-width: 1024px), (max-width: 399px)`) is
  **unchanged** — `aria-orientation` follows the visual axis, and under D2 the axis at 768–1023 is
  still horizontal. If D2 is overturned in favour of a side rail at 768, this query moves in the
  *same commit*, or the announced orientation contradicts the visible layout.
- **The two class lists must stay byte-identical**, per `AGENTS.md`. They are today; that is what
  keeps the tab shape the same across the two pages.
- **At ≥1024px there is a second valid fix**: leave `sticky` on the inner bar and give the column
  `lg:self-stretch` so it inherits the flex container's height. Prefer moving it to the wrapper
  anyway — it is one mechanism for both bands, whereas `self-stretch` does nothing at 768–1023
  where the container is not a flex box. (Do **not** fix it by dropping `lg:items-start`: that also
  stretches the content column and changes how a short panel lays out.)
- **No `max-height` + `overflow-y` guard.** Two Projects tabs and four Gallery filters cannot exceed
  a viewport. Revisit when a fifth item lands; adding it speculatively is untested code.

Check while implementing: the strip's own `.brand-tab-divider` spectrum rules and the gallery's
result-count block both sit inside the wrapper that is now sticky. The count riding along under the
strip at 768–1023 is probably wrong — expect to move it out of the sticky wrapper, or hide it in that
band, and decide by looking at it.

### Stage 3 — everything that assumes the nav overlays the page

Three consumers subtract the nav height because a sticky nav covers the top of the viewport. Below
768px that assumption is now false and each one under-uses ~62px:

| Site | Today | Needs |
|---|---|---|
| `brand.css:1567,1602` — `--art-cap` | `calc(100dvh - var(--brand-nav-height))` | 0 allowance below 768 |
| `app/projects/slideshow.css:73` — `--stage-cap` | same subtraction | same |
| `GalleryGrid.tsx:352–367` — expand scroll | `nav.getBoundingClientRect().height` as the offset | 0 below 768 |

**Introduce `--brand-nav-overlay`**: `0px` by default, `var(--brand-nav-height)` inside the same
`@media (min-width: 768px)` as Stage 1. The two CSS caps read it directly. The JS reads it with
`getComputedStyle(document.documentElement).getPropertyValue('--brand-nav-overlay')` — **not** a
second matchMedia, which would be a third copy of 768.

Note the direction of the error if Stage 3 is skipped: the gallery expand scroll would leave a 62px
gap above the card on mobile, and the Mistrust stage would be 62px smaller than it can afford. Both
are visible, neither throws.

### Stage 4 — tests

- **Visual baselines.** `fullPage: true` captures render a sticky nav at the top anyway, so the nav
  change alone should produce **zero** baseline churn. The 768px shots for `projects` and `gallery`
  *will* change if Stage 2 alters the strip's background or the result-count position. Adjudicate
  those two pages × two themes numerically, per `docs/visual-gate.md` — do not bulk-accept.
- **Bubbles.** `scripts/bubbles.js:89` excludes `.brand-nav`, and the tracker rebuilds on scroll and
  resize (`_update`, ~line 236), so a nav that scrolls out of the viewport takes its zone with it.
  Low risk, but `bubbles-exclusion` is the flakiest spec in the suite and it has a
  `Projects tabs @ 768px` case — run it several times, and read
  [`2026-08-09-bubble-exclusion-flake.md`](2026-08-09-bubble-exclusion-flake.md) before blaming this
  work for a failure there.
- **Nav-offset assertions.** `gallery-expand.spec.js:213,239,332` and `mistrust-slideshow.spec.js:225,282`
  all measure `.brand-nav` height and expect the content to clear it. At <768 the expectation becomes
  "clears 0". These specs need the same conditional as Stage 3, not a loosened tolerance.
- **New coverage**, one spec: at 360px the nav's top is negative after scrolling; at 768px and 1440px
  the nav's top is 0 and the tab group's top equals the nav height. That is the whole contract in
  three assertions.
- **`node scripts/measure-content-widths.js [port]` must exit 0.** Stage 2 changes the column's
  *height*, not its width, so this should be untouched — running it is how that becomes known rather
  than assumed. The visual suite cannot catch a shared-geometry break, because it grades each page
  against its own past self.
- **Ultrawide, per `AGENTS.md`:** re-run the Stage 0 probe at 2560 and 3440 after the fix, both
  pages, both themes. The rail's top must hold at the nav height through a full scroll. These widths
  are exactly where the `top-16` underlap is worst.
- Manual pass at **1023 and 1024** specifically — the strip-to-rail handoff — and at 767/768 for the
  nav handoff.

---

## Out of scope, deliberately

- **Anchor targets under the sticky nav.** There is no `scroll-padding-top` anywhere in the CSS, so a
  `/projects/#history-of-mistrust` deep link lands with the heading behind the nav at ≥768px. Real,
  pre-existing, and orthogonal — it gets *better* below 768 as a side effect. Belongs in `TODO.md`,
  not here.
- **The `#return-to-top` 800px threshold.** It becomes the only way back to the nav on mobile, which
  is an argument for lowering it. A separate judgement call about a separate control.
