# Combine Projects and Gallery — 2026-10-05

**Agent:** Opus 5.5 (fennel, main) · **Status:** in progress. D1, D2, D4, D5 answered; D3 drafted by the agent at the user's request, awaiting the user's OK · **Branch:** `portfoliowebsite`
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

## Plan review (oracle/opus, 1 round, FAIL), fixed here without a second round

The reviewer applied the old T1 move list in a scratch copy and got 6 `tsc` errors, then applied
all moves together and got a clean `tsc`, a clean `next build`, and the three `out/portfolio/…`
pages. Findings adopted:

- **F1 / F2 / F3: one atomic restructure.** The move must take `mistrust-tiles.json` with it, retire
  `app/projects/page.tsx` and `ProjectTabs.tsx` in the same step, and repoint
  `scripts/generate-mistrust-assets.js` (`TILE_MANIFEST`) and `tests/mistrust-sets.spec.js` at the
  new path. Moving the gallery files at the same time removes the double write to
  `app/portfolio/page.tsx`. All of this is coupled through imports, so it is one main-agent track.
- **F4: one Next build at a time.** `out/` is shared, and `next build` kills a running `next dev`.
  The spec helper works in its own worktree and never builds there.
- **F5 / F6: the dependency column follows the decisions.** D1, D2, D4 and D5 are answered. D3
  (copy) is drafted by the agent at the user's request (2026-10-05) and needs the user's OK before
  push. Nothing waits on it except the push.
- **F7 / F8: Windows baselines, before the single push.** Baseline commits are not docs-only, so
  committing them after the code push bills a second deploy. They are regenerated on SOL **before**
  the one push. Doing so needs the code on SOL (the Mac's home is `M:` there) and the user's
  go-ahead for SOL. If SOL is unavailable, the push waits or the user accepts a second deploy;
  that is the user's call.
- **F9: bubbles.** Each tile's thumbnail is a plain `<img>` (Mistrust: `slides/slide-01@2x.webp`;
  Brand: `images/icons/BubbleLogo/bubbleLogo.png`), so `FRAME_ZONE_SELECTOR` (`'img, …'`) makes
  the picture a zone and the card is not one, matching the picture-is-the-wall rule. Never inline
  `BubbleLogo.tsx` here. New case in `bubbles-exclusion.spec.js`.
- **F10: the outline is visible.** At rest the tile has a 1px `--brand-text-muted` border (about 8:1
  in dark, 5:1 in light), switching to `--brand-accent` with the house purple hover and focus ring.
  `--brand-border-mid` (about 1.3:1) is not used.
- **Nits adopted:**
  - Hash forwarder: `location.replace`, and `#filter=` scrolls to the gallery.
  - Explicit redirect order; a post-deploy `curl -sI` check of each old URL.
  - `aria-current` on Portfolio for `/portfolio/<project>/`.
  - Each project page gets its own `h1`.
  - The shared og card is reused, so there is no per-project image.
  - Mistrust is the first tile.
  - AGENTS.md and `brand.css` comment references updated; `style.css` rebuilt in track A.
  - A placeholder marker (`TILE-COPY-PENDING`) is grepped before push.
  - The arrow nudge respects reduced motion.
  - The visual spec is excluded on the Mac.
  - A Final signoff runs before the push.
  - The "standalone viewer" TODO stays open; its numbered bibliography is not in scope.

## Track table

| Track | Owner | Files (write) | Depends on | Verify |
|---|---|---|---|---|
| A restructure | main agent | `git mv` of `app/projects/{BrandProject,MistrustProject,MistrustSlideshow,MistrustLightbox,SlideGrid,useSwipeDeck}.tsx/.ts`, `mistrustSlides.ts`, `mistrust-tiles.json`, `slideshow.css`, and `app/gallery/{GalleryGrid.tsx,gallery-data.ts}` into `app/portfolio/`; delete `app/projects/page.tsx`, `app/projects/ProjectTabs.tsx`, `app/gallery/page.tsx`; new `app/portfolio/page.tsx`, `app/portfolio/history-of-mistrust/page.tsx`, `app/portfolio/brand/page.tsx`, `app/components/ProjectTile.tsx`; `app/components/Nav.tsx`, `app/components/Footer.tsx`, `netlify.toml`, `scripts/generate-mistrust-assets.js`, `brand.css`, `style.css`, `AGENTS.md` | D1, D2, D4, D5 (answered) | `npx tsc --noEmit`, `npm run build:next`, headed review in the pane |
| B spec URLs | pro nano-agent, own worktree, **no builds** | the 10 specs under `tests/` that load `/projects/` or `/gallery/` (excluding `visual-baseline.spec.js`, which is track D), `scripts/measure-content-widths.js` | D1, D2 (answered); runs **in parallel with A** | `node --check` per file; real run after merge |
| C new specs and suite | main agent | `tests/project-tiles.spec.js` (new), `bubbles-exclusion.spec.js` tile case, `mistrust-sets.spec.js` manifest path; merge of B | **A and B** | suite by file list, twice |
| D visual baselines | main agent on **SOL** over SSH | `tests/visual-baseline.spec.js` (page list), `tests/visual-baseline.spec.js-snapshots/*`, with the orphaned `projects-*` and `gallery-*` PNGs deleted | **C**, plus the user's go-ahead for SOL | regenerate, review every image |
| E release | main agent | — | **D**, the user's OK on the tile copy (D3), Final signoff PASS | one push, live `curl` checks |

A and B launch together; that is the useful parallelism, since everything in A couples through
imports.
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
