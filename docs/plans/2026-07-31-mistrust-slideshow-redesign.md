# A History of Mistrust — slideshow redesign (touch swipe + animated controls)

**Date:** 2026-07-31
**Status:** **Shipped** — implemented on branch `slides`, merged to `develop` as `152cf2f`
(2026-08-01, user-reviewed in the browser). LOGBOOK Entry 109; stage commits `c2e0838` (stages 1–2)
and the stage-3 commit. Process log: [`2026-07-31-mistrust-slideshow-shxdowloop.md`](./2026-07-31-mistrust-slideshow-shxdowloop.md).
**Branch:** work happened on `develop` (deploy pause until 2026-08-06, see `AGENTS.md` → Branch Policy).

> This header read *"Plan only — not implemented. No code has been written."* until 2026-08-01,
> which was false for a full day after the work merged. Anyone reading it cold would have rebuilt a
> finished slideshow. Corrected during the docs-sync re-run; see
> [`2026-07-24-docs-sync-todo-consolidation.md`](./2026-07-24-docs-sync-todo-consolidation.md).

---

## 1. Goal

Replace the current three-stacked-viewer slideshow on the Projects → *A History of Mistrust*
tab with one modern, sleek stage that:

- **Swipes with a finger** on touch screens (and drags with a mouse on desktop).
- Has **clickable Prev / Next buttons** that animate the same smooth horizontal slide.
- Lets a visitor jump anywhere via a **thumbnail filmstrip** and a **Set 1 / 2 / 3 switcher**.
- Replaces the three very tall stitched "All Slides" images with a **30-thumbnail grid**.

Decided with the user on 2026-07-31:

| Decision | Choice |
|---|---|
| Layout | **One viewer + set switcher** (not three stacked, not one continuous 30) |
| Secondary nav | **Thumbnail filmstrip** (not dots, not a progress bar) |
| "All Slides" section | **Replace with a 30-thumb grid** |

## 2. Where things stand today

| File | Role today |
|---|---|
| `app/projects/MistrustProject.tsx` | Server component. Hand-written markup for 3 empty `.set-slideshow` widgets, the 3 `.carousel-set` stitched images, moodboard/storyboard, and the bibliography. |
| `public/scripts/history-of-mistrust-slideshow.js` | 263 lines of vanilla IIFE. Owns `SLIDE_ALT` (30 transcribed strings), builds every slide `<img>` at runtime, drives the 3 set viewers and the global lightbox. |
| `app/projects/SlideshowScript.tsx` | Client component that appends the above `<script>` to `document.body` on mount and removes it on unmount. |
| `app/projects/page.tsx` | Renders the lightbox `<div id="lightbox">` markup as static DOM outside `<main>`. |
| `app/projects/ProjectTabs.tsx` | Has a `closeLightbox()` that reaches into `document.getElementById('lightbox')` and mutates classes/attributes directly, because the lightbox is not React-owned. |
| `app/projects/slideshow.css` | `.set-ss-*` and `.lightbox-*` rules, imported by `page.tsx`. |

Specific problems this plan fixes:

1. **No swipe on the set viewers at all.** Only the lightbox has pointer drag
   (`history-of-mistrust-slideshow.js:166-201`). On the page itself, a finger drag just scrolls.
2. **`.set-ss-viewer` has no `touch-action`** (`slideshow.css:31-39`), so there is nothing to
   hook a horizontal gesture onto without fighting page scroll.
3. **Tap-to-open-lightbox will collide with swipe.** `viewer.addEventListener('click', …)`
   (`:247`) fires after any drag that ends over the viewer. Adding swipe without a
   tap/drag discriminator means every swipe also opens the lightbox.
4. **The lightbox drag threshold is a fixed 80px** (`:70`). That is 22% of a 360px phone and 7%
   of a 1080px desktop frame — the same gesture means two different things depending on device.
5. **`pointerleave → pointerUp`** (`:201`) is wrong under `setPointerCapture`: it can commit a
   half-finished drag.
6. **Three 1:1 viewers cost ~2200px of vertical scroll** and each is capped at 720px wide, so
   the artwork reads small on desktop *and* the section is long on mobile.
