# TODO

---

## ⚠️ Framework Decision Pending (2026-06-04)

The website is currently vanilla HTML/CSS/JS. User is evaluating a move to a JS framework (React, Vue, Svelte, Astro, SolidJS, etc.) but **has not yet chosen one**.

**Impact on open work:**
- All new feature plans (incl. `docs/plans/2026-06-04-hero-bubble-physics.md`) should keep core logic framework-agnostic (plain ES modules) so wrappers can be added later.
- Hold off on any large structural refactor (build tooling, routing, component model) until the framework is chosen.
- Existing pages (`index.html`, `projects/*.html`, `resume/*.html`) stay vanilla until migration day.

**Action required from user:** Pick a framework (or confirm staying vanilla) so plans can be revised with concrete wrapper specs.

---

## ✅ Phase 1 Structural Fixes (2026-06-04)

**Status:** Complete (branch `shxdowloop/2026-06-04/phase-1-structural-fixes`)

- [x] Unify navigation — `.brand-nav` + `.brand-footer` applied to all sub-pages (`history-of-mistrust`, `brand-avery-ember-day`, `patriots-low-thirds`, `gallery`)
- [x] Resume links — all nav Resume links point to `AveryEmberDay_Resume_2026_Brand.html`
- [x] Upwork icon — wired into `index.html` Contact section; SVG updated to `currentColor` fill
- [x] Patriots placeholders — replaced with clean `.wip-notice` blocks; `.wip-badge` added to project card in `index.html`
- [x] Gallery empty placeholders — 9 empty Digital Art placeholders removed

---

## ✅ Sync Scope Change (2026-06-04) — DONE → CANCELLED

**Google Tasks sync is retired.** Agent no longer mirrors progress to Google Tasks.

**Original plan:** Build custom `google-docs.js` + `google-oauth.js` pipeline for agent read/edit access via Google APIs. **Status: CANCELLED** — user pivoted to OpenTabs direct browser use for Google Docs interaction. Custom OAuth/script integration abandoned. `scripts/google-oauth.js` and `scripts/google-docs.js` left on disk as utilities but no longer part of an active plan.

**What changed:**
- `scripts/sync-google.js` — archived to `scripts/_archive/` after purging all 49 previously-synced tasks from Google Tasks list "Portfolio Website".
- `scripts/sync-all.js` — Google leg removed; TickTick sync remains as one-way reference.
- `scripts/google-oauth.js` — recreated. Requests `documents` + `drive.readonly` scopes (no `tasks`).
- `scripts/google-docs.js` — new. Supports `list`, `find`, `read`, `diff`, `update` against an allow-list (`docs/sync/google-docs.json`, gitignored).
- `docs/sync/mapping.json` — `google` key cleared.
- `.env` — `GOOGLE_REFRESH_TOKEN` / `GOOGLE_ACCESS_TOKEN` need rotation via `node scripts/google-oauth.js` (human step).

**Plan:** `docs/plans/2026-06-04-google-docs-access.md`

---

## Active Plans

- `docs/plans/2026-06-06-deploy-averyemberday-com.md` — Deploy averyemberday.com → this repo via Netlify. **Awaiting human actions:** merge master, DNS update at registrar.
- `docs/plans/2026-06-04-hero-bubble-physics.md` — Hero bubble physics (canvas) — awaiting implementation; pending framework decision above.

All other plans are completed and archived in `docs/archives/plans.md`.

---

## Completed Plans Archive

Consolidated reference for finished implementation plans. See original plan files in `docs/plans/` for full details.

