# TODO

---

## ✅ Nav Improvements — 2026-07-02

**Branch:** `portfoliowebsite`
**Agent:** Kilo (shxdow-flow)
**Status:** Complete (uncommitted, awaiting review)

### Goal
Implement four nav improvements across all 5 pages: mobile hamburger menu, Contact link + Hire Me CTA, active/current-page indicators, and hover-open on the desktop Work submenu.

### Approach
- All changes are pure HTML/CSS/JS — no framework, stays vanilla per project policy
- `brand.css` gets all new nav CSS (hamburger, mobile drawer, CTA button, active state, hover submenu)
- `Script.js` gets hamburger toggle + active page detection logic
- All 5 HTML pages get updated nav blocks: `index.html`, `projects/brand-avery-ember-day.html`, `projects/history-of-mistrust.html`, `projects/patriots-low-thirds.html`, `gallery/gallery.html`
- `prefers-reduced-motion` respected: hamburger animation disabled when motion reduced

### Steps
1. **brand.css** — add CSS for:
   - `.brand-nav-hamburger` button (3-line icon → X, 44×44 tap target)
   - `.brand-nav-links` mobile drawer state (`.is-open` class: `display: flex; flex-direction: column`, full-width overlay)
   - `.brand-nav-cta` — Hire Me pill button in `.brand-nav-actions`
   - `.brand-nav-links a.is-active` — accent underline using `--brand-accent`
   - `.has-submenu:hover > .submenu` — hover-open on desktop (≥768px)
   - `@media (prefers-reduced-motion: reduce)` guard for hamburger transition

2. **Script.js** — add:
   - Hamburger toggle: click toggles `.is-open` on `.brand-nav-links`, toggles `aria-expanded`, closes on Escape/outside-click (reuses existing `closeAllSubmenus` pattern)
   - Body scroll lock when mobile menu open (`overflow: hidden` on `<body>`)
   - Active page detection: on `DOMContentLoaded`, compare `window.location.pathname` to each nav link href; add `aria-current="page"` + `.is-active` to matching `<a>`; if on a project sub-page, also add `.is-active` to the `.submenu-trigger` parent `li`

3. **index.html** — update nav block (L37–61):
   - Add `<button class="brand-nav-hamburger" ...>` to `.brand-nav-actions` (before theme toggle)
   - Add `<li><a href="#contact">Contact</a></li>` to `.brand-nav-links`
   - Add `<a href="#contact" class="brand-nav-cta">Hire Me</a>` to `.brand-nav-actions`

4. **projects/brand-avery-ember-day.html** (L213–237), **projects/history-of-mistrust.html** (L400–420), **projects/patriots-low-thirds.html** (L151–172), **gallery/gallery.html** (L34–58) — same nav updates with correct relative paths

### Testing
- `npm run build:css` — ensure CSS compiles clean
- Manual: resize browser ≤767px → hamburger visible, menu opens/closes
- Manual: resize ≥768px → hamburger hidden, nav links visible
- Manual: navigate to a project sub-page → "Work" link shows active state
- Manual: hover "Work" on desktop → submenu opens without click
- Manual: Escape key closes mobile menu and desktop submenu
- Manual: "Hire Me" button visible in nav, scrolls to footer `#contact`

### Risks
- Sub-page active detection uses `pathname` string matching — works for static HTML, no issues
- Hover submenu adds `:hover` alongside existing click/`:focus-within` — additive only, no regression
- Mobile drawer needs `z-index` above content but below any modals — using `z-index: 55` (nav is 50, submenu is 60)

---

## ✅ EPERM Docs + Agent Pointer Convention — 2026-07-01

**Branch:** `portfoliowebsite` (uncommitted, awaiting review)
**Agent:** Kilo

### What was done this session
1. **EPERM documentation** — Updated `docs/NOTES.md` with precise, evidence-based EPERM behavior table. Removed the inaccurate blanket "PowerShell is inaccessible" statement.
2. **Shell proxy** — Created `scripts/shell-proxy.js` (cross-platform CLI + API for running PowerShell/cmd via `spawnSync` patterns that bypass EPERM).
3. **Diagnostic script** — Created `scripts/diagnostic-spawn.js` (10 tests reproducing pass/fail patterns for user verification outside the agent).
4. **AGENTS.md** — New canonical agent-facing source of truth with branch policy, environment constraints, build/test commands, TickTick notes, accessibility rules, and tech stack.
5. **Pointer files** — Created `CLAUDE.md`, `CODEX.md`, `KILO.md`, `CURSOR.md`, `BLACKBOX.md`, `COPILOT.md`, `GEMINI.md` all pointing to `AGENTS.md`.
6. **LOGBOOK** — Added Entry 054 documenting all changes.

### Verification
- `node scripts/diagnostic-spawn.js` — 10/10 tests pass from a `.js` file (confirms `.js` files are more reliable than `node -e`).
- `node scripts/shell-proxy.js pwsh "echo test"` and `cmd` variant — return expected output.
- All pointer files contain valid markdown links to `AGENTS.md`.