7. **The three stitched `sets/set-N.webp` are 1.37 MB combined** and are extremely tall
   (10 slides stacked) — awkward on phones, and no individual slide is directly addressable.

## 3. Approach

### 3.1 Migrate the whole feature to React client components

The vanilla script predates the Next.js migration. Keeping it means the new stage's state
(active set, index, drag offset, filmstrip scroll) lives in closures while everything around
it is React — and it is the reason `ProjectTabs.tsx` has to poke at global DOM to close a
lightbox. Port it.

**New files**

| File | Contents |
|---|---|
| `app/projects/mistrustSlides.ts` | Typed slide data: `{ n, src, full, thumb, alt, set }[]`, derived from a single `SLIDE_ALT` array. **Verbatim move** of the 30 strings — no re-transcription. |
| `app/projects/useSwipeDeck.ts` | The gesture hook (spec in §3.3). Shared by the stage and the lightbox so they behave identically. |
| `app/projects/MistrustSlideshow.tsx` | `'use client'`. Set switcher + stage + Prev/Next + counter + filmstrip. |
| `app/projects/MistrustLightbox.tsx` | `'use client'`. React port of the lightbox, driven by props/context instead of global DOM. |
| `app/projects/SlideGrid.tsx` | The 30-thumb grid replacing "All Slides". |

**Deleted**

- `public/scripts/history-of-mistrust-slideshow.js`
- `app/projects/SlideshowScript.tsx`
- The static `<div id="lightbox">` block in `app/projects/page.tsx:34-56`
- `closeLightbox()` in `app/projects/ProjectTabs.tsx:22-31` and its call at `:61`

**Changed**

- `app/projects/MistrustProject.tsx` — becomes `'use client'` (or stays a server component that
  renders the three new client components; prefer the latter to keep the 230-line bibliography
  out of the client bundle). Slideshow section → `<MistrustSlideshow />`; "All Slides" section →
  `<SlideGrid />`.
- `app/projects/slideshow.css` — `.set-ss-*` rules replaced by `.mistrust-*`; lightbox rules kept
  and extended.
- `AGENTS.md` — the "Build & Test" note says `SLIDE_ALT` lives in
  `public/scripts/history-of-mistrust-slideshow.js`. That pointer must move to
  `app/projects/mistrustSlides.ts` **in the same commit**, or the next agent edits a deleted file.
- `docs/ARCHITECTURE.md` — **does not exist on `develop`** (checked 2026-07-31); it lives only on
  `shxdowloop/2026-07-31/architecture-map`, unmerged. So there is no map to refresh on this
  branch. Its runtime diagram lists `history-of-mistrust-slideshow.js -> case-study carousel +
  lightbox`, which this work deletes — **whoever merges that branch must reconcile the diagram**,
  or run `shxdowmap refresh --auto` post-merge.

> **Alternative considered and rejected:** keep the vanilla script and bolt swipe onto it.
> Smaller diff, but it leaves the tap/drag collision, the global-DOM lightbox, and the
> `ProjectTabs` DOM hack in place, and the set switcher + filmstrip need real state anyway.

### 3.2 Layout

```
┌──────────────────────────────────────────────┐
│  Slideshow                                   │
│                                              │
│        [ Set 1 ][ Set 2 ][ Set 3 ]           │  segmented switcher
│                                              │
│   ‹  ┌────────────────────────────────┐  ›   │  arrows overlay the stage ≥768px,
│      │                                │      │  sit under it below that
│      │           S L I D E            │      │
│      │          ← swipe →             │      │  1:1, max-width 860px
│      │                                │      │
│      └────────────────────────────────┘      │
│                                              │
│      [▪][▪][▪][▪][▪][▪][▪][▪][▪][▪]          │  filmstrip, scroll-snap
│               Slide 4 of 10                  │
└──────────────────────────────────────────────┘
```

- Stage: `aspect-ratio: 1/1`, `max-width: 860px` (up from 720px — one viewer instead of three
  buys the room), centered, `.brand-frame` border/fill so it matches Gallery and Projects cards.
- Track: `display:flex`, `transform: translateX(calc(-1 * var(--i) * 100%))`, one pane per slide
  in the active set only (10 panes, not 30).
