# Combine Projects and Gallery — 2026-10-05

**Agent:** Opus 5.5 (fennel, main) · **Status:** planned, not started · **Branch:** `portfoliowebsite`
**Asked by the user (2026-10-05, verbatim):** "i want to combine the projects and gallery pages. the
projects should contain a thumbnail at the top that lead to each project page (no longer tabbed in
a separate section) and should show an outline around the card and a short description of the
project underneath that makes it clear to the user that it is a clickable tile to another page
visually"

## Goal

One page shows all the work. At the top, one **project tile** per project: a thumbnail, an outline
around the card, and a short description underneath, reading unmistakably as "this opens another
page". Each tile links to that project's **own page**. The gallery grid, with its filter rail and
expand-in-place cards, follows below. The Projects tab interface (`ProjectTabs.tsx`) goes away.

## Decisions the user owns (blocking implementation)

| # | Decision | Recommendation | Why it matters |
|---|---|---|---|
| D1 | URL and nav label of the combined page | **`/work/`, nav label "Work"**, with `/projects/` and `/gallery/` 301-redirecting to it | Neither old name describes both halves. Keeping `/gallery/` or `/projects/` avoids one redirect but mislabels half the page. Nav goes Home · Work · Contact either way. |
| D2 | Project page URLs | `/projects/history-of-mistrust/` and `/projects/brand/` | Readable, and `/projects/history-of-mistrust/` already appears in old links. See Risks for the existing Netlify redirect on that path. |
| D3 | Tile copy | **The user writes the two descriptions** (one or two sentences each); the agent proofreads only | Standing copy rule (TODO, copy pass). Placeholder copy must not ship. |
| D4 | Tile thumbnails | Mistrust: the cover slide. Brand: the bubble logo on its brand background | Needs a yes, or other art. |
| D5 | Does the filter rail span the whole page or only the gallery? | **Gallery only**; the tiles sit full-width above the rail and grid | A rail that filters "Digital / Traditional" makes no sense against two projects. |

## Approach

**Project tile** (`app/components/ProjectTile.tsx`, new). The whole tile is **one link**, the
gallery's one-interactive-element-per-card rule: thumbnail, `<h2>`/`<h3>` title, description, and a
visible "View project →" affordance inside a single `<a>`. At rest it shows a 1px `--brand-border-mid`
outline. On hover and focus it switches to the house hover contract (one purple, the accent ring on
`:focus-visible`), and the arrow nudges right. **No `transition-colors`** on it (Entry 134:
`tests/focus-ring.spec.js` fails a fading ring). Square image in a rounded frame, matching
AGENTS.md. Two tiles side by side from `md`, stacked below `md`, inside the shared
`--brand-content-max` container.

**Combined page** (`app/work/page.tsx` per D1). `PageHeader`, then a "Projects" section with the
tiles, then a "Gallery" section with `GalleryGrid` unchanged. The gallery's sticky rail behaviour
(Entry 133, one-column rule) applies to the gallery section only. Bubble exclusion zones: tiles
register as zones, as gallery artwork already does (AGENTS.md, picture-is-the-wall rule).

**Project pages.** `app/projects/history-of-mistrust/page.tsx` renders `MistrustProject` (slideshow,
lightbox, sources). `app/projects/brand/page.tsx` renders `BrandProject`. Each gets its own
metadata, canonical and og image, plus a "← All work" link back. This also closes the TODO item
"Standalone 'A History of Mistrust' viewer page". `--brand-rail-overlay` becomes 0 on these pages
because there is no rail any more, which changes `--stage-cap`. Re-measure the one-screen cap
(Entry 133 Trap 6).

**Retire** `ProjectTabs.tsx` and the `/projects/` index. Update `Nav.tsx` and `Footer.tsx` links,
and the `netlify.toml` redirects (below).

**Redirects** (`netlify.toml`). `/projects/` → `/work/` and `/gallery/` → `/work/`, 301. Old hash
links like `/projects/#history-of-mistrust` cannot be redirected server-side (the hash never reaches
the server), so the `/work/` page reads `location.hash` once and forwards `#history-of-mistrust` and
`#brand` to their pages client-side. The existing `/projects/brand-avery-ember-day/*` →
`/projects/#brand` rule is retargeted to `/projects/brand/`.

## Track table

