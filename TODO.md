# TODO

---

## Completed Plans Archive

Consolidated reference for finished implementation plans. See original plan files in `docs/plans/` for full details.

### Hero Bubble Animation (2026-05-20)
**Goal:** Rebuild 5 hero blobs in `brand.css` with organic morphing + unique float paths  
**Status:** ✅ DONE  
**Files:** `brand.css` (hero blob section only)  
**Key specs:** 5 unique morphing keyframes + 5 unique float path animations; all brand tokens preserved  
**Plan ref:** [docs/plans/2026-05-20-hero-bubbles-nanoagent-plan.md](docs/plans/2026-05-20-hero-bubbles-nanoagent-plan.md)

### Branded Resume (2026-05-22)
**Goal:** Create `resume/AveryEmberDay_Resume_2026_Brand.html` using brand.css token system  
**Status:** ✅ DONE  
**Files:** `resume/AveryEmberDay_Resume_2026_Brand.html` (new)  
**Key specs:** Full brand token integration, light/dark theme toggle, print-friendly single-page layout, BubbleLogo SVG  
**Plan ref:** [docs/plans/2026-05-22-branded-resume-nanoagent-plan.md](docs/plans/2026-05-22-branded-resume-nanoagent-plan.md)

### A History of Mistrust — Canonical Content (2026-05-28)
**Goal:** Transcribe all 30 carousel slides as source of truth  
**Status:** ✅ DONE  
**Files:** `docs/plans/2026-05-28-history-of-mistrust-canonical-content.md` (canonical content reference)  
**Key specs:** Complete slide transcriptions with text, headings, citations; verified against 4 spot-check slides (1, 7, 15, 30)  
**Plan ref:** [docs/plans/2026-05-28-history-of-mistrust-canonical-content.md](docs/plans/2026-05-28-history-of-mistrust-canonical-content.md)

### All Plans Cross-Reference Analysis (2026-06-02)
**Goal:** Analyze all existing implementation plans vs. current codebase state  
**Status:** ✅ DONE  
**Files:** Analysis documentation (read-only reference)  
**Key specs:** Cross-referenced 5 plans, found 3 fully done + 2 partial; identified gaps (missing thumbnails, carousel task tracker)  
**Plan ref:** [docs/plans/2026-06-02-all-plans-nanoagent-analysis.md](docs/plans/2026-06-02-all-plans-nanoagent-analysis.md)

---

## ✅ Phase 2 Complete: Plan Files Archived (2026-06-02)

All 7 plan files moved to `docs/archives/plans/` for historical preservation. Original detailed specs remain accessible via archive links in Completed Plans Archive section above.

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
- [ ] Verify gallery card (FacesFinal.png) displays at all breakpoints

### Pre-launch QA
- [ ] Optimize gallery images — most PNGs are 5–19MB, resize/compress before deploy
- [ ] Cross-browser test at 360px, 768px, 1024px, 1440px
- [ ] Keyboard nav test: tab order, skip link, focus rings visible
- [ ] Confirm all links resolve — no 404s (sub-page back-links, resume link)
- [ ] Spell-check all body copy across index, about, contact, project pages
- [ ] Visual review at all 4 widths — no clipping/overflow/awkward whitespace
- [ ] Final screenshot — recruiter 3-second impression check

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

### Standalone
- [ ] adjust color palette for contrast
- [ ] Watermark artwork

---

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