- Set switcher: `role="tablist"` nested inside the existing project tabpanel (valid ARIA),
  `aria-controls` the stage region. Left/Right arrows move between sets per APG. Uses
  `.brand-accent-dim` for the selected state, matching `.project-tab`.
- Prev/Next: 44×44 minimum (WCAG 2.5.5), circular, `--brand-surface-2` at rest,
  `--brand-accent-dim` on hover, `2px solid var(--brand-accent)` focus-visible ring per the
  AGENTS.md focus contract. Disabled at the ends of a set (do **not** wrap — the sets are
  a narrative sequence).
- Filmstrip: horizontally scrollable row of 10 `<button>`s, `scroll-snap-type: x mandatory`,
  active thumb gets an accent ring + `scrollIntoView({ inline: 'center', block: 'nearest' })`.
  Each button's accessible name is `Go to slide N`.
- Counter: `Slide 4 of 10` under the filmstrip. A separate visually-hidden `aria-live="polite"`
  region announces `Slide 4 of 10, Set 2` — **only on committed index change**, never per drag
  frame.
- Set change **cross-fades** the stage (150ms opacity) and resets to slide 1. It does not slide;
  sliding ten slides at once is disorienting.

Geometry must obey the shared-container rule in AGENTS.md → Design Conventions: the section keeps
`px-6`, the container carries the width, nothing gets `mx-auto` that would break the shared left
edge. Verify with `node scripts/measure-content-widths.js`.

### 3.3 `useSwipeDeck` — the gesture contract

This is the core of the request; specifying it precisely is what keeps the feel right.

**Input:** `{ count, index, onCommit(nextIndex), disabled }`
**Output:** `{ bind, dragPx, isDragging }` where `bind` is the pointer-handler prop set for the
stage element.

| Concern | Rule | Why |
|---|---|---|
| Events | Pointer Events only (`pointerdown/move/up/cancel`) + `setPointerCapture` | One code path for touch, pen, and mouse. Already how the lightbox does it. |
| CSS | `touch-action: pan-y` on the stage; `user-select: none`; `draggable={false}` on every `<img>` | Vertical page scroll keeps working; horizontal is ours; no native image-drag ghost. |
| Axis lock | On first move: if `abs(dx) > abs(dy)` **and** `abs(dx) > 8px` → engage horizontal drag. If vertical wins first, abandon the gesture for this pointer and let the page scroll. | Without this a vertical flick started on the stage feels sticky — the single most common swipe-carousel defect. |
| Live tracking | While engaged: `transition: none`, `translateX(basePx + dx)` — the track follows the finger 1:1 | Direct manipulation. A carousel that only moves on release feels broken. |
| Commit rule | Commit if `abs(dx) > 0.20 × stageWidth` **OR** flick velocity `> 0.4 px/ms` measured over the last ~100ms of movement | Fixes today's fixed-80px bug: a fast short flick advances, a slow long drag advances, a slow short drag snaps back. |
| Edge resistance | At index 0 dragging right, or last index dragging left: apply the drag at `× 0.35` | Communicates "end of set" physically instead of feeling frozen. |
| Release | `transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1)` (ease-out, no overshoot) | Overshoot on a *drag* release reads as a bug; it's fine on a button press. |
| Button press | Same transform, `300ms cubic-bezier(0.34, 1.56, 0.64, 1)` — the existing spring from `slideshow.css:45` | This is the "smooth slide over" the request asks for, and it already matches the site's motion feel. |
| Tap vs swipe | Tap = total movement `< 8px` **and** duration `< 300ms` → open the lightbox at the current slide. Anything else → suppress the synthetic `click` | Fixes problem #3. Implemented by tracking a `didDrag` ref and calling `preventDefault()` on the click, not by a timeout. |
| Cancel | Handle `pointercancel` (snap back). **Do not** bind `pointerleave` | Fixes problem #5 — under pointer capture, `pointerleave` fires spuriously and commits half-drags. |
| Multi-touch | Ignore a second pointer while one is captured | A pinch must not be read as a swipe. |
| Reduced motion | `prefers-reduced-motion: reduce` → live tracking still follows the finger (that is direct manipulation, not decoration), but the release/button transition becomes an instant jump | AGENTS.md accessibility contract. |
| Keyboard | Left/Right on the focused stage step by one; Home/End jump to first/last of the set | Already present today at `history-of-mistrust-slideshow.js:249-253`; keep it. |

