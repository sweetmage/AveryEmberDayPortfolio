# The visual regression gate

The single reference for `tests/visual-baseline.spec.js` — what it covers, how to accept an
intentional change, why its two tolerance values are what they are, and the ways it has been broken
before. Operational rules live in [`AGENTS.md`](../AGENTS.md); this file is the detail behind them.

Related: [`ARCHITECTURE.md`](ARCHITECTURE.md) → Testing Model, LOGBOOK Entries 081 / 089 / 099 / 115.

---

## What it is

A **compare-based** gate, not a capture-only one. It fails the build on unintended visual change and
leaves the working tree clean. It was capture-only until 2026-07-22 (Entry 081) — capturing
screenshots and never diffing them, which looks identical to a working gate right up until it
matters.

| | |
|---|---|
| Spec | [`tests/visual-baseline.spec.js`](../tests/visual-baseline.spec.js) |
| Baselines | `tests/visual-baseline.spec.js-snapshots/` — **40 PNGs** |
| Failure artifacts | `test-results/` — actual, expected, and diff PNGs |
| Coverage | 5 pages × 4 breakpoints × 2 themes |
| Pages | `index`, `projects`, `projects-mistrust`, `gallery`, `contact` |
| Breakpoints | 360, 768, 1024, 1440 |
| Themes | light, dark |

`projects-mistrust` is the `#history-of-mistrust` deep link, and the spec clicks the tab before
capturing so the panel is actually open.

## Running it

```bash
npm test                                  # whole suite (151 tests as of 2026-08-10)
npx playwright test visual-baseline       # just the gate
npx playwright test -g "gallery @ 1440"   # one case
```

