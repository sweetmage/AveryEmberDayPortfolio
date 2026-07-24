# TODO

## Active Plans

- `docs/plans/2026-07-23-nav-button-restyle.md` — Nav buttons become a segmented pill group (taller bar, sentence-case labels, filled active pill replacing the underline). **Status:** Implemented + verified 2026-07-23 (Entry 082) on `shxdowloop/2026-07-22/visual-baseline-gate`. **Extended 2026-07-24 (Entries 083–085):** logo given full button affordances (hover/active/focus fills, full bar height); explicit Home link removed from `Nav.tsx`; Projects + Gallery grouped with logo on the left, toggle on the right via `margin-left: auto`; project tabs restyled to match nav buttons (square, no chrome at rest); project content un-capped from 1200px max-width; hero blob overflow fixed. **Uncommitted, unpushed.**

### Awaiting a user step

- `docs/plans/2026-07-14-nav-restructure.md` — **Remaining:** enable Netlify form detection (UI toggle, user step) + one test submission, then uncomment the Contact links in `Nav.tsx`/`Footer.tsx` and re-baseline. See the 360px nav-fit caveat under Standalone first. (Rest complete: Entries 075/077/078.)

### Completed plans

- `2026-07-15-projects-vertical-tabs.md` — sticky vertical Projects rail at `lg+`. Shipped to production 2026-07-22 (Entries 079, 080).
- `2026-07-13-srcset-variants.md` — srcset/@2x thumbnail variants. Done 2026-07-13, commit `f63671d` (local, unpushed) (Entry 073).
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
- [ ] **Run the visual gate in CI.** The gate is now real (Entry 081) but opt-in — `netlify.toml` runs `next build` + publish with no test step, so a visual regression deploys unchallenged if `npm test` is skipped locally. **Blocked on a decision:** snapshots are `-chromium-win32` suffixed, so a Linux CI runner cannot reuse them. **Decision made 2026-07-23 (user):** option (c) — containerize capture (run Playwright in the official `mcr.microsoft.com/playwright` image locally *and* in CI) so one Linux snapshot set is canonical. Not yet implemented; needs a one-time regeneration of all 40 baselines under the container. Raised by the Entry 081 shippability review.

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

- **2026-07-24** — Fixed bubbles/blobs covering the hero logo and name: `.hero-logo` was silently dropped from the bubble exclusion zones when the mark was inlined as an `<svg>` (the list matches the `img` tag), and hero blobs never had avoidance at all. Added the repo's first bubble-engine tests (Entry 090).
- **2026-07-24** — Deleted out-of-cascade CSS duplicates (`src/css/components.css`, `src/css/tokens.css`); aligned Projects page heading with tabs and project titles with tab tops (Entry 086). Removed Patriots motion graphics page from repo (Entry 087). Styled nav home button with active-page indicator matching nav links (Entry 087).
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
