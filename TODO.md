# TODO

> **This file is the complete surface for open work.** Every plan in `docs/plans/` has been
> reconciled against `LOGBOOK.md` and `git log` as of 2026-07-24; no plan doc holds an unchecked
> item that isn't represented here. Plan docs record *how* something was built — they are not a
> second to-do list.

## Active Plans

_None. All written plans are complete; see **Completed plans** below._

### Awaiting a user step

- **Enable Netlify form detection**, then re-enable Contact. Plan:
  `docs/plans/2026-07-14-nav-restructure.md`. This is a dashboard UI toggle plus one test
  submission — an agent cannot do it. Once it's on, uncomment the Contact links in `Nav.tsx` and
  `Footer.tsx` (commented out in `144a190`) and re-baseline. **Do the 360px nav-fit fix under
  *Standalone* first** — a fourth label overflows the pill group. (Rest of the plan complete:
  Entries 075/077/078.)

### Completed plans

- `2026-07-23-nav-button-restyle.md` — nav buttons restyled to a square, no-chrome-at-rest group;
  scope grew to cover the logo-as-home-button, Home-link removal, left grouping, project-tab
  restyle and the 360px hero overflow fix. Entries 082–087, merged `098f0b1` 2026-07-24.
- `2026-07-22-visual-baseline-gate-shxdowloop.md` — visual baselines converted from capture-only to
  a real compare-based gate. Entry 081, commits `833d46a` → `6ddccd2`, merged `098f0b1`.
- `2026-07-14-nav-restructure.md` / `-wrapup-shxdowloop.md` — Home/Projects/Gallery/Contact
  restructure. Entries 075–078; deployed 2026-07-22. Contact re-enable is the one leftover, listed
  above.
- `2026-07-15-projects-vertical-tabs.md` — sticky vertical Projects rail at `lg+`. Shipped to production 2026-07-22 (Entries 079, 080).
- `2026-07-13-srcset-variants.md` — srcset/@2x thumbnail variants. Done 2026-07-13, commit `f63671d` (Entry 073).
- `2026-07-12-motion-load-perf.md` — time-to-motion / TTI reductions. Deployed 2026-07-13, commits `249b1b4` + `62ff597` (Entry 072).

_All prior plans are consolidated in `docs/archives/plans.md` (see the Consolidation Stubs section at the bottom for the 2026-07-12 batch)._

---

## Open Task Threads

_These are backlog items that don't currently have a written plan. Historical retrospectives moved to `LOGBOOK.md` / `docs/archives/plans.md`._

### Gallery tag system (explicitly deferred by user 2026-07-14 — nav restructure first)
- [x] Design tag taxonomy — done 2026-07-14. Medium split is **Digital (4: In Danger, Chill, Gross, Emergence) / Painting (5: Faces, Lollipop, Overflow, Beheaded, Shadow) / Drawing (2: Stairs — colored pencil, TX Lake Landscape — pastel)**; no photography, so the originally suggested mixed-media/photography buckets don't apply. **Needs user confirmation of per-work assignments before shipping.**
- [ ] Implement filter UI in `app/gallery/page.tsx` (all / medium toggles; page must become a server-metadata + client-grid split)
- [ ] Wire tag metadata into gallery items
- [ ] Verify responsive layout with filter bar at 360 / 768 / 1024 / 1440 px

### History of Mistrust — post-framework polish
- [ ] Final polish on the continuous horizontal carousel
- [ ] Standalone viewer page with all canonical slide content + numbered bibliography

### Standalone
- [ ] **Widen the gallery page.** The grid is capped at `max-w-[900px]` with `md:grid-cols-2`
  (`app/gallery/page.tsx:58`), so on a 1920px+ display the artwork occupies under half the
  viewport while the Projects page now runs to `lg:max-w-[1400px]`. Widen the cap and consider a
  third column at `xl`, keeping `[&_img]:max-h-[70vh]` so tall pieces still fit without scrolling.
  Check against the wide-screen convention below (verify at 2560px and 3440px, both themes) and
  re-baseline the 8 gallery snapshots. Note `.gallery-item` is a bubble exclusion zone, so the
  rail of bubbles will redistribute — expect the gallery captures to change more than the layout
  diff alone suggests.
- [ ] Watermark artwork
- [x] **Homepage scrolls horizontally at narrow widths.** Fixed 2026-07-24 (Entry 085):
  `overflow: hidden` added to `.brand-hero` clips the `.brand-hero-blobs` layer
  (`inset: -20%`) so it cannot spill into the document scrollbox. Verified:
  `scrollWidth === clientWidth` at 360px.
- [x] **Delete the out-of-cascade CSS duplicates.** `src/css/components.css` and
  `src/css/tokens.css` removed 2026-07-24 (Entry 086). Verified zero live imports;
  `style.css` byte-identical after rebuild.
- [ ] **Re-check nav fit before re-enabling the Contact link.** The nav pill group at 360px
  has only ~6px of slack with three labels (Entry 082); a fourth will overflow. Whoever
  uncomments Contact in `Nav.tsx`/`Footer.tsx` needs to either shrink the 360px padding
  clamp or move to a drawer at that width.
