# Gallery widening on wide screens

**Status:** shipped 2026-07-24 (see *As built* at the bottom for the three divergences)
**Date:** 2026-07-24
**Agent:** Opus 4.8 (vellum, planner)
**Source item:** `TODO.md` → Open Task Threads → Standalone → "Widen the gallery page"

---

## Goal

On wide displays the gallery grid occupies under half the viewport while the Projects page runs
to 1400px. Widen the gallery so large screens actually show the artwork, without breaking the
`max-h-[70vh]` no-scroll-per-piece behavior, the srcset rungs, or the four committed breakpoints.

**Done when:** at 1440 / 2560 / 3440px the grid fills a 1400px centered container with three
columns; 360 / 768 / 1024 are pixel-identical to today; `npm test` green with only the
intentional gallery-1440 baselines regenerated and adjudicated.

## The actual blocker (not in the TODO note)

`max-w-[900px]` is not the only cap. `src/css/site.css:104` puts a global
`max-width: var(--brand-content-max)` = **1200px** on every `main`, with
`padding: 0 clamp(16px, 4vw, 40px)`. So the gallery's usable width today is capped at 1120px no
matter what the grid's own `max-w-*` says. Any target above 1120px must also opt the gallery
`<main>` out of that cap, exactly as `app/projects/page.tsx:28` does with
`className="max-w-none mx-0 px-0"`.

This is the difference between a one-token change and a two-file change; the TODO item as written
would have produced a grid that silently stops at 1120px.

## Approach

Mirror the Projects pattern rather than inventing a second one: `<main>` opts out of the global
cap, and an inner centered container carries the real width. Target container **1400px**, matching
`app/projects/ProjectTabs.tsx:87` (`lg:max-w-[1400px] lg:mx-auto`), so the two content pages line
up at the same measure on a wide monitor.

Column plan:

| Breakpoint | Columns | Container | Column width |
|---|---|---|---|
| `< md` (<768) | 1 | 900px cap, unchanged | ~viewport |
| `md` (768–1279) | 2 | 900px cap, unchanged | ~438px |
| `xl` (≥1280) | 3 | 1400px | ~450px |

**Three columns at `xl`, not two wider ones — this is a constraint, not a preference.** The
image rungs are 480w / 900w / 1200w native (`buildSrcSet`, page.tsx:36). A 3-column 1400px grid
gives ~450px columns, whose 2× request is 900w — an existing rung. Two columns in the same
container would be ~685px, whose 2× is 1370w, above the 1200px native asset: every piece would be
upscaled on a retina/HiDPI wide display. Do not "simplify" this to two columns.

`[&_img]:max-h-[70vh]` stays. With `object-contain`, narrower columns mean fewer pieces even reach
the 70vh clamp, so the no-scroll property strictly improves.

## Files to touch

1. **`app/gallery/page.tsx`**
   - `<main id="main">` → `<main id="main" className="max-w-none mx-0 px-0">` (opt out of the
     1200px global cap; the inner container re-supplies centering and gutters).
   - Grid section: `max-w-[900px] grid-cols-1 gap-6 md:grid-cols-2` →
     `max-w-[900px] grid-cols-1 gap-6 px-[clamp(16px,4vw,40px)] md:grid-cols-2 xl:max-w-[1400px] xl:grid-cols-3`.
     The explicit `px-*` replaces the padding `main` used to provide — without it the grid goes
     edge-to-edge at narrow widths, which is a regression at 360/768.
   - `.gallery-header` also loses `main`'s padding; give it the same
     `px-[clamp(16px,4vw,40px)]` (or wrap both sections in one padded container — pick one and
     keep it consistent).
   - `gallerySizes`: `'(min-width: 1000px) 438px, (min-width: 768px) 46vw, 92vw'` →
     `'(min-width: 1280px) 450px, (min-width: 1000px) 438px, (min-width: 768px) 46vw, 92vw'`.
     Stale `sizes` is the classic silent half of this change — the browser keeps picking the old
     rung and the widened grid looks soft.
2. **`style.css`** — rebuild via `npm run css:build` and commit. New arbitrary utilities
   (`xl:grid-cols-3`, the `px-[clamp(...)]`) do not exist in the compiled sheet until then.
   Per `AGENTS.md:38`, a stale committed `style.css` has already bitten this repo once.
3. **`tests/visual-baseline.spec.js-snapshots/gallery-1440-{light,dark}-chromium-win32.png`** —
   regenerate, 2 files.
4. **`TODO.md` / `LOGBOOK.md`** — tick the Standalone item, add the entry.

No changes to `bubbles.js`: `.gallery-item` is already in the exclusion list
(`public/scripts/bubbles.js:82`).

## Blast radius on the visual gate

Breakpoints are 360 / 768 / 1024 / 1440. `max-width` only binds when the viewport exceeds it, so:

