# TODO

> **This file is the complete surface for open work.** Every plan in `docs/plans/` has been
> reconciled against `LOGBOOK.md` and `git log` as of 2026-07-24; no plan doc holds an unchecked
> item that isn't represented here. Plan docs record *how* something was built — they are not a
> second to-do list.

## Active Plans

_None. All written plans are complete; see **Completed plans** below._

### Awaiting a user step

- **[Aug 6] Lift the deploy pause.** On/after 2026-08-06: merge `develop` → `portfoliowebsite` and
  push **once** (one production deploy = 15 credits, not one per commit). The `pre-push` guard
  expires on its own that day — nothing to uninstall. Then revert the pause banners in
  `AGENTS.md` / `docs/NOTES.md` Branch Policy. Until then **all work happens on `develop`**;
  preview with `npm run dev` at <http://localhost:3000>. Checklist in
  [`docs/deploys.md`](docs/deploys.md#lifting-the-pause-on-2026-08-06); LOGBOOK Entry 105.
- **Netlify production deploys are paused — out of credits (2026-07-26).** The team used all
  300 monthly credits (20 production deploys × 15). Published site stays live on `da4b4be`;
  every push until then returns `skipped: true` with no build log. **Resumes automatically
  Aug 6, 2026** (billing cycle Jul 7 → Aug 6), or immediately on a paid plan. Nothing to fix in
  the repo — the two mitigations are already committed (`aef8d5a`, `68c42eb`). See LOGBOOK
  Entry 104 for the credit model and the workflow that fits 20 deploys/month.
- **Enable Netlify form detection.** Dashboard UI toggle plus one test submission — an agent cannot
  do it. The Contact page is now **live in nav + footer** (Entry 106) and the form renders and
  validates, but submissions are not captured until this is flipped. Nothing else is blocked on it.
  (Rest of the nav restructure complete: Entries 075/077/078; nav-fit + unhide done in Entry 106.)

### Completed plans

- `2026-07-24-cross-page-css-consistency.md` — Home/Gallery title, frame, and color styles unified on
  a new `.brand-page-title` / `.brand-title-bar` primitive in `brand.css`; gallery cards moved off
  hardcoded dark values onto brand tokens (they were broken in the light theme); Gallery header
  renamed "Art Gallery" → "Gallery". Entry 097. Follow-on (Entry 098): Projects text reduced to
  black/white/gray, and every framed image on Projects + Gallery moved to one `.brand-frame`
  neutral translucent frame that is the same declared color in light and dark.
- `2026-07-24-gallery-widening.md` — gallery widened to a 1400px centered container with 3 columns
  at `xl`, matching the Projects measure; cells equalized so captions share a baseline. Entry 095.
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

### Gallery tag system (plan: `docs/plans/2026-07-24-gallery-tag-system.md` — explicitly deferred by user 2026-07-14, plan refined 2026-07-24)
- [x] Design tag taxonomy — done 2026-07-14. Medium split is **Digital (4: In Danger, Chill, Gross, Emergence) / Painting (5: Faces, Lollipop, Overflow, Beheaded, Shadow) / Drawing (2: Stairs — colored pencil, TX Lake Landscape — pastel)**; no photography, so the originally suggested mixed-media/photography buckets don't apply. **Needs user confirmation of per-work assignments before shipping.**
- **Source tag data provided by user 2026-07-24** (per-work Tool Tags + Production category — this is the real per-piece data the taxonomy above should be checked against before implementing):

  | Work | Tool Tags | Production |
  |---|---|---|
  | In Danger | Photoshop, Photography | Digital |
  | Chill | Photoshop, Colored Pencil | Traditional, Digital |
  | Gross | Photoshop, Acrylic Paint | Traditional, Digital |
  | Emergence | Procreate | Digital |
  | Faces | Watercolor Paint, Marker, Photography | Traditional |
  | Lollipop | Acrylic Paint, Photography | Traditional |
  | Overflow | Photoshop, Acrylic Paint | Traditional, Digital |
  | Stairs | Adobe Photoshop, Colored Pencil, Photography | Traditional, Digital |
  | Beheaded | Photoshop, Acrylic Paint | Traditional, Digital |
  | Shadow | Acrylic Paint, Photography | Traditional |
  | Texas Lake Landscape | Adobe Photoshop, Chalk Pastel, Photography | Traditional, Digital |

  **Amended 2026-07-26 (user):** Photography added to Shadow, Texas Lake Landscape, Lollipop and Stairs; "TX"
  renamed to "Texas"; "Photoshop" written as "Adobe Photoshop" everywhere. Production tags
  unchanged — Photography alone does not imply Digital (cf. Faces, which is Traditional).

  **User decision 2026-07-24:** Production tags only (no Tools facet). Filter simplified to `All | Digital | Traditional | Both`. Hybrid pieces (Chill, Gross, Overflow, Stairs, Beheaded, TX Lake Landscape) display **both** "Traditional" and "Digital" tags on the card. "Photography, Digital" (In Danger) maps to "Digital" only. Description field added to data model now (empty strings) but **not rendered yet** — user will fill descriptions and ask for UI inclusion separately.
- **Plan refined 2026-07-24:** `docs/plans/2026-07-24-gallery-tag-system.md`.
- [x] Implement filter UI — shipped in `235f254` (All / Digital / Traditional / Both, hash-synced,
  server-metadata + client-grid split, card tags on `font-body` per the user's type decision).
  **Restructured 2026-07-25 (Entry 099, user request):** the filter is now a vertical left rail at
  `lg+` (sticky 260px column, `.project-tab` styling with spectrum dividers, mirroring the
  Projects rail) with the grid flexing beside it; below `lg` it stays a horizontal row above the
  grid. All 8 gallery baselines regenerated and adjudicated. **Refined 2026-07-26 (Entry 100):**
  rail-to-grid gutter added, spectrum dividers extended to mobile widths, result count centered,
  and the rail put on the shared Projects/Gallery container so the tabs match both pages exactly.
- [x] Wire tag metadata into gallery items — shipped in `235f254` (`tags` + empty `description`
  fields per item; hybrid pieces carry both tags). Description rendering still awaits user copy.
- [x] **Card metadata shows tools, not tags (2026-07-26, Entry 101).** Production tags are now
  `sr-only` (still driving the filter); the visible line is the tool list from the table above,
  middot-separated plain text via `.gallery-tools`. `Photoshop` renders as `Adobe Photoshop`
  per user correction; Photography added to Shadow / Texas Lake Landscape / Lollipop / Stairs;
  "TX Lake Landscape" renamed "Texas Lake Landscape" (image filename unchanged). Tool names are
  `white-space: nowrap` so multi-tool lines wrap at the middots only. 8 gallery baselines
  regenerated; suite 53/53.
- [x] Verify responsive layout with filter bar — covered at 360 / 768 / 1024 / 1440 by the visual
  baselines (regenerated Entry 099) plus both-theme screenshot adjudication; 2560 / 3440 not
  separately captured (grid caps at 1400px, so ultra-wide adds only margin).

**Bonus data, out of scope for the gallery (Projects page, not Gallery — recorded here only so it isn't lost):** the user also supplied Tool Tags / Production for two Projects-page entries: **Avery Ember Day Brand** — Photoshop, Illustrator, InDesign, Tailwind CSS, JavaScript (user flagged an open question: whether to also list the portfolio site's frameworks here) / Production: Digital; **History of Mistrust** — Figma / Production: Digital. No tag system exists on the Projects page (`app/projects/BrandProject.tsx`, `MistrustProject.tsx`) today — this is reference data only, not a scoped task.

### History of Mistrust — post-framework polish
- [ ] Final polish on the continuous horizontal carousel
- [ ] Standalone viewer page with all canonical slide content + numbered bibliography

### Standalone
- [x] **Widen the gallery page.** Done 2026-07-24 (Entry 095): 1400px centered container with 3
  columns at `xl`, plus uniform cells so captions bottom-align. Plan:
  `docs/plans/2026-07-24-gallery-widening.md`. The real blocker wasn't `max-w-[900px]` — it was the
  global 1200px `main` cap in `src/css/site.css:104`. Two notes for future gallery work: the
  bubble-redistribution warning in the old version of this item was wrong (the gate captures under
  reduced motion, where the engine makes no bubbles, so exclusion-zone changes are invisible to
  it), and 6 of the 8 gallery baselines moved, not 8 — `gallery-360` stayed byte-identical.
- [ ] Watermark artwork
- [x] **Flaky under parallel load: `bubbles-exclusion › Projects tabs @768`.** Fixed 2026-07-24/25
  (Entry 099, commit `15fe32d`): converted to frame-based sampling like the blob test. Held green
  in 9+ consecutive full-suite runs during Stage 2/3/5 verification.
- [x] **Visual gate: `--update-snapshots` intermittently writes a bad baseline.** Fixed 2026-07-25
  (Entry 099). Two root causes: (1) Playwright 1.61.1 starts `webServer`s *before* `globalSetup`,
  so the build's delete/recreate of `out/` orphaned the running `serve` — the 4322 server now
  starts inside `globalSetup` after the build, with a readiness probe and teardown; (2) the spawned
  server's `stdio: 'pipe'` was never drained, so `serve`'s request logging filled the 64KB pipe and
  deadlocked its event loop — now `stdio: 'ignore'`. Partial-paint defect covered by a
  double-`requestAnimationFrame` paint-settle wait after `decode()`.

- [x] **Visual gate: small-area changes pass silently.** Fixed 2026-07-25 (Entry 099): distinct from the flake above and arguably
  worse, because it is deterministic. `maxDiffPixelRatio: 0.001` allows ~3685 differing pixels on a
  1440×2559 page, so any change smaller than that is invisible to the gate *and its stale baseline
  keeps passing*. Confirmed twice in Entry 098: the 2px tab divider (~520 px) passed in light while
  the baseline lacked it entirely — dark caught it only because the bar's glow spreads further on
  near-black; and dark-mode `projects-mistrust` heading recolours passed at 1024/1440 for the same
  reason. **Consequence: a green suite is not evidence that a small visual change shipped.** Verify
  small changes by cropping the committed baseline or probing computed styles, not by a pass.

  **Mitigation that works, and should stay the habit: after ANY `--update-snapshots`, re-run the
  full suite before committing snapshots.** A bad baseline is silent otherwise — it passes on the
  update run and only surfaces later as a phantom regression. Recovery is to re-update the single
  offending snapshot, confirm the dimensions against a repeated-load measurement, then re-run.

  **Resolution (Entry 099):** `maxDiffPixelRatio: 0.001` replaced with an absolute
  `maxDiffPixels: 500` floor. Immediately caught the predicted latent drift (4 baselines at 768px,
  the documented tab-divider defect — re-adjudicated and regenerated) and was proven live: an
  injected 2px nav border went red on **all 40** snapshots. Injection gotcha for future proofs:
  a plain declaration in `site.css` loses to Tailwind's utilities layer — use `!important` when
  injecting a test regression, or the suite stays silently green.
- [x] **Homepage scrolls horizontally at narrow widths.** Fixed 2026-07-24 (Entry 085):
  `overflow: hidden` added to `.brand-hero` clips the `.brand-hero-blobs` layer
  (`inset: -20%`) so it cannot spill into the document scrollbox. Verified:
  `scrollWidth === clientWidth` at 360px.
- [x] **Delete the out-of-cascade CSS duplicates.** `src/css/components.css` and
  `src/css/tokens.css` removed 2026-07-24 (Entry 086). Verified zero live imports;
  `style.css` byte-identical after rebuild.
- [x] **Re-check nav fit before re-enabling the Contact link.** Done 2026-07-27 (Entry 106) via the
  padding-clamp route: nav-link padding `11px→6px`, logo `11px→7px`, gap/margin `4px→2px`, and
  `#theme-toggle` capped to 44px below 480px — **lower clamp bounds only**, so nothing above ~480px
  moved. Measured 12/12 pass at 360/390/768/1440/2560/3440 × both themes: ~77px slack at 360px,
  links 55-60px wide, no clipped labels, no page-level horizontal scroll.
- [ ] **Run the visual gate in CI.** The gate is now real (Entry 081) but opt-in — `netlify.toml` runs `next build` + publish with no test step, so a visual regression deploys unchallenged if `npm test` is skipped locally. **Blocked on a decision:** snapshots are `-chromium-win32` suffixed, so a Linux CI runner cannot reuse them. **Decision made 2026-07-23 (user):** option (c) — containerize capture (run Playwright in the official `mcr.microsoft.com/playwright` image locally *and* in CI) so one Linux snapshot set is canonical. Not yet implemented; needs a one-time regeneration of all **40** baselines under the container. Raised by the Entry 081 shippability review. **This is the only open item carried over from a plan doc** (`2026-07-22-visual-baseline-gate-shxdowloop.md`, whose Risks section points here rather than re-planning it).

- [x] **The visual gate's tolerance scales with page height — tighten it.** Done 2026-07-25
  (Entry 099) via the `maxDiffPixels: 500` floor above — decided *without* waiting for the
  containerization item after the re-grade surfaced only 4 latently-drifted baselines, all at the
  documented tab-divider boundary, rather than broad drift. The containerization re-baseline (item
  above) remains open and independent. Original finding: `maxDiffPixelRatio: 0.001`
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
- [x] **Replace generated placeholder `images/og-default.png`.** Done 2026-07-27 (Entry 106): the
  card is now rendered from the live homepage hero by `scripts/generate-og-image.js`, so it tracks
  the site instead of drifting. Re-run it after any hero change.
- [x] **Hydration error from the theme-init `<Script>` placement.** Fixed 2026-07-28 (Entry 107):
  moved inside `<body>`. Console on `/` is clean and there is no theme flash. The CSP concern that
  deferred it turned out to be stale — `netlify.toml` uses `'unsafe-inline'`, not pinned hashes.
- [ ] **Re-export "A History of Mistrust" Set 1 and Set 3 from Figma, or drop the set PNGs.** Both
  exports are defective (Entry 106): `Set 1.png` clips 50px off its first slide, and `Set 3.png`
  contains Set 2's slides. Nothing is broken on the site — `scripts/generate-mistrust-assets.js`
  composes the strips from the individual slide PNGs and ignores these files — so this is only about
  whether the repo keeps a correct source-of-record. Deciding to drop them is a fine outcome.
- [ ] **`public/` ships ~6 MB of unreferenced source PNGs.** The 30 `Instagram post - N.png` files
  plus the 3.1 MB cover live in `public/`, so Next copies them into the export, but only the derived
  webp assets are ever requested. Deleting them from `public/` (keeping `images/`) would cut the
  export. Left alone in Entry 106 to avoid scope creep.

---

## Recently Completed

Full details are in `LOGBOOK.md` (newest-first). Headline items since 2026-07-01:

- **2026-07-31** — Landed Entries 106 and 107, which had been finished but left **entirely
  uncommitted** for three days (both entries falsely claimed "committed here"). Re-verified the
  whole tree before landing — suite 55/55 twice, `tsc` clean, `style.css` byte-identical after
  rebuild, shared-geometry check exit 0, and the `SLIDE_ALT` reorder spot-checked against the
  source artwork rather than against the prior entry's claim. Five commits, `4355541`→docs;
  both entry headers corrected to carry the real SHAs (Entry 108).
- **2026-07-28** — Contact page polish (bubble-repel on the form, duplicate socials dropped, Send
  redesigned on the spectrum ramp) and one content width site-wide: `--brand-content-max` raised to
  1400px as the single source of truth, a flat 24px gutter, and no horizontal padding on `main`,
  which collapsed three divergent left edges (44/144/208 at 1440px) into one. Backed by a new
  `scripts/measure-content-widths.js` that exits non-zero if they ever diverge again — the visual
  suite structurally cannot catch it. Plus the `.brand-btn:focus-visible` fix (site-wide) and the
  theme-init hydration fix (Entry 107).
- **2026-07-27** — Contact unhidden in nav + footer with the 360px nav-fit solved on lower clamp
  bounds only; "A History of Mistrust" assets resynced via a new content-diffing generator; twelve
  slides of misordered `SLIDE_ALT` alt text corrected against the artwork; og share card
  regenerated from the live hero with a shared `app/og.ts` descriptor (Entry 106).
- **2026-07-26** — Projects and Gallery unified on one content container (`mx-auto max-w-[1400px]`,
  no container padding, 24px gutter supplied by the children) so the page title, its spectrum
  underline and the tab/filter rail finally share a left edge — they had been on three different
  recipes at 60 / 40 / 20px. Gives the gallery rail-to-grid gutter, identical tab size/shape across
  both pages, and a title bar that runs tab-edge to mirrored-inset instead of stopping short. Plus
  spectrum dividers on the Gallery filters at mobile widths and a centered result count. 24
  baselines regenerated and adjudicated; verified at 360–3440 in both themes (Entry 100).
- **2026-07-25** — Visual gate hardened and proven (server moved into `globalSetup` post-build,
  stdio pipe deadlock fixed, `maxDiffPixels: 500` floor; injected 2px change went red on all 40
  snapshots); bubble tabs flake fixed by frame-based sampling; gallery filter restructured into a
  Projects-style vertical left rail; nav-fit at 360px re-measured at 0px slack (Entry 099).
- **2026-07-24** — Gallery art now framed in translucent dark cards with white titles (hover ring
  removed); shared `PageHeader` gives Projects and Gallery an identical left-aligned title with an
  iridescent gradient underline spanning the page (Projects title lifted out of the tab rail to
  make this fit); a thin spectrum bar replaced the nav's gray bottom border site-wide. All 40
  visual baselines re-adjudicated and regenerated (Entry 096).
- **2026-07-24** — Gallery widened to a 1400px centered container with 3 columns at `xl`, matching
  the Projects measure, with uniform cells so every caption in a row shares a baseline. Required
  opting the gallery `<main>` out of the global 1200px cap and re-supplying its gutters. 6 gallery
  baselines regenerated and adjudicated; `gallery-360` byte-identical (Entry 095).
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
