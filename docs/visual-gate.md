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
| Baselines | `tests/visual-baseline.spec.js-snapshots/` — **48 PNGs**, `-chromium-linux` |
| Failure artifacts | `test-results/` — actual, expected, and diff PNGs |
| Coverage | 6 pages × 4 breakpoints × 2 themes |
| Pages | `index`, `portfolio`, `portfolio-mistrust`, `portfolio-brand`, `portfolio-section-6`, `contact` (since 2026-10-06; `projects`, `projects-mistrust` and `gallery` retired with the Portfolio merge; SECTION 6 added 2026-10-13) |
| Breakpoints | 360, 768, 1024, 1440 |
| Themes | light, dark |

`portfolio-mistrust` and `portfolio-brand` are the project pages, `/portfolio/history-of-mistrust/`
and `/portfolio/brand/`. Since 2026-10-20 the baselines are `chromium-linux`, captured in the
official Playwright image on linux/amd64; the `chromium-win32` set captured on SOL is gone.

## Running it

The gate runs **only in the Playwright container**. The spec skips itself unless
`VISUAL_CONTAINER=1`, which the runner sets, so a host `npm test` on macOS or Windows reports
the 48 captures as skipped instead of failing and writing a stray platform set.

```bash
node tests/visual-docker.mjs                          # the gate (needs Docker running)
node tests/visual-docker.mjs -g "portfolio @ 1440"    # one case
node tests/visual-docker.mjs --update-snapshots=all   # regenerate; see "Accepting a change"
npm test                                              # everything else, on the host
```

`tests/visual-docker.mjs` runs `mcr.microsoft.com/playwright:v<version>-noble`, the version being
the `@playwright/test` the lockfile pins, with `--platform linux/amd64`. The repo is bind-mounted at
`/work`; named volumes (`portfolio-visual-node-modules`, `portfolio-visual-next`) cover
`node_modules` and `.next`, so the host's macOS or Windows binaries never meet the container, and
`npm ci` reruns inside only when the lockfile changes. It lives under `tests/` and is not an npm
script on purpose: `netlify.toml`'s ignore rule skips pushes that touch only `tests/` and docs, and
a `package.json` or `scripts/` change would make such a push a 15-credit production build.

**Why amd64:** hosted runners and SOL are x86-64, and Chromium's rasteriser is not guaranteed
identical on arm64. On VOID (Apple Silicon) Docker comes from Colima, started with
`colima start --vm-type vz --vz-rosetta`, so the image runs under Rosetta. That the Rosetta capture
matches a native x86-64 host pixel for pixel is expected, not yet proven: no native Docker host has
run the gate yet. SOL has no Docker (no WSL since its reinstall).

**Never run the host suite and the container gate at the same time.** Both build into the same
`out/` through the bind mount, and a build mid-run is Trap 2.

