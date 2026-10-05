# Combine Projects and Gallery — 2026-10-05

**Agent:** Opus 5.5 (fennel, main) · **Status:** planned, decisions D1, D2, D4, D5 answered; D3 (copy) open · **Branch:** `portfoliowebsite`
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

## Decisions (answered 2026-10-05 unless marked open)

| # | Decision | Answer |
|---|---|---|
| D1 | Combined page | **"Portfolio" at `/portfolio/`.** User: "remove the nav for both and replace with portfolio". Nav becomes Home · Portfolio · Contact; `/projects/` and `/gallery/` 301 to `/portfolio/`. |
| D2 | Project page URLs | **Under the combined page:** `/portfolio/history-of-mistrust/` and `/portfolio/brand/`. |
| D3 | Tile copy | **Open: the user writes the two descriptions** (one or two sentences each); the agent proofreads only. Placeholder copy must not ship. |
| D4 | Tile thumbnails | **Cover + logo:** Mistrust uses its cover slide; Brand uses the bubble logo on its brand background. |
| D5 | Filter rail scope | **Gallery only:** tiles full width across the top; the rail starts with the gallery section. |

## Approach

**Project tile** (`app/components/ProjectTile.tsx`, new). The whole tile is **one link**, the
gallery's one-interactive-element-per-card rule: thumbnail, `<h2>`/`<h3>` title, description, and a
visible "View project →" affordance inside a single `<a>`. At rest it shows a 1px `--brand-border-mid`
outline. On hover and focus it switches to the house hover contract (one purple, the accent ring on
`:focus-visible`), and the arrow nudges right. **No `transition-colors`** on it (Entry 134:
`tests/focus-ring.spec.js` fails a fading ring). Square image in a rounded frame, matching
AGENTS.md. Two tiles side by side from `md`, stacked below `md`, inside the shared
`--brand-content-max` container.

**Combined page** (`app/portfolio/page.tsx`). `PageHeader`, then a "Projects" section with the
tiles, then a "Gallery" section with `GalleryGrid` unchanged. The gallery's sticky rail behaviour
(Entry 133, one-column rule) applies to the gallery section only. Bubble exclusion zones: tiles
register as zones, as gallery artwork already does (AGENTS.md, picture-is-the-wall rule).

**Project pages.** `app/portfolio/history-of-mistrust/page.tsx` renders `MistrustProject` (slideshow,
lightbox, sources). `app/portfolio/brand/page.tsx` renders `BrandProject`. The project components
move from `app/projects/` to `app/portfolio/`. Each gets its own
metadata, canonical and og image, plus a "← Portfolio" link back. This also closes the TODO item
"Standalone 'A History of Mistrust' viewer page". `--brand-rail-overlay` becomes 0 on these pages
because there is no rail any more, which changes `--stage-cap`. Re-measure the one-screen cap
(Entry 133 Trap 6).

**Retire** `ProjectTabs.tsx` and the `/projects/` index. Update `Nav.tsx` and `Footer.tsx` links,
and the `netlify.toml` redirects (below).

**Redirects** (`netlify.toml`). `/projects/` and `/gallery/` → `/portfolio/`, 301. Old hash links like
`/projects/#history-of-mistrust` cannot be redirected server-side (the hash never reaches the
server), so `/portfolio/` reads `location.hash` once and forwards `#history-of-mistrust` and `#brand`
to their pages client-side, and passes `#filter=…` through to the gallery unchanged. The two existing
splat rules retarget: `/projects/history-of-mistrust/*` → `/portfolio/history-of-mistrust/` and
`/projects/brand-avery-ember-day/*` → `/portfolio/brand/`.

## Track table

| Track | Owner | Files (write) | Depends on | Verify |
|---|---|---|---|---|
| T0 decisions | user | — | — | D1–D5 answered |
| T1 project pages | pro nano-agent | `app/portfolio/history-of-mistrust/page.tsx` (new), `app/portfolio/brand/page.tsx` (new); `git mv` of `MistrustProject.tsx`, `MistrustSlideshow.tsx`, `MistrustLightbox.tsx`, `SlideGrid.tsx`, `mistrustSlides.ts`, `useSwipeDeck.ts`, `slideshow.css`, `BrandProject.tsx` from `app/projects/` to `app/portfolio/` (back link added to the two project components) | T0 | `npx tsc --noEmit`, `npm run build:next` |
| T2 tile + combined page | main agent | `app/components/ProjectTile.tsx` (new), `app/portfolio/page.tsx` (new), `brand.css` (tile section only) | T0 (**D3 copy**) | build; headed review in the browser pane |
| T3 routing | main agent | `app/components/Nav.tsx`, `app/components/Footer.tsx`, `netlify.toml`, delete `app/projects/page.tsx` and `app/projects/ProjectTabs.tsx`, move `app/gallery/GalleryGrid.tsx` + `gallery-data.ts` under `app/portfolio/`, delete `app/gallery/page.tsx` | **T1, T2** (routes must exist before links move) | build; `grep -rn "/gallery/\|/projects/" app` returns nothing |
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
   - `/projects/` and `/gallery/` resolve to `/portfolio/`.
   - `/projects/#history-of-mistrust` lands on `/portfolio/history-of-mistrust/`.
   - `/gallery/#filter=digital` lands on `/portfolio/` with the Digital filter active.
   - The old `/projects/brand-avery-ember-day/x` lands on `/portfolio/brand/`.
   - Redirects are checked against `netlify.toml` by reading it; their live behaviour can only be
     proven after deploy.
4. Mistrust page: the one-screen stage cap holds at the 5 breakpoints from `gallery-expand.spec.js`
   (no rail any more).
5. Suite by file list green twice; `npx tsc --noEmit` clean; `npm run css:build` and commit
   `style.css`; `shxdowmap refresh --auto` (new routes).
6. Headed review in the browser pane by the user before any push.

## Risks

- **Old splat redirects:** with the project pages under `/portfolio/`, the two `/projects/…/*`
  rules no longer collide with a real page; they are retargeted (above) rather than left pointing at
  a hash on a page that no longer exists.
- **Visual gate:** page count goes from 5 to 6 (combined, Mistrust, Brand, home, contact, thanks
  if captured). That is 40 baselines → about 48, and they can only be regenerated on Windows (T5).
- **Sticky chrome:** Entry 133's one-column rule and `--stage-cap` / `--art-cap` all read
  `--brand-rail-overlay`. Moving the Mistrust stage off a page with a rail changes the cap. This is
  the same class of late layout shift as Trap 6.
- **SEO:** canonical URLs change. The 301s carry link equity; update `alternates.canonical` on every
  page.
- **Deploy:** this ships in its own 15-credit deploy (Entries 134–136 were released 2026-10-05).

## Related, separate

- **Mistrust Set 1 seam: done first** (Entry 136, 2026-10-05). The mosaic now uses seamless tiles
  from `app/projects/mistrust-tiles.json`; T1 moves that manifest along with `mistrustSlides.ts`
  (it is imported relative to it). The 16 win32 baselines it changed are regenerated in T5.

## Planning shape

Two sessions. Session 1 (T0 answered → T1 ∥ T2 → T3 → T4) on this Mac. Session 2 (T5) on the
Windows box. Forcing reason: the win32 baselines. More than three files, so the track table above
governs. Plan review (one fresh-context `oracle`) runs at the start of session 1, before T1. T1 can start
without D3; T2 cannot ship without it.
**Signoff triggers:** publishing applies only when the deploy is approved. Nothing else (auth,
billing, deletion of user data, messaging) is touched.