The server is started **inside `tests/global-setup.js`**, not by `webServer.command`. This is
load-bearing — see [Trap 2](#trap-2--the-gate-graded-a-stale-out).

## Accepting an intentional visual change

```bash
npm test -- --update-snapshots   # rewrite baselines
# → REVIEW THE REGENERATED PNGs
npm test                          # must pass
npm test                          # must pass again
```

Three rules, each of which exists because skipping it caused a real defect:

1. **Review the regenerated PNGs before committing them.** An unreviewed update defeats the gate
   entirely — it turns "this changed" into "this is now correct" without anyone looking.
2. **Green twice in a row.** One green run does not prove stability.
3. **Never use snapshot mtimes to check an update was complete.** `--update-snapshots` only rewrites
   snapshots whose pixels changed, so unchanged files legitimately keep old timestamps. A mixed set
   of mtimes is normal, not evidence of a skip. Re-running the suite is the only trustworthy check.

## The two tolerance values

Both were derived empirically. Neither is a default, and neither should be relaxed without redoing
the experiment that set it.

### `threshold: 0.02` — per-pixel colour sensitivity

Playwright's default is `0.2`, which is far too loose here. Measured: an 8-point shift in
`--brand-text-soft` (`#d7d7d1` → `#cfcfc9`) **across the entire dark theme** registered *zero*
differing pixels and the suite passed (Entry 081).

### `maxDiffPixels: 500` — absolute floor

Replaced `maxDiffPixelRatio: 0.001` on 2026-07-25 (Entry 099). A **ratio** scales with page height,
so the taller the page the larger the real regression it swallows. Measured: a genuine 4px shift of
the whole nav-links group is only ~1,600 differing pixels and passed unnoticed for a week on pages
2,500–4,300px tall — the 1440×2559 projects page allowed ~3,685 pixels before failing (Entry 089).

The absolute floor catches furniture-sized changes regardless of page height.

**Proven live, not assumed:** an injected 2px nav border went red on **all 40** snapshots.

> **Injection gotcha for future proofs.** A plain declaration in `site.css` loses the cascade to
> Tailwind's utilities layer, so your injected "regression" silently does nothing and the suite stays
> green — which reads as the gate failing. Use `!important` when injecting a test regression.

## What the gate cannot see

**Anything that only exists in motion.** Captures run under `prefers-reduced-motion: reduce`, where
`bubbles.js` returns before creating a single bubble. That determinism is exactly what makes the
captures stable, and it means **the entire bubble system is invisible to this gate**. A regression
that put bubbles across the hero logo survived a week unnoticed (Entry 090).

That blind spot is covered separately by `tests/bubbles-exclusion.spec.js`, the only motion-enabled
spec. See [Motion-enabled specs](#motion-enabled-specs) below.

**Anything below the fold that fails to load or paint.** Handled explicitly rather than by sleeping:
lazy images are forced eager and awaited, `decoding="async"` images are explicitly `decode()`d,
`document.fonts.ready` is awaited, and two rAFs let the compositor finish. Removing any of these
reintroduces a partial-paint baseline (gallery images captured half-rendered).

**Layout geometry.** `scripts/measure-content-widths.js` exists because the visual suite structurally
cannot replace it — a consistent wrong width looks correct to a screenshot diff (Entry 107).

## Traps

### Trap 1 — a bulk `--update-snapshots` can silently skip files

Seen twice on 2026-07-23 (Entry 082): a full-suite update left 3 of 40 snapshots un-rewritten, then a
later one left 2. The next run "fails" against baselines still showing the *previous* design, which
reads exactly like a real regression.

Fix: re-run the specific tests, which writes them reliably.

```bash
npx playwright test --update-snapshots -g "<test name>"
```

### Trap 2 — the gate graded a stale `out/`

`next build` runs in `tests/global-setup.js`, **not** in `webServer.command`. Playwright starts
`webServer` *before* `globalSetup`, and `reuseExistingServer` skips the command when the port is
already held — so the suite served and graded a stale export. Compounding it, `build:next` deletes
and recreates `out/`, which yanks the directory out from under an already-running `serve` and
produces `ECONNRESET`. The only reliable ordering is build first, then serve (Entry 081).

Port **4322**, deliberately not 3000/3001, so the suite can never silently adopt a running
`next dev`.

### Trap 3 — `test.use({ reducedMotion })` is silently ignored

On Playwright 1.61.1 the declarative option does nothing for `reducedMotion`, leaving the bubble
engine running and captures unstable. Reduced motion must be applied with `page.emulateMedia()`.
`colorScheme` and `viewport` from the same `test.use` call *do* apply, which is what makes this
convincing and wrong.

### Trap 4 — mentioning a Tailwind class in a Markdown file changes the shipped CSS

`app.css` and `app/globals.css` scan the repo for class names, and until 2026-07-23 that included
`LOGBOOK.md` / `TODO.md` / `docs/`. Merely *writing* `gap-0` in a changelog recompiled that class
into the shipped stylesheet and moved baselines (Entry 082). `@source not` rules now exclude
`**/*.md`, `docs/**`, `out/**`, `test-results/**`. Keep those exclusions in both entry files.

### Trap 5 — `document.fonts.ready` resolves against an empty font set

The webfonts arrive through a remote `@import` of Google Fonts in `app/globals.css`. Until that
stylesheet lands there are **no `@font-face` rules registered at all**, and `document.fonts.ready`
resolves immediately, because every one of zero fonts has finished loading. The capture then renders
in the fallback.

What it looks like is the reason it survived: only `--brand-font-display` text is affected above the
fold, so the entire diff is a couple of thousand nav-glyph pixels with the rest of the page
byte-identical. It reads as antialiasing noise, not as "the fonts were missing".

Found 2026-08-10 by running the suite three times in a row: three **different** pages failed on the
three runs (index @1440 both themes plus projects @768/@1440, then contact @768 dark), and every one
passed on immediate re-run. Different-page-each-time is the signature — a real regression fails the
same page every time.

The gate now waits for the faces to exist *and* report loaded, not merely for `fonts.ready`. Check
against the faces the site actually requests (`400 Sriracha`, `500 Outfit`, `400 Inter`); the import
URL also declares weights the site never uses, and `document.fonts.check()` returns false for those
forever, so adding one to the list hangs the wait until its timeout.

## Motion-enabled specs

`tests/bubbles-exclusion.spec.js` is the counterpart to this gate — the only spec that runs with
motion on. Two rules for anything written in that style:

- **`test.describe.configure({ mode: 'serial' })`.** The engine integrates a fixed velocity *per
  frame* rather than scaling by elapsed time, so concurrent runs starve rAF and leave bubbles grazing
  zone edges — which reads exactly like a real regression.
- **Sample per animation frame, not per millisecond**, for the same reason. A time-based sample
  observes fewer frames of motion under load and under-reports. Frame-based sampling needs a raised
  `test.setTimeout`, since wall-clock duration then depends on the frame rate the worker gets.

**Skip bubbles at `opacity <= 0.05`.** `resolveZoneCollisions` ignores bubbles flagged
`_relocating`, which the deadlock rescue holds for ~560ms while a trapped bubble fades out *at its
old position inside the zone*. Measuring it there reports a fading bubble as coverage. This caused a
~1-in-3 flake that survived two wrong fixes, both of which blamed worker contention (Entry 115).

> **When a physics assertion goes red intermittently, suspect the engine's own escape hatches before
> the scheduler — and never raise a tolerance to make it green.**

## Open item — running the gate in CI

**Status: not implemented. Blocked on a prerequisite, not on a decision.**

Netlify runs only `next build`; there is no `.github/workflows` in this repo. So the gate is
local and opt-in, and a visual regression deploys unchallenged if nobody runs `npm test`.

**Decision made 2026-07-23 (user):** containerize capture — run Playwright in the official
`mcr.microsoft.com/playwright` image both locally *and* in CI, so one Linux snapshot set is
canonical.

**Why it cannot simply be switched on:** the 40 committed baselines are suffixed
`-chromium-win32`. They were captured on Windows and a Linux runner cannot reuse them — font
rendering and antialiasing differ enough to fail every comparison. Adopting the container therefore
requires a **one-time regeneration of all 40 baselines** inside it, reviewed like any other bulk
update.

**Prerequisite, recorded 2026-08-03: Docker is not installed on this machine.** That is the actual
blocker. Sequence when picking this up:

1. Install Docker Desktop.
2. Regenerate all 40 baselines inside `mcr.microsoft.com/playwright`, review them, commit.
3. Add the container run to CI.
4. Delete the `-chromium-win32` set — keeping both invites grading against the wrong one.

Note that step 2 replaces every baseline, so it should not be interleaved with other visual work.
Land visual changes first, then re-baseline once.

Raised by the Entry 081 shippability review; carried from
`plans/2026-07-22-visual-baseline-gate-shxdowloop.md`, archived 2026-08-09 into
[`archives/plans.md`](archives/plans.md#consolidation-stubs-2026-08-09).
