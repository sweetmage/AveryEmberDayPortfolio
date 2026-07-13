# TODO

## Active Plans

- `docs/plans/2026-07-12-motion-load-perf.md` — Reduce time-to-motion / time-to-interactive on the Next.js site (bubble engine defer, rAF micro-opts, dead-CSS trim, LCP image hints, reduced-motion for smooth-scroll). **Status:** Implemented 2026-07-12 (LOGBOOK Entry 072); awaiting user review/commit.

_No other plans currently active. All prior plans are consolidated in `docs/archives/plans.md` (see the Consolidation Stubs section at the bottom for the 2026-07-12 batch)._

---

## Open Task Threads

_These are backlog items that don't currently have a written plan. Historical retrospectives moved to `LOGBOOK.md` / `docs/archives/plans.md`._

### Patriots motion graphics
- [ ] Adjust speed of the beginning
- [ ] Save new files
- [ ] Add project overview to portfolio (Patriots page currently omitted from the live site)
- [ ] Display final project
- [ ] Patriots project card thumbnail (`images/projects/patriots-thumb.jpg`) — blocked on the motion-graphics render

### Gallery tag system
- [ ] Design tag taxonomy (medium-based: mixed-media, digital, photography, illustration)
- [ ] Implement filter UI in `app/gallery/page.tsx` (all / medium toggles)
- [ ] Wire tag metadata into gallery items
- [ ] Verify responsive layout with filter bar at 360 / 768 / 1024 / 1440 px

### History of Mistrust — post-framework polish
- [ ] Final polish on the continuous horizontal carousel
- [ ] Standalone viewer page with all canonical slide content + numbered bibliography

### Standalone
- [ ] Watermark artwork

### Architecture remediation follow-ups (deferred from 2026-07-01)
- [ ] `srcset` / `@2x` variants for project + gallery thumbnails
- [ ] Replace generated placeholder `images/og-default.png` with final design asset
- [ ] Verify zero CSP console violations in production after next deploy

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
