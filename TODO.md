# TODO

## A History of Mistrust — cross-target sync (2026-05-28)

Plan: `docs/plans/2026-05-28-history-of-mistrust-sync-nanoagent-plan.md`
Source of truth: 30 final PNGs at `D:\My Stuff\creations\Best\A History of Mistrust\`

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
- [ ] Add follow-ups (publish page, post carousel, sync doc) — deferred

### Phase 3 — Google doc (private, agent-browser logged-in)
- [ ] Read current doc content (SKIP — requires human login)
- [ ] Sync copy to match PNGs (confirm before destructive rewrite) (SKIP — requires human login)

### Phase 4 — Local folder
- [x] Renumber/group finals vs supporting material (`finals/slide-01.png` … `slide-30.png`)
- [x] Add README/manifest

### Phase 5 — Document + review
- [x] Update LOGBOOK.md
- [x] Final diff review
- [ ] Hand off (no commits without explicit go-ahead)

---

## TickTick mirror — Portfolio Website list (synced 2026-05-28)

Project id `69c8addc8f0823c509e1979f`. Mirrors TickTick task/checklist state; `*` = done in repo but still open in TickTick.

### A History of Mistrust (tag `history-of-mistrust`)
- [x] 03. Export 30 frames as web-optimized images (webp display + hi-res)
- [x] 04. Export 3 combined set images (sets of 10, stitched wide)
- [x] 05. Create project page from template *(done in repo: `projects/history-of-mistrust.html`)*
- [ ] 06. Build continuous horizontal carousel (3 sets of 10, no gaps, seamless)
- [ ] 07. Per-set slideshow (one at a time) + combined set image after each set
- [ ] 08. Click-to-fullscreen lightbox (keyboard + close, accessible)
- [x] 09. Add project card to index.html Work section *(done in repo: card + cover image)*
- [ ] 10. Verify: responsive, theme, a11y, keyboard nav, browser test

### mistrust (checklist)
- [x] Remake moodboard
- [x] Fix spelling errors
- [x] Finish redesign
- [x] Designate title card *(Slide 1 — title cover)*

### Sub-page content & image paths
- [x] history-of-mistrust.html: add real images (storyboard, spreads) from Process.pdf
- [x] confirm all image src paths resolve
- [ ] patriots-low-thirds.html: add render still or embed video
- [x] self-portrait-series.html: verify image paths *(page removed in BrandForge-v2 migration — placeholders only, no real images)*
- [x] gallery/gallery.html: verify all gallery image paths load
- [x] Confirm images/AveryDayLogo.png is not referenced anywhere
- [x] history-of-mistrust.html: fix spelling mistakes

### Project card thumbnails — 3 missing
- [x] A History of Mistrust: cover image → images/projects/mistrust-thumb.jpg
- [ ] AED Brand Identity: brand showcase → images/projects/brand-thumb.jpg
- [ ] Patriots Low Thirds: still/render → images/projects/patriots-thumb.jpg
- [ ] Wire all 3 thumbnail `<img>` tags into `.project-card-img` divs in index.html
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