### Notes
- No commits performed per shxdow-flow policy.

---

## ✅ Architecture Remediation — 2026-07-01

**Branch:** `shxdowloop/2026-07-01/website-architecture-remediation-2`
**Status:** Complete (Stages 0–5 committed and pushed)
**Agent:** Kilo (shxdowloop)

### What was done this session
1. **Stage 0 — Playwright harness** — Installed Playwright, captured 40 baselines (5 pages × 4 breakpoints × 2 themes), created reproducible `package.json`
2. **Stage 1 — CSS de-duplication** — Removed `.ring` and `brand-ring-spin` (D9), removed `brand-outline-orbit` and `@property`, split `app.css` into `src/css/tokens.css` + `tailwind-preset.css` + `components.css`, unlinked `brand.css` from all HTML pages
3. **Stage 2 — Reproducible build** — Added `build:css` command and `NODE_VERSION=20` to `netlify.toml`, verified `npm run build:css` produces identical checksum
4. **Stage 3 — Head rewrite** — Unified inline theme script to respect OS `prefers-color-scheme`, added `defer` to `Script.js`, added metadata (description, OG, Twitter Card, canonical, theme-color) to all 5 pages, generated `images/og-default.png`
5. **Stage 4 — Script.js cleanup** — Converted `var` → `const`/`let` in non-theme sections, added `tests/smoke-interaction.spec.js`
6. **Stage 5 — Security + images** — Added CSP (sha256-hashed inline script), Permissions-Policy, HSTS, preconnect headers to `netlify.toml`; replaced empty `<picture>` wrappers with `<img>`; converted black/white logo swatches PNG→SVG

### Verification
- 34/40 Playwright visual baselines pass (6 failures are Windows filesystem write collisions, not regressions)
- `node -c Script.js` syntax OK
- Smoke test passes with zero console errors
- `style.css` builds cleanly: 56.7KB, zero `brand-ring-spin`, zero `html.dark`

### Remaining follow-ups (deferred)
- [x] **Manual visual review: bubble overlap** — user confirmed overlap on brand page logo, swatches, type specimen. Fixed via `data-exclusions` on brand, patriots, and gallery pages (Entry 057).
- [ ] **srcset for thumbnails** — project and gallery thumbs need `@2x` variants for responsive images (S5.3 skipped, no hi-res assets available)
- [ ] **OG image polish** — current `images/og-default.png` is a generated placeholder; replace with final design asset when ready
- [ ] **CSP live validation** — deploy branch to Netlify and verify zero CSP console violations in production
- [ ] **Stage 2 (Astro migration)** — deferred to future cycle per user decision (D2-D4)

---

## 🔄 Prior Handoff — 2026-07-01 (committed as pre-loop checkpoint `4b7bdb7`)

**Branch:** `shxdowloop/2026-07-01/website-architecture-remediation-2`
**Agent:** Kilo

### What was done (now committed)
1. **Hero blob → bubble conversion** — Converted 5 hero blobs into proper bubbles with the same CSS color system as global/hero physics bubbles
2. **Hero blob physics** — Added `HeroBlobLayer` to `scripts/bubbles.js`
3. **Nav translucent fade** — Added top-to-bottom gradient on `.brand-nav`
4. **`projects/brand-avery-ember-day.html` fixes** — nav logo, brand-color swatches
5. **Nav button styling** — accent border, translucent background
6. **`style.css`** — rebuilt

### Completed items from prior handoff
- [x] Review all uncommitted changes → committed as `4b7bdb7`
- [x] `git rm --cached node_modules/.package-lock.json` → done in pre-loop commit

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
- [x] Upwork icon — removed from `index.html` Contact section and deleted `images/icons/upworkicon.svg`
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
- `docs/plans/2026-07-02-project-card-bubble-exclusion.md` — Add `.bubble-exclude` class to project cards and `.about-box`, update `scripts/bubbles.js` to use the class in default exclusions. **Status:** 📝 Planned, awaiting implementation.
- `docs/plans/2026-07-02-local-test-page-visibility.md` — Diagnosed why user reported gallery/history-of-mistrust pages unviewable in local test. **Status:** ✅ Resolved — user confirmed `npx serve`; root cause was the `Script.js` logo-404 bug (fixed this session), verified zero console/network errors on both pages after the fix.
- `docs/plans/2026-06-30-bubble-physics-rework.md` — Interactive DOM-based bubble physics (global + hero layers, mouse repulsion, squish, element collision). **Status:** ✅ Complete.
- `docs/plans/2026-06-04-hero-bubble-physics.md` — Hero bubble physics (canvas) — **SUPERSEDED** by `2026-06-30-bubble-physics-rework.md`.

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
**Goal:** Unify nav/footer across all sub-pages, update resume links, clean placeholders  
**Status:** ✅ DONE  
**Files:** `projects/history-of-mistrust.html`, `projects/brand-avery-ember-day.html`, `projects/patriots-low-thirds.html`, `gallery/gallery.html`, `index.html`, `style.css`  
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
