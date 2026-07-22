# TODO

## Active Plans

- `docs/plans/2026-07-15-projects-vertical-tabs.md` — Projects tabs become a sticky vertical rail beside the content at `lg+` (pills on top below `lg`); gallery "← Home" back link removed; palette orphan-swatch stretch fixed; AGENTS.md stale lines corrected. **Status:** Complete — implemented + verified 2026-07-15 (Entry 079), committed + pushed to production 2026-07-22 (Entry 080).
- `docs/plans/2026-07-14-nav-restructure.md` — Top nav becomes Home / Projects / Gallery / Contact; landing drops the Work section; new tabbed `/projects/` page (Brand + History of Mistrust, hash deep-links, 301 redirects for old URLs); new `/contact/` page with Netlify form + links. **Status:** Complete — implemented 2026-07-14 (Entry 075), deployed + live-verified 2026-07-15 (Entry 077). Contact nav/footer links hidden until forms work (Entry 078). Remaining: enable Netlify form detection (UI toggle, user step) + one test submission, then uncomment the links in `Nav.tsx`/`Footer.tsx` and re-baseline.
- `docs/plans/2026-07-13-srcset-variants.md` — srcset/@2x variants for project + gallery thumbnails. **Status:** Complete 2026-07-13 (Entry 073), committed `f63671d` (local, unpushed).
- `docs/plans/2026-07-12-motion-load-perf.md` — Reduce time-to-motion / time-to-interactive on the Next.js site (bubble engine defer, rAF micro-opts, dead-CSS trim, LCP image hints, reduced-motion for smooth-scroll). **Status:** Deployed to production 2026-07-13 (LOGBOOK Entry 072, commits 249b1b4 + 62ff597).

_All prior plans are consolidated in `docs/archives/plans.md` (see the Consolidation Stubs section at the bottom for the 2026-07-12 batch)._

---

## Open Task Threads

_These are backlog items that don't currently have a written plan. Historical retrospectives moved to `LOGBOOK.md` / `docs/archives/plans.md`._

### Patriots motion graphics
- [ ] Adjust speed of the beginning
- [ ] Save new files
- [ ] Add project overview to portfolio (Patriots page currently omitted from the live site)
- [ ] Display final project
- [ ] Patriots project card thumbnail (`images/projects/patriots-thumb.jpg`) — blocked on the motion-graphics render

### Gallery tag system (explicitly deferred by user 2026-07-14 — nav restructure first)
- [x] Design tag taxonomy — groundwork done 2026-07-14: all 11 works visually reviewed; actual medium split is **Digital (4: In Danger, Chill, Gross, Emergence) / Painting (5: Faces, Lollipop, Overflow, Beheaded, Shadow) / Drawing (2: Stairs — colored pencil, TX Lake Landscape — pastel)**. No photography in the gallery, so the originally suggested mixed-media/photography buckets don't apply. Per-work assignments need user confirmation before shipping.
- [ ] Implement filter UI in `app/gallery/page.tsx` (all / medium toggles; page must become a server-metadata + client-grid split)
- [ ] Wire tag metadata into gallery items
- [ ] Verify responsive layout with filter bar at 360 / 768 / 1024 / 1440 px

### History of Mistrust — post-framework polish
- [ ] Final polish on the continuous horizontal carousel
- [ ] Standalone viewer page with all canonical slide content + numbered bibliography

### Standalone
- [ ] Watermark artwork
- [ ] **Run the visual gate in CI.** The gate is now real (Entry 081) but opt-in — `netlify.toml` runs `next build` + publish with no test step, so a visual regression deploys unchallenged if `npm test` is skipped locally. **Blocked on a decision:** snapshots are `-chromium-win32` suffixed, so a Linux CI runner cannot reuse them. Options are (a) regenerate a Linux snapshot set and commit both, (b) run CI in a Windows runner, or (c) containerize capture so one platform is canonical. Raised by the Entry 081 shippability review.
- [x] Visual-baseline spec is capture-only — **done 2026-07-22** (Entry 081): migrated to `toHaveScreenshot()` with reduced-motion determinism and `--update-snapshots`; tree now stays clean. Also fixed two defects found while proving the gate could fail: Playwright's default per-pixel `threshold` was too loose to catch a whole-theme colour shift, and `reuseExistingServer` was skipping `next build` so the suite graded a stale `out/`.

### Architecture remediation follow-ups (deferred from 2026-07-01)
- [x] `srcset` / `@2x` variants for project + gallery thumbnails — done 2026-07-13: 25 generated variants + `srcset`/`sizes`/`width`/`height` on home cards and gallery grid (Entry 073)
- [ ] Replace generated placeholder `images/og-default.png` with final design asset
- [x] Verify zero CSP console violations in production after next deploy — done 2026-07-13: all 4 pages loaded headlessly post-deploy, zero console/page errors (Entry 072)

---

## Recently Completed

Full details are in `LOGBOOK.md` (newest-first). Headline items since 2026-07-01:

- **2026-07-12** — Netlify production branch repointed to `portfoliowebsite` (Entry 069); `<main>` big-screen layout fix (Entry 070).
- **2026-07-12** — Next.js 15 static export migration: all 5 pages, `bubbles.js` ported, CSP reworked, Playwright re-baselined (Entries 066–068).
- **2026-07-09** — Tailwind utility conversion across all pages; nav trimmed to Work + About; submenu/hamburger/Contact/Hire-Me CTA removed.
- **2026-07-05** — Tailwind v4 pipeline restored + bubble-physics/Playwright/metadata recovery.
- **2026-07-02** — EPERM `uv_spawn` resolved externally (Defender update); playbook retained in AGENTS.md.
- **2026-07-01** — Architecture remediation Stages 0–5 shipped (Playwright harness, CSS de-dup, reproducible build, head rewrite, CSP + security headers).

---

## TickTick Mirror

TickTick "Portfolio Website" list (project id `69c8addc8f0823c509e1979f`) mirrors the Open Task Threads above. Run `node scripts/sync-all.js --dry-run` after edits.