- **360, 768** — unchanged *provided* the `px-[clamp(...)]` replacement lands. This is the one
  place the `main` opt-out can regress narrow widths; check these two diffs first, and if they are
  non-zero the padding is wrong, not the baseline.
- **1024** — `xl` is 1280, so still 2 columns at the 900px cap. Unchanged.
- **1440** — crosses `xl`: 3 columns in a 1400px container. **2 snapshots change, expected.**

The TODO note warns that bubble redistribution will make gallery captures noisy. It will not: the
suite captures under `prefers-reduced-motion`, where the engine returns before creating any bubble
(`visual-baseline.spec.js` header comment). Exclusion-zone changes are invisible to the gate — which
is also why `tests/bubbles-exclusion.spec.js` (the only motion-enabled spec) should be run.

Do not `--update-snapshots` blind. Regenerate, then adjudicate: 360/768/1024 must come back
byte-identical; if any of the other six move, stop and find out why before committing.

## Verification

Target for all commands: **Windows PowerShell 5.1 on AVERYBOT**, repo root.

1. `npm run css:build` — then confirm the `style.css` diff is scoped to the new utilities.
2. `npm run build` — static export succeeds.
3. `npm test` — expect exactly the 2 gallery-1440 tests red pre-rebaseline.
4. `npm test -- --update-snapshots`, then `git status` the snapshot dir: exactly 2 files modified.
5. Visual review of the 2 regenerated PNGs plus live capture at **2560px and 3440px, both themes**
   (`AGENTS.md:133` wide-screen-first rule). Checks: container centered with equal whitespace,
   no piece taller than 70vh, no upscaled/soft image at 2×, captions still centered under their
   pieces, ragged last row (11 items / 3 columns = 3+3+3+2) does not read as broken.
6. `npx playwright test tests/bubbles-exclusion.spec.js` — motion-enabled, confirms bubbles still
   avoid the widened `.gallery-item` boxes.

## Risks

- **Narrow-width padding regression.** Opting `main` out of the global cap removes its gutters.
  Mitigated by the explicit `px-*` on both sections and by the 360/768 baselines, which must stay
  byte-identical. This is the single most likely way to ship a bug here.
- **11 items into 3 columns leaves a 2-item last row.** Cosmetic; verify at 2560/3440 rather than
  assuming. If it reads badly, the fix is ordering/`justify-items`, not abandoning 3 columns.
- **Divergence from `--brand-content-max`.** Two pages now bypass the 1200px token with a
  hard-coded 1400px. Acceptable as-is (Projects set the precedent), but if a third page needs it,
  promote 1400px to a `--brand-content-max-wide` token instead of a third literal.
- **`gallerySizes` drift.** If the column count or container changes later, this string must move
  with it. It has no test coverage.

## Parallel tracks

None worth splitting. The `page.tsx` edit, the CSS rebuild, and the re-baseline are strictly
sequential on one small file; parallelizing would only add integration risk.

## As built (2026-07-24)

Three divergences from the plan above, all driven by a requirement added after the plan was
written: **uniform cell framing with bottom-aligned captions.**

1. **Uniform cells.** `md:auto-rows-[1fr]` equalizes every row to the tallest, so all cells are
   identical and captions share a baseline. Each `figure` is `flex h-full flex-col`, the `img` is
   `min-h-0 flex-1 object-contain` (fills the cell, letterboxes the art), and `figcaption` is
   `mt-auto`. Verified numerically at 768 and 1440: every row reports a single caption-top,
   caption-bottom and cell-height value.
2. **`auto-rows` is `md+` only.** Applying it at one column made every cell as tall as the tallest
   piece, adding **~1,170px of dead scroll** at 360px (page height 5,815 → 6,987) for zero
   alignment benefit, since a single-column item is its own row. Measured, then scoped to `md`.
3. **Six baselines changed, not two.** The plan predicted only `gallery-1440` would move, which was
   true of the widening alone. Uniform cells also change 768 and 1024. `gallery-360` came back
   **byte-identical**, which is the intended proof that the `px-[clamp(...)]` gutter replacement
   exactly reproduces what `main` used to supply.

`gallerySizes` uses the measured column widths (424px at `xl`, 398px at `lg`) rather than the
plan's estimates. At 424px CSS the browser picks the 480w rung, so the 3-column choice keeps a 2×
request inside the 900w rung as intended.

## Resolved decisions

- **Container width — settled 2026-07-24 (user): 1400px, matching Projects.** The alternative
  considered was an unbounded fluid grid (`grid-cols-[repeat(auto-fit,minmax(380px,1fr))]`) that
  keeps adding columns past 3440px; rejected because it breaks the shared measure with Projects
  and pushes columns below the 480w rung on very wide screens. No open questions remain — this
  plan is ready to implement as written.