The server is started **inside `tests/global-setup.js`**, not by `webServer.command`. This is
load-bearing — see [Trap 2](#trap-2--the-gate-graded-a-stale-out).

## Accepting an intentional visual change

```bash
node tests/visual-docker.mjs --update-snapshots=all   # rewrite baselines
# → REVIEW THE REGENERATED PNGs
node tests/visual-docker.mjs                          # must pass
node tests/visual-docker.mjs                          # must pass again
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
node tests/visual-docker.mjs --update-snapshots=all -g "<test name>"
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

### Trap 6 — a late layout shift the image and font waits cannot see

`useStickyRailOverlay` publishes the pinned strip's height to `--brand-rail-overlay` from a
`useEffect` + ResizeObserver, so it lands **after first paint**. `--stage-cap` and `--art-cap` are
computed from it, which means the Mistrust stage and the gallery art resize once more after images,
fonts and two composited frames have all already settled.

Symptom is distinctive and worth recognising: Playwright reports **"Failed to take two consecutive
stable screenshots"** rather than a plain mismatch, with a large pixel count (125,968 on
`projects-mistrust @ 768px — light`, 2026-08-10) — and it passes on immediate re-run.

The gate now waits for `document.documentElement.scrollHeight` to hold steady across three
consecutive animation frames. Height rather than the token itself, deliberately: it catches any late
reflow including ones nobody has thought of yet, and it does not need to know which pages have a
rail. If you add anything that sizes itself from JS after mount, this is what keeps the gate honest.

### Trap 7 — sub-pixel text noise on pages that render semibold webfonts

Found 2026-10-06, regenerating all 40 baselines on SOL for the Portfolio merge. Each fresh set
failed its own re-capture on one or two pages, a different page each time, always among the
portfolio and project pages, never home or contact. The diffs were 600 to 1,100 pixels, only
on text set in Outfit and Inter. The glyphs looked identical, with ink within 0.2%. Those pages
are the ones that load the **600** weights; home and contact never do.

Tried in order, each a real improvement, none a full cure:

1. **Wait for every face the page renders**, read off the DOM, instead of a fixed list.
   A fixed `600 Outfit` would hang home and contact, which never load it.
2. **Launch flags for the visual spec only:** `--font-render-hinting=none` and `--disable-lcd-text`,
   then `--disable-font-subpixel-positioning`.
3. **Pass each font the exact text it renders** to `document.fonts.load()`. Google Fonts splits
   faces into per-unicode-range files, and a bare `load(font)` fetches only the default sample's.

After all three, about one page in every five runs still differed. So the visual spec retries
once, **on the three semibold pages only** (`semibold: true` in the page list); home and contact
keep strict single-attempt grading. Noise does not repeat, and a real regression fails both
attempts. A missing baseline is never retried.

Soak after the retry: **5 runs, 0 hard failures**, 3 captures passing on retry. The flags change
how every page renders in the gate, so **never drop one without regenerating all 40.**

All of the above was measured on Windows. The Linux container keeps the flags and the retry.

**Where baselines come from now (since 2026-10-20):** the container, on any machine with Docker.
Until then they came from SOL over SSH, because the set was `chromium-win32`.

1. `node tests/visual-docker.mjs --update-snapshots=all`, then **two** re-checks without the flag.
   **Not** the bare `--update-snapshots`: since Playwright 1.50 it means `changed`, which rewrites
   only captures that FAIL, and a change under the 500px floor passes. On 2026-10-09 the footer's
   new Home link moved every page by 186-196px at md+, so the bare flag left 26 baselines showing a
   footer without it while all 40 re-checks went green.
2. Review every regenerated image, then commit.

Before trusting a new machine or a reinstall, compare the pre-change commit first. All untouched
pages must pass; on 2026-10-06 that was 24 of 24 at `c6b83aa`.

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

**Status: half done.** The local container half landed 2026-10-20 (steps 1, 2 and 4 below,
with Colima instead of Docker Desktop). Running it in **hosted** CI (step 3) is still open: the
standing rule is no GitHub Actions unless the user asks, so it waits on that call.

Netlify runs only `next build`; there is no `.github/workflows` in this repo. So the gate is
local and opt-in, and a visual regression deploys unchallenged if nobody runs
`node tests/visual-docker.mjs`.

**Decision made 2026-07-23 (user):** containerize capture — run Playwright in the official
`mcr.microsoft.com/playwright` image both locally *and* in CI, so one Linux snapshot set is
canonical.

**Why it cannot simply be switched on:** the 40 committed baselines are suffixed
`-chromium-win32`. They were captured on Windows and a Linux runner cannot reuse them — font
rendering and antialiasing differ enough to fail every comparison. Adopting the container therefore
requires a **one-time regeneration of all 40 baselines** inside it, reviewed like any other bulk
update.

**Prerequisite, recorded 2026-08-03: Docker is not installed on this machine.** Resolved
2026-10-20 on VOID with Colima. Sequence:

1. ~~Install Docker Desktop.~~ Done with Colima (`brew install colima docker`).
2. ~~Regenerate all 40 baselines inside `mcr.microsoft.com/playwright`, review them, commit.~~
   Done for all 48, 2026-10-20.
3. Add the container run to CI. **Open**, waiting on the user's call on hosted CI.
4. ~~Delete the `-chromium-win32` set.~~ Done 2026-10-20.

Note that step 2 replaces every baseline, so it should not be interleaved with other visual work.
Land visual changes first, then re-baseline once.

Raised by the Entry 081 shippability review; carried from
`plans/2026-07-22-visual-baseline-gate-shxdowloop.md`, archived 2026-08-09 into
[`archives/plans.md`](archives/plans.md#consolidation-stubs-2026-08-09).