The lightbox uses the same hook over all 30 slides, which retires the fixed-80px threshold and
the `pointerleave` bug there too.

### 3.4 The 30-thumb grid ("All Slides")

- Responsive grid: 2 columns < 600px, 3 at ≥600px, 5 at ≥1100px. `gap-3`, `.brand-frame` cells.
- Each cell is a `<button>` with accessible name `Open slide N of 30` that opens the lightbox at
  that global index. The long transcribed alt text lives on the lightbox image, not on 30 grid
  thumbs — 30 paragraphs of alt text in a grid is worse for screen readers, not better.
- `loading="lazy"` + `decoding="async"` on every thumb.
- **Weight:** the 30 base `slide-NN.webp` total ~1.0 MB, *less* than the 1.37 MB of the three
  stitched strips it replaces, so this is a net win even with no new assets. Still worth adding a
  `slide-NN-thumb.webp` (~320px wide, ~6 KB each ≈ 180 KB for all 30) to
  `scripts/generate-mistrust-assets.js`, used by both the grid and the filmstrip. Treat the thumb
  variant as **Track C** — the grid ships correctly without it.
- The stitched `sets/set-N.webp` files stay on disk (they are the shareable full-set artefact and
  are referenced by the legacy root site); only the Projects-page section stops using them.

### 3.5 Files touched — summary

```
NEW      app/projects/mistrustSlides.ts
NEW      app/projects/useSwipeDeck.ts
NEW      app/projects/MistrustSlideshow.tsx
NEW      app/projects/MistrustLightbox.tsx
NEW      app/projects/SlideGrid.tsx
NEW      tests/mistrust-slideshow.spec.js
EDIT     app/projects/MistrustProject.tsx
EDIT     app/projects/page.tsx
EDIT     app/projects/ProjectTabs.tsx
EDIT     app/projects/slideshow.css
EDIT     scripts/generate-mistrust-assets.js        (Track C only)
EDIT     AGENTS.md                                   (SLIDE_ALT pointer)
EDIT     docs/ARCHITECTURE.md                        (via shxdowmap refresh --auto)
EDIT     style.css                                   (regenerated, committed)
EDIT     LOGBOOK.md, TODO.md
DELETE   public/scripts/history-of-mistrust-slideshow.js
DELETE   app/projects/SlideshowScript.tsx
```

## 4. Parallel tracks

**Sequential gate first:** `mistrustSlides.ts` and the `useSwipeDeck` signature must land before
anything else — every other track imports one or both. Estimated as one small commit.

| Track | Scope | Depends on | Verification | Owner |
|---|---|---|---|---|
| **Gate** | `mistrustSlides.ts`, `useSwipeDeck.ts` | — | typecheck; hook unit-exercised via Track A | main agent |
| **A — Stage** | `MistrustSlideshow.tsx`, `.mistrust-*` CSS in `slideshow.css` | Gate | manual swipe on a real touch device + Playwright touch spec | pro nano-agent sidecar, main-agent review |
| **B — Lightbox port** | `MistrustLightbox.tsx`, lightbox CSS, removal from `page.tsx` + `ProjectTabs.tsx` | Gate | focus trap, Esc, arrows, swipe, scroll lock | pro nano-agent sidecar, main-agent review |
| **C — Grid + thumbs** | `SlideGrid.tsx`, `scripts/generate-mistrust-assets.js` | Gate | thumb regeneration is byte-stable on unchanged sources; grid opens correct index | pro nano-agent sidecar |
| **D — Tests** | `tests/mistrust-slideshow.spec.js`, snapshot re-baseline | A + B + C markup frozen | full suite green **twice** | main agent |
| **E — Docs** | AGENTS.md, ARCHITECTURE.md, LOGBOOK, TODO | D | `shxdowmap status` = fresh | main agent |

A, B, C touch disjoint files and can run concurrently. D and E are strictly sequential after them.

## 5. Verification