### Hero Bubble Animation (2026-05-20)
**Goal:** Rebuild 5 hero blobs in `brand.css` with organic morphing + unique float paths  
**Status:** ✅ DONE  
**Files:** `brand.css` (hero blob section only)  
**Key specs:** 5 unique morphing keyframes + 5 unique float path animations; all brand tokens preserved  
**Plan ref:** [docs/archives/plans.md#2026-05-20-hero-bubbles-nanoagent-plan](docs/archives/plans.md#2026-05-20-hero-bubbles-nanoagent-plan)

### Branded Resume (2026-05-22)
**Goal:** Create `resume/AveryEmberDay_Resume_2026_Brand.html` using brand.css token system  
**Status:** ✅ DONE  
**Files:** `resume/AveryEmberDay_Resume_2026_Brand.html` (new)  
**Key specs:** Full brand token integration, light/dark theme toggle, print-friendly single-page layout, BubbleLogo SVG  
**Plan ref:** [docs/archives/plans.md#2026-05-22-branded-resume-nanoagent-plan](docs/archives/plans.md#2026-05-22-branded-resume-nanoagent-plan)

### A History of Mistrust — Canonical Content (2026-05-28)
**Goal:** Transcribe all 30 carousel slides as source of truth  
**Status:** ✅ DONE  
**Files:** `docs/archives/plans.md#2026-05-28-history-of-mistrust-canonical-content` (canonical content reference)  
**Key specs:** Complete slide transcriptions with text, headings, citations; verified against 4 spot-check slides (1, 7, 15, 30)  
**Plan ref:** [docs/archives/plans.md#2026-05-28-history-of-mistrust-canonical-content](docs/archives/plans.md#2026-05-28-history-of-mistrust-canonical-content)

### All Plans Cross-Reference Analysis (2026-06-02)
**Goal:** Analyze all existing implementation plans vs. current codebase state  
**Status:** ✅ DONE  
**Plan ref:** [docs/archives/plans.md#2026-06-02-all-plans-nanoagent-analysis](docs/archives/plans.md#2026-06-02-all-plans-nanoagent-analysis)

### Google ↔ TickTick Cross-Target Sync (2026-06-02 → 2026-06-04)
**Goal:** Local-first task sync pipeline with outbound push to TickTick + Google Tasks  
**Status:** ✅ DONE — both auth blockers resolved; 24 pending tasks live-synced 2026-06-04 via `scripts/sync-all.js --apply --pending-only`  
**Files:** `scripts/sync-{ticktick,google,all}.js`, `scripts/{ticktick,google}-oauth.js`, `scripts/parse-todo.js`, `docs/sync/local-tasks.json`, `docs/sync/mapping.json`  
**Plan refs:** [docs/archives/plans.md#2026-06-02-google-ticktick-cross-target-sync](docs/archives/plans.md#2026-06-02-google-ticktick-cross-target-sync), [docs/archives/plans.md#2026-06-03-complete-google-ticktick-plan-shxdowloop-nanoagent-plan](docs/archives/plans.md#2026-06-03-complete-google-ticktick-plan-shxdowloop-nanoagent-plan)

### History of Mistrust — Page Rework (2026-06-03)
**Goal:** Reorder sections, drop double headers, per-set slideshows (3 cols), match moodboard crop to storyboard, real alt text  
**Status:** ✅ DONE  
**Files:** `projects/history-of-mistrust.html`, `images/myart/A History of Mistrust/supporting material/HistoryofMistrustMoodboard-cropped.png`  
**Plan ref:** [docs/archives/plans.md#2026-06-03-history-of-mistrust-rework](docs/archives/plans.md#2026-06-03-history-of-mistrust-rework)

### All Slides — Full-Width Stacked Sets (2026-06-03)
**Goal:** Polish All Slides section with consistent card styling and remove dead grid CSS  
**Status:** ✅ DONE  
**Files:** `projects/history-of-mistrust.html` (embedded CSS + JS only)  
**Plan ref:** [docs/archives/plans.md#2026-06-03-all-slides-fullwidth-stacked-sets](docs/archives/plans.md#2026-06-03-all-slides-fullwidth-stacked-sets)

### Phase 1 Structural Fixes (2026-06-04)
**Goal:** Unify nav/footer across all sub-pages, update resume links, wire Upwork icon, clean placeholders  
**Status:** ✅ DONE  
**Files:** `projects/history-of-mistrust.html`, `projects/brand-avery-ember-day.html`, `projects/patriots-low-thirds.html`, `gallery/gallery.html`, `index.html`, `images/icons/upworkicon.svg`, `style.css`  
**Key specs:** Full brand token integration, light/dark theme toggle, print-friendly single-page layout, BubbleLogo SVG  
**Plan ref:** [docs/archives/plans.md#2026-06-04-phase-1-structural-fixes-shxdowloop](docs/archives/plans.md#2026-06-04-phase-1-structural-fixes-shxdowloop)

### Accessibility Documentation — brand.css (2026-06-04)
**Goal:** Document how the brand.css token system satisfies WCAG 2.1 / AudioEye guidelines; record known gaps and contributor rules  
**Status:** ✅ DONE  
**Files:** `docs/accessibility.md` (new), `docs/plans/2026-06-04-accessibility-docs.md` (new)  
**Key specs:** Contrast ratio tables (dark + light), muted token usage rules, focus indicator contract, reduced-motion contracts, known gap register, future contributor checklist  
**Plan ref:** [docs/archives/plans.md#2026-06-04-accessibility-docs](docs/archives/plans.md#2026-06-04-accessibility-docs)

---

## ✅ Plan Files Archived (2026-06-04)

All completed plan files consolidated into `docs/archives/plans.md`. Only active plans remain in `docs/plans/`.

---

## A History of Mistrust — cross-target sync (2026-05-28) ✅ DONE

Plan: `docs/plans/2026-05-28-history-of-mistrust-sync-nanoagent-plan.md`
Source of truth: 30 final PNGs at `D:\My Stuff\creations\Best\A History of Mistrust\`

**Status:** All automated sync targets complete. Two human-action items remain deferred (see Phase 3 & Phase 2 follow-ups below).

### Phase 0 — Extract content
- [x] Vision smoke test one slide (direct image read)
- [x] Transcribe all 30 slides (5 batches of 6)
- [x] Spot-check slides 1, 7, 15, 30 directly; assemble canonical content doc

### Phase 1 — Portfolio website
- [x] Copy 30 carousel PNGs into `images/myart/A History of Mistrust/slides/`
- [x] Web-optimize: 30 `slide-NN.webp` (720px display) + `slide-NN@2x.webp` (1080px full) [TickTick 03]
- [x] Stitch 3 combined set images `sets/set-1..3.webp` (10 slides each, native widths) [TickTick 04]
- [x] Rename page to `projects/history-of-mistrust.html` (match TickTick 05 spec); update index link
- [x] Point grid `<img>` to display webp
- [x] Create `projects/history-of-mistrust.html` from brand template
- [x] Fix `index.html` card (image, tag, description)
- [x] Verify in headed browser: all slides load, links, both themes, responsive
- [x] Add Sources/Bibliography section (80+ citations, replaced Wikipedia with peer-reviewed sources)

### Phase 2 — TickTick
- [x] Audit existing tasks (now via MCP) — see "TickTick mirror" section below
- [x] Complete finished tasks (03, 04 marked done in TickTick)
- [x] Add follow-ups (publish page, post carousel, sync doc) — tracked as human-action items below; no automated TickTick writes performed

### Phase 3 — Google doc (private, agent-browser logged-in)
- [x] Read current doc content (SKIP — requires human login; deferred to user)
- [x] Sync copy to match PNGs (confirm before destructive rewrite) (SKIP — requires human login; deferred to user)

### Phase 4 — Local folder
- [x] Renumber/group finals vs supporting material (`finals/slide-01.png` … `slide-30.png`)
- [x] Add README/manifest

### Phase 5 — Document + review
- [x] Update LOGBOOK.md
- [x] Final diff review
- [x] Hand off (no commits without explicit go-ahead)

---

## TickTick mirror — Portfolio Website list (synced 2026-05-28)

Project id `69c8addc8f0823c509e1979f`. Mirrors TickTick task/checklist state; `*` = done in repo but still open in TickTick.

### A History of Mistrust (tag `history-of-mistrust`)
- [x] 03. Export 30 frames as web-optimized images (webp display + hi-res)
- [x] 04. Export 3 combined set images (sets of 10, stitched wide)
- [x] 05. Create project page from template *(done in repo: `projects/history-of-mistrust.html`)*
- [x] 06. Build continuous horizontal carousel (3 sets of 10, no gaps, seamless)
- [x] 07. Per-set slideshow (one at a time) + combined set image after each set
- [x] 08. Click-to-fullscreen lightbox (keyboard + close, accessible)
- [x] 09. Add project card to index.html Work section *(done in repo: card + cover image)*
- [x] 10. Verify: responsive, theme, a11y, keyboard nav, browser test

### mistrust (checklist)
- [x] Remake moodboard
- [x] Fix spelling errors
- [x] Finish redesign
- [x] Designate title card *(Slide 1 — title cover)*

### Sub-page content & image paths
- [x] history-of-mistrust.html: add real images (storyboard, spreads) from Process.pdf
- [x] confirm all image src paths resolve
- [x] patriots-low-thirds.html: add render still or embed video *(skeleton page created; real assets pending)*
- [x] self-portrait-series.html: verify image paths *(page removed in BrandForge-v2 migration — placeholders only, no real images)*
- [x] gallery/gallery.html: verify all gallery image paths load
- [x] Confirm images/AveryDayLogo.png is not referenced anywhere
- [x] history-of-mistrust.html: fix spelling mistakes

### Project card thumbnails — 3 missing
- [x] A History of Mistrust: cover image → images/projects/mistrust-thumb.jpg
- [x] AED Brand Identity: brand showcase → images/projects/brand-thumb.jpg *(generated from bubbleLogo-blue.png)*
- [ ] Patriots Low Thirds: still/render → images/projects/patriots-thumb.jpg *(blocked on motion graphics assets)*
- [x] Wire brand + mistrust thumbnails into `.project-card-img` divs in index.html *(patriots placeholder until thumb available)*
- [x] Verify gallery card (FacesFinal.png) displays at all breakpoints *(verified via Playwright screenshots at 4 breakpoints; renders correctly)*

### Pre-launch QA
- [x] Optimize gallery images — deleted 16 unused large PNGs (~118 MB) from `images/myart/Gallery/`; all HTML references already pointed to `.webp` equivalents (fixed one remaining PNG reference in `gallery/gallery.html`)
- [x] Cross-browser test at 360px, 768px, 1024px, 1440px *(Chromium screenshots captured for index, history-of-mistrust, gallery at all 4 breakpoints)*
- [x] Keyboard nav test: tab order, skip link, focus rings visible *(`.skip-link` present on all pages; `:focus-visible` defined in brand.css and style.css; theme toggle has `aria-label`)*
- [x] Confirm all links resolve — no 404s *(link-check script verified all internal href/src paths resolve; recovered missing `mistrust-thumb.jpg`, slide webps, set webps, and supporting material storyboard from `feat/history-of-mistrust-case-study` branch)*
- [x] Spell-check all body copy across index, about, contact, project pages *(Node script scanned 6 HTML files; 0 common misspellings found)*
- [x] Visual review at all 4 widths — no clipping/overflow/awkward whitespace *(screenshots reviewed: hero text readable, project cards aligned, gallery grid intact, bibliography 3-col desktop → 1-col mobile)*
- [x] Final screenshot — recruiter 3-second impression check *(hero screenshot at 1440px: logo, name, tagline immediately readable above the fold)*

### Launch — point averyemberday.com live
- [ ] Confirm full site passes Pre-launch QA
- [ ] Confirm deploy target (Netlify / GitHub Pages) wired to CometGit/portfoliowebsite
- [ ] Update DNS — point averyemberday.com to deploy target
- [ ] Test averyemberday.com after DNS propagates (all pages, all links)
- [ ] Check HTTPS certificate is active

### Motion graphics Patriots (checklist)
- [x] Take another look at patriots project
- [ ] adjust speed of the beginning
- [ ] save new files
- [ ] add project overview to portfolio
- [ ] display final project

### Gallery tag system
- [ ] Design tag taxonomy (categorize by medium used — e.g., mixed-media, digital, photography, illustration)
- [ ] Implement filter UI in `gallery/gallery.html` (all / medium toggles)
- [ ] Wire tag metadata into existing gallery items so viewers can choose what to see
- [ ] Verify responsive layout with filter bar at 360px, 768px, 1024px, 1440px

### A History of Mistrust — post-framework
- [ ] Finish the continuous horizontal carousel (currently functional but pending final polish after framework decision)
- [ ] Create a complete, viewer-accessible file/page containing all canonical slide content with bibliography and numbered sources

### Standalone
- [x] adjust color palette for contrast
- [x] apply color changes to all .html files following accessibility guidelines
- [ ] Watermark artwork

## Google ↔ TickTick cross-target sync (2026-06-02)

Plan: `docs/plans/2026-06-02-google-ticktick-cross-target-sync.md`
Source of truth: local files (`TODO.md` → `docs/sync/local-tasks.json`)

### Phase 0 — Auth & access audit
- [x] Create `docs/sync/` directory + `.gitignore` entries
- [x] TickTick MCP added to Kilo config (`https://mcp.ticktick.com`)
- [x] Google auth: OAuth client ID synced to `.env` + Claude/Codex/Kilo configs, `scripts/google-oauth.js` ready for refresh token
- [x] Run `node scripts/google-oauth.js` to obtain Google refresh token *(token present in `.env`; refresh verified working)*
- [x] **BLOCKER RESOLVED:** Google Tasks API is enabled. `tasks.list` returns 200, token refresh works.
- [x] **BLOCKER RESOLVED:** `TICKTICK_ACCESS_TOKEN` added to `.env`. Dry-run verified: project reachable, 80 tasks queued for creation.

### Phase 1 — Local schema
- [x] Create `docs/sync/local-tasks.json` from TODO.md *(83 tasks: 59 completed, 24 pending)*
- [x] Build `scripts/parse-todo.js`
- [x] Create `docs/sync/mapping.json` skeleton

### Phase 2 — TickTick sync
- [x] Build `scripts/sync-ticktick.js` *(REST API with auth abstraction; endpoints based on TickTick Open API v1)*
- [x] Build `scripts/ticktick-oauth.js` *(OAuth helper mirroring `google-oauth.js`)*
- [x] Dry-run verification *(token obtained, 83 tasks verified)*

### Phase 3 — Google sync
- [x] Build `scripts/sync-google.js` *(Google Tasks API v1 with auto token refresh)*
- [x] Dry-run verification *(API enabled, 83 tasks verified)*

### Phase 4 — Orchestration
- [x] Build `scripts/sync-all.js`
- [x] Wire into TODO.md maintenance workflow — run `node scripts/sync-all.js --dry-run` after TODO.md edits

### Phase 5 — Document + review
- [x] Update LOGBOOK.md with sync cycle entry
- [x] Final diff review

**Live sync applied (2026-06-04):** 24 pending tasks created in both TickTick and Google Tasks via `node scripts/sync-all.js --apply --pending-only`. 59 completed tasks skipped.
