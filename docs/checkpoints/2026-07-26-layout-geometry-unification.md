# Checkpoint — 2026-07-26 · Layout geometry unification

**Commit:** `f3b8a2caac5196a44c630543ec42468a49801b4b` (`f3b8a2c`)
**Branch:** `portfoliowebsite` (production — this SHA is deployed)
**Previous production SHA:** `641ed93`
**Logbook:** Entry 100

A known-good restore point. Everything below was verified on this exact tree
before it was pushed.

## What this SHA contains

Pushing `portfoliowebsite` fast-forwarded five commits, not one:

| SHA | Change |
|---|---|
| `f3b8a2c` | Projects/Gallery content geometry unified (Entry 100) |
| `183c50f` | Entry 099 docs |
| `272b3af` | Gallery filter restructured as a vertical left rail |
| `ea5a4be` | Visual gate hardened — server into `globalSetup`, stdio deadlock, `maxDiffPixels` floor |
| `15fe32d` | Bubble test flake fixed via frame-based sampling |

## The layout change

One container recipe now serves both pages, because the page title, its
spectrum underline, and the tab/filter rail have to share a left edge:

- Outer container `mx-auto max-w-[1400px]`, **no** horizontal padding.
- The 24px gutter comes from the children — `px-6` on `PageHeader`, on the
  tablist / filter bar, and on the panel or grid.
- The rail keeps `px-6` at `lg` (not `lg:px-0`); that right 24px is the
  rail-to-content gutter, taken out of the fixed 260px column so the tabs
  narrow rather than the content shifting.

Replaces three competing recipes that put the title bar, the Projects tabs and
the Gallery filters on left edges of 60 / 40 / 20px at 1440, diverging further
as the viewport grew. Full rationale in `AGENTS.md` § Wide-screen-first layout
verification.

## Verified state at this SHA

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build:next` | clean, 8/8 static pages |
| `npx playwright test` | **53/53**, re-run after `--update-snapshots` |
| Visual baselines | 40 total, 24 regenerated and adjudicated in both themes |
| Geometry probe | `barLeft === tabLeft` and `leftInset === rightInset` at 360 / 768 / 1024 / 1440 / 2200 / 2560 / 3440, both pages, both themes |
| Horizontal scroll | `scrollWidth === clientWidth` at every width probed |

The 53/53 is from the run *after* regenerating snapshots — which is the only
evidence that no bad baseline was written. See the standing rule in `TODO.md`:
a green `--update-snapshots` run proves nothing on its own.

## Restoring to this point

```bash
git checkout portfoliowebsite
git reset --hard f3b8a2c    # discards later local work — check `git log` first
git push --force-with-lease origin portfoliowebsite
```

Force-pushing `portfoliowebsite` republishes production. Per `docs/NOTES.md`,
that needs the user's explicit go-ahead in the moment.

Baselines are `-chromium-win32` suffixed, so they only regrade correctly on
Windows until the containerization item in `TODO.md` lands.

## Known-open at this checkpoint

- Visual gate is not wired into CI — `netlify.toml` runs `next build` and
  publishes with no test step, so a regression deploys unchallenged if the
  suite is skipped locally. Blocked on the container re-baseline decision.
- Contact link stays commented out in `Nav.tsx` / `Footer.tsx`; 360px nav has
  0px slack, so a third label overflows.
- `images/og-default.png` is still a generated placeholder.