| Track | Owner | Files (write) | Depends on | Verify |
|---|---|---|---|---|
| T0 decisions | user | — | — | D1–D5 answered |
| T1 project pages | pro nano-agent | `app/projects/history-of-mistrust/page.tsx` (new), `app/projects/brand/page.tsx` (new), `app/projects/slideshow.css` (import moves), `app/projects/MistrustProject.tsx`, `app/projects/BrandProject.tsx` (back link only) | T0 | `npx tsc --noEmit`, `npm run build:next` |
| T2 tile + combined page | main agent | `app/components/ProjectTile.tsx` (new), `app/work/page.tsx` (new), `brand.css` (tile section only) | T0 (copy and art from D3, D4) | build; headed review in the browser pane |
| T3 routing | main agent | `app/components/Nav.tsx`, `app/components/Footer.tsx`, `netlify.toml`, delete `app/projects/page.tsx` and `app/projects/ProjectTabs.tsx`, delete `app/gallery/page.tsx` | **T1, T2** (routes must exist before links move) | build; `grep -rn "/gallery/\|/projects/'" app` |
| T4 tests | main agent | `tests/smoke-next.spec.js`, `tests/mistrust-slideshow.spec.js`, `tests/mistrust-sets.spec.js`, `tests/sticky-chrome.spec.js`, `tests/bubbles-exclusion.spec.js`, `tests/gallery-expand.spec.js`, `tests/focus-ring.spec.js`, `tests/nav-safari.spec.js`, `tests/mobile-zoom.spec.js`, `tests/visual-baseline.spec.js`, `tests/project-tiles.spec.js` (new), `scripts/measure-content-widths.js` | **T3** | suite by file list, twice |
| T5 visual baselines | main agent on the **Windows box** | `tests/visual-baseline.spec.js-snapshots/*` | **T4** | regenerate win32 baselines, review every image |

T1 and T2 run in parallel (disjoint files; T1 is the only helper). T3 serialises after both because
it removes the routes the old links point to. T4 rewrites every spec that loads `/projects/` or
`/gallery/`, so it waits on T3. **T5 has a forcing reason for its own boundary:** the 40 committed
baselines are `chromium-win32`, so they can only be regenerated on Windows. On this Mac, the darwin
before/after from Entry 134 stands in until then.

## Verification

1. `tests/project-tiles.spec.js` (new):
   - Each tile is exactly one link and reaches the right page.
   - The outline is visible at rest.
   - The accent ring paints immediately on Tab (shares `focus-ring.spec.js`'s walk).
   - The description text is present.
   - Tiles sit side by side at ≥768px and stacked below.
2. Every page Tab walk in `focus-ring.spec.js` updated to the new routes, on both engines.
3. Old URLs:
   - `/projects/` and `/gallery/` resolve to `/work/`.
   - `/projects/#history-of-mistrust` lands on the Mistrust page.
   - The old `/projects/brand-avery-ember-day/x` lands on `/projects/brand/`.
   - Redirects are checked against `netlify.toml` by reading it; their live behaviour can only be
     proven after deploy.
4. Mistrust page: the one-screen stage cap holds at the 5 breakpoints from `gallery-expand.spec.js`
   (no rail any more).
5. Suite by file list green twice; `npx tsc --noEmit` clean; `npm run css:build` and commit
   `style.css`; `shxdowmap refresh --auto` (new routes).
6. Headed review in the browser pane by the user before any push.

## Risks

- **The Netlify splat redirect `/projects/history-of-mistrust/*` → `/projects/#history-of-mistrust`
  would swallow the new page.** Netlify skips a non-forced rule when a file exists at the path, so
  `/projects/history-of-mistrust/index.html` should win. Remove or retarget the rule anyway rather
  than rely on shadowing.
- **Visual gate:** page count goes from 5 to 6 (combined, Mistrust, Brand, home, contact, thanks
  if captured). That is 40 baselines → about 48, and they can only be regenerated on Windows (T5).
- **Sticky chrome:** Entry 133's one-column rule and `--stage-cap` / `--art-cap` all read
  `--brand-rail-overlay`. Moving the Mistrust stage off a page with a rail changes the cap. This is
  the same class of late layout shift as Trap 6.
- **SEO:** canonical URLs change. The 301s carry link equity; update `alternates.canonical` on every
  page.
- **Deploy:** this ships in the same 15-credit deploy as whatever is still unpushed (currently Entries
  134–135). Batch on purpose.

## Related, separate

- **Mistrust Set 1 seam** (TODO, 2026-10-05): images 1 and 2 of Set 1 need a seamless replacement.
  It touches `mistrust-sets.spec.js`, which T4 also edits. Do it before or after this plan, not
  interleaved.

## Planning shape

Two sessions. Session 1 (T0 answered → T1 ∥ T2 → T3 → T4) on this Mac. Session 2 (T5) on the
Windows box. Forcing reason: the win32 baselines. More than three files, so the track table above
governs. Plan review (one fresh-context `oracle`) runs once D1–D5 are answered, before T1 starts.
**Signoff triggers:** publishing applies only when the deploy is approved. Nothing else (auth,
billing, deletion of user data, messaging) is touched.
