# TODO

> **This file is the complete surface for open work.** Verified 2026-08-01: `docs/plans/` contains
> **zero** open checkboxes, so no pending work is visible only by opening a plan file. Plan docs
> record *how* something was built — they are not a second to-do list. Re-check with
> `grep -rn "^\s*- \[ \]" docs/plans/`; anything it returns belongs here too.

## Active Plans

### Copy pass + gallery descriptions — **planned, not started** (2026-08-01)

Proofread and rewrite the Contact page, both project summaries, and the About box; write and render
descriptions for the 11 gallery pieces. Plan:
[`docs/plans/2026-08-01-copy-pass-and-gallery-descriptions.md`](docs/plans/2026-08-01-copy-pass-and-gallery-descriptions.md).
Visual/motion spec:
[`docs/plans/2026-08-01-gallery-expand-motion-concept.md`](docs/plans/2026-08-01-gallery-expand-motion-concept.md).

- **Decided (2026-08-01):** descriptions render as a one-line preview on the card that **expands on
  click** — card grows in both axes and pushes the grid over, no lightbox; expanded card spans 2
  columns at `xl`; artwork capped at one viewport height; card movement, expansion and filter changes
  are animated. `alt` becomes a real image description, and the current "captions" are titles so they
  become `<h3>` headers. **The user writes the first draft** of all copy; the agent proofreads only.
- `GalleryItem.description` **already exists** in the interface and is `''` on all 11 items, and is
  never rendered — so the copy side is data plus a render change, not a schema change.
- **Copy tracks wait on the user's draft. The expand/motion track is not blocked** and can start
  against placeholder text.
- Known traps: `.gallery-item` is a bubble-exclusion selector (retagging silently breaks physics
  exclusion — has happened twice); the visual gate runs under reduced motion so it cannot see the
  animation; expect most of the 40 snapshots to move once copy lands.
- Open: whether an expanded piece is deep-linkable (`#piece=…`).

### Frame radius + button hover — committed `42ea05c` on `develop`, **not pushed** (2026-08-01)

- **Entry 110** — square images, rounded frames. `.brand-frame:has(> img)` removed; Mistrust
  supporting-card images wrapped in a `p-4` inset. Slideshow surfaces stay square. 67/67 twice; 16
  baselines re-generated and reviewed.
- **Entry 111** — one purple hover for all non-nav action buttons via `--brand-hover-tint-inverse`.
  Tabs/filters/chips/thumbs excluded on purpose (their *selected* state is that same purple).
  67/67 green, zero baseline movement.
- Both contracts recorded in `AGENTS.md` → Design Conventions. **Push deliberately left to the user.**

### Mistrust set-strip seam dedupe — MERGED to `develop` (`ada0210`, 2026-08-03)

**Entry 114.** The user re-exported the three Figma set strips; investigating them found that the
shipped `set-1.webp` had a **duplicated 19px seam** — slides 1 and 2 share a band of artwork and
composing at cumulative native widths drew it twice, notching the orange arc. Set strips now take
pixels from the slides and geometry from the export, guarded by width/height assertions and a new
`tests/mistrust-sets.spec.js`. Fast-forwarded onto `develop` with zero conflicts. **Not pushed.**
Plan: [`docs/plans/2026-08-01-mistrust-set-seam-dedupe-shxdowloop.md`](docs/plans/2026-08-01-mistrust-set-seam-dedupe-shxdowloop.md).

### Bubble spec isolated into its own Playwright project (2026-08-03)

**Entry 115.** A verification run of the full suite on `develop` failed
`bubbles-exclusion.spec.js` "Projects tabs @ 768px" at 195px² overlap, then passed 10/10 standalone.
The 2026-07-28 in-file `mode: 'serial'` fix only covered contention *within* the file; other spec
files still starved rAF. Every "67/67 green" claim from 2026-07-28 onward was a lucky scheduling
draw. `playwright.config.js` now splits the suite into a `chromium` project and a `bubbles` project
gated behind it, so nothing else holds a worker while the physics tests run. Snapshot names are
unaffected — the visual specs stay in `chromium`.

### Mistrust Figma re-export — committed to `develop` (`06bd820`, 2026-08-01)

**Entry 113.** New Figma export swapped into both asset trees; only 4 of 31 PNGs actually differed
(cover collage + slides 1–3), so the rebuild was 12 slide webps plus `set-1.webp`. `SLIDE_ALT`
verified unchanged against the artwork. 8 `projects-mistrust` baselines re-recorded after reading
the diff — movement is slide 1's decorative curve only. Suite green.
Plan: [`docs/plans/2026-08-01-mistrust-asset-reexport.md`](docs/plans/2026-08-01-mistrust-asset-reexport.md).