- [ ] **Run the visual gate in CI.** The gate is now real (Entry 081) but opt-in — `netlify.toml` runs `next build` + publish with no test step, so a visual regression deploys unchallenged if `npm test` is skipped locally. **Blocked on a decision:** snapshots are `-chromium-win32` suffixed, so a Linux CI runner cannot reuse them. **Decision made 2026-07-23 (user):** option (c) — containerize capture (run Playwright in the official `mcr.microsoft.com/playwright` image locally *and* in CI) so one Linux snapshot set is canonical. Not yet implemented; needs a one-time regeneration of all **40** baselines under the container. Raised by the Entry 081 shippability review. **This is the only open item carried over from a plan doc** (`2026-07-22-visual-baseline-gate-shxdowloop.md`, whose Risks section points here rather than re-planning it).

- [ ] **The visual gate's tolerance scales with page height — tighten it.** `maxDiffPixelRatio: 0.001`
  is a ratio of *total page area*, so the taller the page the larger the real regression it swallows.
  Measured 2026-07-24 (Entry 089): a genuine 4px shift of the whole nav-links group is only ~1,600
  differing pixels and passed unnoticed on every page for a week, on pages 2,500-4,300px tall.
  Options: a small absolute `maxDiffPixels` floor alongside the ratio, or per-region assertions for
  fixed-height furniture like the nav. **Deferred, not skipped:** changing the tolerance re-grades
  all 40 baselines and will surface further latent drift, so it wants its own run — and it should be
  decided together with the containerization item above, since that regenerates every baseline
  anyway. Doing both in one pass avoids two full re-baselines.

- [x] **Bubble engine had zero automated coverage.** The visual gate captures under
  `prefers-reduced-motion`, where the engine creates no bubbles at all, so the whole system was
  invisible to the suite — a regression that put bubbles across the hero logo survived from Entry
  083 to 2026-07-24. Closed by `tests/bubbles-exclusion.spec.js` (Entry 090), the only spec that
  runs with motion enabled. Proven to fail: with `.hero-logo` removed from the exclusion lists,
  3 of its 4 tests go red.

### Architecture remediation follow-ups (deferred from 2026-07-01)
- [ ] Replace generated placeholder `images/og-default.png` with final design asset

---

## Recently Completed

Full details are in `LOGBOOK.md` (newest-first). Headline items since 2026-07-01:

- **2026-07-24** — Nav gutters tightened to hug the viewport edges (6px desktop / 4px mobile, symmetric); all 40 baselines regenerated and adjudicated as nav-band-only (Entry 092). Projects tabs added to the bubble exclusion zones — the same silent-drop bug as the hero logo, this time from the Entry 085 rename `.brand-btn` → `.project-tab` (Entry 093). Both feature branches merged to `portfoliowebsite` (Entry 091).
- **2026-07-24** — Fixed bubbles/blobs covering the hero logo and name: `.hero-logo` was silently dropped from the bubble exclusion zones when the mark was inlined as an `<svg>` (the list matches the `img` tag), and hero blobs never had avoidance at all. Added the repo's first bubble-engine tests (Entry 090).
- **2026-07-24** — Deleted out-of-cascade CSS duplicates (`src/css/components.css`, `src/css/tokens.css`); aligned Projects page heading with tabs and project titles with tab tops (Entry 086). Removed Patriots motion graphics page from repo (Entry 087). Styled nav home button with active-page indicator matching nav links (Entry 087). Merged `shxdowloop/2026-07-22/visual-baseline-gate` to production as `098f0b1`. Reconciled all `docs/plans/` status headers and checklists against the shipped commits, and consolidated every open plan item into this file (Entry 088). Landed the Projects heading padding with all 40 baselines adjudicated numerically; found and fixed a Playwright preview-server port that collided with `next dev`, and found (deferred) a gate tolerance that scales with page height (Entry 089).
- **2026-07-23** — Nav buttons restyled into a segmented pill group; `#theme-toggle` ID-override trap documented; focus-visible contract in AGENTS.md corrected to `--brand-accent` (Entry 082).
- **2026-07-22** — Visual-baseline spec converted from capture-only to a real compare-based gate; fixed a too-loose per-pixel `threshold` and a `reuseExistingServer` bug that made the suite grade a stale `out/` (Entry 081).
- **2026-07-13** — `srcset`/`@2x` thumbnail variants (Entry 073); zero CSP console violations verified in production (Entry 072).
- **2026-07-12** — Netlify production branch repointed to `portfoliowebsite` (Entry 069); `<main>` big-screen layout fix (Entry 070).
- **2026-07-12** — Next.js 15 static export migration: all 5 pages, `bubbles.js` ported, CSP reworked, Playwright re-baselined (Entries 066–068).
- **2026-07-09** — Tailwind utility conversion across all pages; nav trimmed to Work + About; submenu/hamburger/Contact/Hire-Me CTA removed.
- **2026-07-05** — Tailwind v4 pipeline restored + bubble-physics/Playwright/metadata recovery.
- **2026-07-02** — EPERM `uv_spawn` resolved externally (Defender update); playbook retained in AGENTS.md.
- **2026-07-01** — Architecture remediation Stages 0–5 shipped (Playwright harness, CSS de-dup, reproducible build, head rewrite, CSP + security headers).

---

## TickTick Mirror

TickTick "Portfolio Website" list (project id `69c8addc8f0823c509e1979f`) mirrors the Open Task Threads above. Run `node scripts/sync-all.js --dry-run` after edits.