**Functional (manual, `npm run dev` → localhost:3000/projects/#history-of-mistrust)**

1. Real touch device or Chrome DevTools touch emulation: swipe left/right advances; a slow
   short drag snaps back; a fast flick advances; vertical scroll started on the stage still
   scrolls the page.
2. A swipe does **not** open the lightbox. A tap **does**, at the correct slide.
3. Prev/Next animate the same slide; disabled at set boundaries.
4. Filmstrip click jumps and re-centers; keyboard Tab reaches every thumb.
5. Set switcher cross-fades, resets to slide 1, announces.
6. Keyboard: Left/Right/Home/End on the stage; Esc/arrows in the lightbox; focus returns to the
   trigger on close.
7. `prefers-reduced-motion: reduce`: no transitions, navigation still works.

**Automated**

- `tests/mistrust-slideshow.spec.js` — new. Uses a `hasTouch` context and `page.touchscreen`
  for real touch swipes plus mouse-drag cases. Covers each of items 1-7 above.
- `npm test` — the existing 55-test suite. `tests/visual-baseline.spec.js:10` captures
  `projects-mistrust` at `/projects/#history-of-mistrust` and activates the tab before shooting
  (`:80-81`), so **exactly 8 snapshots will change** (1 page × 4 breakpoints × 2 themes). The
  8 plain `projects` snapshots (Brand tab) must stay byte-identical — if they move, something
  leaked out of the Mistrust panel. Re-baseline per AGENTS.md:
  `npx playwright test --update-snapshots -g "<name>"` test-by-test (bulk updates silently skip
  files), review every regenerated PNG, then run the full suite green **twice in a row**.
- `node scripts/measure-content-widths.js` — must exit 0 (shared content geometry).
- `npm run build:next` — must succeed with `next dev` stopped (`distDir` is `out`; building while
  dev runs breaks the dev server).
- `npm run css:build` and commit the regenerated `style.css`.

**Viewports** — per AGENTS.md wide-screen-first: 360, 768, 1440, **2560, 3440**, both themes.

## 6. Risks

| Risk | Mitigation |
|---|---|
| **Alt-text regression.** `SLIDE_ALT` drifted out of order for 12 slides before Entry 106; the artwork is the source of truth. | Move the array **verbatim**, byte-for-byte. Add a test asserting `SLIDE_ALT.length === 30` and that slides 1/11/21 are the three set title cards (the `Math.ceil(n/10)` set math depends on it). Do not "clean up" the strings. |
| **Visual snapshot churn.** The suite is a real gate and bulk `--update-snapshots` has silently skipped files twice. | Per-test updates, review each PNG, two consecutive green full runs. |
| **Tailwind class scanning.** Class names written into `.md` files used to recompile into shipped CSS. | `@source not` rules already exclude `**/*.md` and `docs/**`; expect three consecutive byte-identical CSS builds. This plan doc names a few utility classes — confirm the exclusion still holds after the first build. |
| **Bubble exclusion zones.** The physics engine avoids listed selectors. | Checked 2026-07-31: the list names `.project-section` (`scripts/bubbles.js:72`), **not** `.set-ss-*` or `.carousel-set`. So renaming those classes is safe **provided the new markup stays inside a `.project-section` wrapper** — that is a hard constraint on Tracks A and C, not a nice-to-have. No edit to either `bubbles.js` copy is needed. `tests/bubbles-exclusion.spec.js` must stay green, and it runs **serially** — do not remove that config. |
| **Client-bundle size.** Making `MistrustProject` a client component would ship ~230 lines of bibliography JSX to the browser. | Keep `MistrustProject` a server component; only the three new interactive pieces are `'use client'`. |
| **Deploy pause.** Pushing `portfoliowebsite` is blocked until 2026-08-06. | Work and commit on `develop`. No push to production, no deploy, as part of this work. |
| **iOS Safari pointer quirks.** Pointer Events are supported, but `touch-action` must be on the element that receives the gesture, and passive listeners can't `preventDefault`. | Set `touch-action` in CSS (not JS), attach the move handler with `{ passive: false }` where a `preventDefault` is needed, and verify on a real iOS device — not just DevTools emulation. |

## 7. Out of scope

- The Brand project tab.
- Autoplay / auto-advance. Not requested, and it fights a text-heavy narrative carousel.
- Infinite wrap-around. The sets are ordered arguments; ending at slide 10 is correct.
- Regenerating any slide artwork from Figma.
- Anything touching the legacy root `projects/history-of-mistrust.html` static page.