### Mistrust slideshow redesign — MERGED to `develop` (`152cf2f`, 2026-08-01, user-reviewed)

Shipped: one swipeable stage with Set 1/2/3 switcher, filmstrip and side-bar nav; React lightbox;
seamless set mosaics. LOGBOOK Entry 109. Local only — nothing pushed.

- Deferred (future milestone): `slide-NN-thumb.webp` variants in `scripts/generate-mistrust-assets.js`;
  `mistrustSlides.ts#thumb` is the one-line swap point. Current weight already beats what it replaced.
- ~~At the eventual merge of `shxdowloop/2026-07-31/architecture-map`: its ARCHITECTURE.md runtime
  diagram names the deleted `history-of-mistrust-slideshow.js` — reconcile then.~~ **Done 2026-08-03**
  (Entry 116): branch merged, diagram now names the React components, all 40 link targets verified.

---

## Awaiting a user step

- **[Aug 6] Lift the deploy pause.** Merge `develop` → `portfoliowebsite` and push **once** (one
  production deploy = 15 credits, not one per commit). The `pre-push` guard expires by itself that
  day. Then revert the pause banners in `AGENTS.md` / `docs/NOTES.md`. Checklist in
  [`docs/deploys.md`](docs/deploys.md#lifting-the-pause-on-2026-08-06); LOGBOOK Entry 105.
  - **The guard was found inert on 2026-08-03 and is now permanently fixed** (Entries 115–116).
    Local `core.hooksPath` pointed at `.githooks`, which existed only on the architecture-map
    branch, so `develop` ran with no hooks at all — no deploy guard, no Git LFS. Merging that
    branch landed the tracked `.githooks/` and `core.hooksPath` is pointed back at it. Effect-probed
    after the merge: `portfoliowebsite` → exit 1 with the guard message, `develop` → exit 0.
    A fresh clone still needs `git config core.hooksPath .githooks` once.
- **Netlify production deploys paused — out of credits (2026-07-26).** All 300 monthly credits used.
  Published site stays live on `da4b4be`; pushes return `skipped: true` with no build log. Resumes
  automatically **Aug 6** (cycle Jul 7 → Aug 6). Nothing to fix in the repo — both mitigations are
  committed (`aef8d5a`, `68c42eb`). LOGBOOK Entry 104.
- **Contact form: detection ON, form still unregistered — needs a deploy.** Detection was enabled
  2026-08-01 and the email notification is configured (site-wide `submission_created` hook →
  `averyemberday@gmail.com`, id `6a6e6f4bbb69572bfbd54227`). **Netlify registers forms by parsing
  deployed HTML at build time**, and the published deploy predates the toggle. API confirms
  `forms: []` and `submissions: []` — the live form drops messages silently.
  - **Next:** push `develop` for a **free branch deploy**, then test-submit and confirm it appears.
    Whether non-production submissions file into the main form list is a Netlify setting — verify it
    lands rather than assuming. Aug 6's production deploy re-registers it on the live domain.
  - Until a test submission passes, `/contact/thanks/` promises "Your message has been sent" without
    that being true.

---

## Open items

Everything genuinely pending, in one place.

### Content

- [ ] **Watermark artwork.**
- [ ] **Standalone "A History of Mistrust" viewer page** with all canonical slide content and a
      numbered bibliography. (Slides and a Sources section currently live inside the Projects tab.)
- [ ] **Final polish on the continuous horizontal carousel** — **likely superseded by Entry 109**,
      which replaced the carousel with the swipeable stage. Confirm with the user whether this item
      still means anything before actioning it; a plausible outcome is closing it.

### Tooling / CI

- [ ] **Run the visual gate in CI.** The gate is real (Entry 081) but opt-in — `netlify.toml` runs
      `next build` + publish with no test step, so a visual regression deploys unchallenged if
      `npm test` is skipped locally. **Decision made 2026-07-23 (user):** containerize capture (run
      Playwright in the official `mcr.microsoft.com/playwright` image locally *and* in CI) so one
      Linux snapshot set is canonical — the current snapshots are `-chromium-win32` suffixed and a
      Linux runner cannot reuse them. Needs a one-time regeneration of all **40** baselines under the
      container. Raised by the Entry 081 shippability review. **This remains the only open item
      carried over from a plan doc** (`2026-07-22-visual-baseline-gate-shxdowloop.md`).

### Repo hygiene

- [x] **Re-export Mistrust Set 1/2/3 from Figma, or drop the set PNGs.** Done (Entry 114). The user
      re-exported all three; `Set 3.png` now holds slides 21–30 instead of Set 2's, and `Set 1.png`'s
      50px clip is gone. The investigation inverted the premise of this item: the set PNGs were never
      the broken artefact. `Set 1.png`'s remaining 19px "deficit" is a **real shared bleed** between
      slides 1 and 2, and the composed `set-1.webp` was the wrong one — it duplicated that band and
      shipped a visible notch. The exports are no longer ignored: they now supply the strip geometry.
- [x] **Untrack the stale scratch directories.** Done 2026-08-03 (Entry 116) on the user's explicit
      instruction. `git rm -r --cached` on 18 files: `tmp/` (10), `output/playwright/` (6),
      `Script.js`, `run_git_commands.py`. All still on disk, none tracked; `.gitignore` extended with
      `/output/` and `/Script.js`. They had been showing up as code directories in the
      `docs/ARCHITECTURE.md` module map, which is how the map surfaced them in the first place.
- [ ] **`public/` ships ~6 MB of unreferenced source PNGs.** The 30 `Instagram post - N.png` files
      plus the 3.1 MB cover are copied into the export but never requested; only the derived webp
      assets are. Deleting them from `public/` (keeping `images/`) would cut the export. Left alone
      in Entry 106 to avoid scope creep. **Related but distinct** from the scratch untrack above:
      these files ARE referenced as generator inputs, so they cannot simply be dropped from `images/`.

---

## Reference data (not a task)

**Projects-page tool tags**, supplied by the user 2026-07-24 and recorded here because they exist
nowhere in code — no tag system exists on the Projects page:

| Project | Tool Tags | Production |
|---|---|---|
| Avery Ember Day Brand | Adobe Photoshop, Illustrator, InDesign, Tailwind CSS, JavaScript | Digital |
| A History of Mistrust | Figma | Digital |

> User's open question on the first row: whether to also list the portfolio site's own frameworks.

Gallery per-piece tool tags are **not** duplicated here — they are the `tools` arrays in
[`app/gallery/gallery-data.ts`](app/gallery/gallery-data.ts), which is the source of truth.

---

## Completed plans

- `2026-07-31-mistrust-slideshow-redesign.md` / `-shxdowloop.md` — swipeable stage, React lightbox,
  set mosaics. Entry 109, merged `152cf2f`.
- `2026-07-28-contact-polish-width-unification.md` — Contact polish + one content width site-wide.
  Entry 107.
- `2026-07-27-contact-unhide-mistrust-assets.md` — Contact unhidden, Mistrust assets resynced, og
  card regenerated. Entry 106.
- `2026-07-24-gallery-tag-system.md` — `All | Digital | Traditional | Both` filter, tag data wired,
  restructured to the vertical rail. Entries 099–101, commit `235f254`. **Decision 3 (visible tag
  pills) was superseded** in Entry 101 by the sr-only tags + visible tool list.
- `2026-07-24-bubble-visual-cleanup-…-nanoagent-plan.md` — bubble-test flake fixed by frame-based
  sampling, visual-gate defects closed (`maxDiffPixels: 500` floor, server into `globalSetup`),
  gallery filter rail. Entries 099–101, commit `15fe32d`.
- `2026-07-24-bubble-hero-exclusions-shxdowloop.md` — hero logo/blob exclusions + the repo's first
  motion-enabled tests. Entry 090.
- `2026-07-24-projects-heading-padding-shxdowloop.md` — heading padding with all 40 baselines
  adjudicated numerically. Entry 089.
- `2026-07-24-docs-sync-todo-consolidation.md` — plan-doc status reconciliation. Entry 088;
  **re-run 2026-08-01** against fresh targets (Entry 112).
- `2026-07-24-cross-page-css-consistency.md` — Home/Gallery unified on `.brand-page-title` /
  `.brand-title-bar`; gallery cards moved onto brand tokens. Entry 097; follow-on Entry 098.
- `2026-07-24-gallery-widening.md` — 1400px centered container, 3 columns at `xl`. Entry 095.
- `2026-07-23-nav-button-restyle.md` — square, no-chrome-at-rest nav group; scope grew to the
  logo-as-home-button and the project-tab restyle. Entries 082–087, merged `098f0b1`.
- `2026-07-22-visual-baseline-gate-shxdowloop.md` — baselines converted to a real compare-based gate.
  Entry 081, `833d46a` → `6ddccd2`.
- `2026-07-15-projects-vertical-tabs.md` — sticky vertical Projects rail at `lg+`. Entries 079–080.
- `2026-07-14-nav-restructure.md` / `-wrapup-shxdowloop.md` — Home/Projects/Gallery/Contact
  restructure. Entries 075–078.
- `2026-07-13-srcset-variants.md` — srcset/@2x variants. Entry 073, `f63671d`.
- `2026-07-12-motion-load-perf.md` — time-to-motion / TTI reductions. Entry 072.

_Earlier plans are consolidated in `docs/archives/plans.md`._

---

## Recently Completed

Full detail is in `LOGBOOK.md` (newest-first). Headlines since 2026-07-01:

- **2026-08-01** — Square images inside rounded frames; one purple hover for every non-nav action
  button (Entries 110–111). Netlify form state diagnosed via API and the missing form-notification
  hook created. Plan docs reconciled a second time and this file condensed (Entry 112).
- **2026-08-03** — TODO audit found two load-bearing safety mechanisms documented as working while
  silently doing nothing: the bubble spec was flaking under cross-file worker contention (isolated
  into its own Playwright project) and the deploy-pause push guard was inert (`core.hooksPath`
  pointed at a directory that existed only on an unmerged branch). Entry 115. Then the
  architecture-map branch merged, landing `docs/ARCHITECTURE.md` and the tracked `.githooks/`,
  which is the permanent fix for the guard. Entry 116.
- **2026-07-31** — Mistrust slideshow redesigned (Entry 109). `docs/ARCHITECTURE.md` built as the
  agent-facing structural map with a deterministic `post-commit` staleness gate, and the four live
  git hooks migrated into the tracked `.githooks/` (Entry 116, merged 2026-08-03). Landed Entries
  106 and 107, which had been finished but left **entirely uncommitted** for three days while both
  claimed "committed here" (Entry 108).
- **2026-07-28** — Contact polish and one content width site-wide: `--brand-content-max` at 1400px
  as the single source of truth, flat 24px gutter, no padding on `main`, collapsing three divergent
  left edges into one. Backed by `scripts/measure-content-widths.js`, which the visual suite
  structurally cannot replace (Entry 107).
- **2026-07-27** — Contact unhidden with 360px nav-fit solved on lower clamp bounds only; Mistrust
  assets resynced via a content-diffing generator; twelve slides of misordered `SLIDE_ALT` corrected
  against the artwork; og card regenerated from the live hero (Entry 106).
- **2026-07-26** — Projects and Gallery unified on one content container so title, spectrum underline
  and tab/filter rail share a left edge — they had been on three recipes at 60/40/20px. 24 baselines
  regenerated (Entry 100).
- **2026-07-25** — Visual gate hardened and proven: server into `globalSetup` post-build, stdio pipe
  deadlock fixed, `maxDiffPixels: 500` floor, and an injected 2px change went red on all 40 snapshots.
  Bubble tabs flake fixed by frame-based sampling; gallery filter restructured into a vertical rail
  (Entry 099).
- **2026-07-24** — Gallery reframed and widened to 1400px/3-column with a shared `PageHeader`
  (Entries 095–096). Nav gutters tightened (Entry 092). Projects tabs added to bubble exclusions —
  the same silent-drop bug as the hero logo, this time from the `.brand-btn` → `.project-tab` rename
  (Entry 093). Hero logo/blob exclusions plus the repo's first bubble tests (Entry 090). CSS
  duplicates deleted (Entry 086); Patriots page removed (Entry 087). Visual-gate branch merged to
  production as `098f0b1`.
- **2026-07-23** — Nav buttons restyled into a segmented group; `#theme-toggle` ID-override trap
  documented; focus-visible contract corrected to `--brand-accent` (Entry 082).
- **2026-07-22** — Visual-baseline spec converted from capture-only to a real compare-based gate;
  fixed a too-loose `threshold` and a `reuseExistingServer` bug that graded a stale `out/` (Entry 081).
- **2026-07-12/13** — Next.js 15 static export migration, all 5 pages (Entries 066–068); Netlify
  production branch repointed to `portfoliowebsite` (Entry 069); srcset variants (Entry 073).
- **2026-07-01→09** — Architecture remediation Stages 0–5; Tailwind v4 pipeline restored; utility
  conversion across all pages; EPERM `uv_spawn` resolved externally (playbook in AGENTS.md).

### Lessons that outlived their items

These were long retrospectives in this file; the durable versions now live where they get read:

- Visual-gate behaviour (tolerance floor, the re-run-after-`--update-snapshots` habit, bulk-update
  skips, the reduced-motion blind spot, serial mode for the bubble spec) → **`AGENTS.md` → Build &
  Test**, with full detail in LOGBOOK Entries 081/089/099.
- The bubble exclusion rename trap → **`AGENTS.md` → File Conventions** (it has now caused three
  incidents; Entries 090, 093).

---

## TickTick Mirror

TickTick "Portfolio Website" list (project id `69c8addc8f0823c509e1979f`) mirrors **Open items**
above. Run `node scripts/sync-all.js --dry-run` after edits.
