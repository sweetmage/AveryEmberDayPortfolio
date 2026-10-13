## Archived Logbooks

| File | Entries | Date Range |
|------|---------|------------|
| [LOGBOOK_4.md](docs/logbooks/LOGBOOK_4.md) | 130–149 | 2026-08-09 to 2026-10-09 |
| [LOGBOOK_1.md](docs/logbooks/LOGBOOK_1.md) | 080–129 | 2026-07-22 to 2026-08-09 |
| [LOGBOOK_2.md](docs/logbooks/LOGBOOK_2.md) | 030–079 | 2026-06-04 to 2026-07-15 |
| [LOGBOOK_3.md](docs/logbooks/LOGBOOK_3.md) | 008–029 | 2026-05-28 to 2026-06-04 |

## Logbook Maintenance

When this logbook exceeds ~1000 lines, split it:

1. Keep the **last 5 entries** in this root `LOGBOOK.md`.
2. Move all older entries into a new `docs/logbooks/LOGBOOK_N.md` file (N = next sequential number).
3. Keep entries whole — never split an entry across files.
4. Add a header to the archive file with `**Entries covered:**` and `**Date range:**`.
5. Update the **Archived Logbooks** table above with the new file reference.

---

## Entry 155 - 2026-10-13

**Agent:** Claude Sonnet 5.5 (Quillfeather, VOID), main agent
**Cycle:** branch reconcile + gallery watermark fix
**Task:** Reconcile branches against portfoliowebsite, ship the gallery watermarks from public/, remove the page-wide watermark, plan the logo and brand work.

- Branches: local portfoliowebsite (3 ahead) had diverged from origin (3 different commits); claude/reconcile-branches-main-e85f39 already merges both and fast-forwards onto origin/portfoliowebsite. Merged and deletable: shxdowloop/2026-10-06/next-step-cleanup-icons-mistrust, shxdowloop/2026-10-09/print-mockups, claude/bold-cannon-wznaig, backup/portfoliowebsite-2026-10-10. Unmerged, conflicting on trial merge, left alone: fix/2026-10-06-blue-logo-caption (binary baseline PNGs), origin/develop (63 behind), origin/shxdowloop/2026-08-14/mistrust-reexport (63 behind). Nothing pushed or deleted.
- Finding: live gallery was unwatermarked after the Oct 10 deploy (1bcecc5, Netlify ready). The swap and e481c13 only touched root images/, which Next does not publish (/images/watermarked/... 404); live chillFinal.webp and lollypopFinal.webp matched the pre-swap bytes. Checked with curl + shasum against git blobs.
- Changed (ce81a48): all 12 gallery artworks re-composited with sharp from the e1be888 originals (white mark, 27% width, 2.7% margin, bottom-right; Moonlight new at 18%) and written to public/images/myart/Gallery/ (full, 900w, 480w via scripts/generate-image-variants.js --force --only), images/watermarked/Gallery/ and images/myart/Gallery/. The earlier composites had 5-6px light lines along the mark's right and bottom edges (324px long = 27% of width); sharp's render of the SVG has none. The compositing script is not in the repo (/private/tmp/rewm.js, discarded).
- Changed (uncommitted at entry time): removed the page-wide .brand-page-watermark layer from app/layout.tsx and brand.css and deleted public/images/patterns/bubble-watermark.png, at the user's report that the site background was covered in watermarks (Entry 154 overlay). Restorable from a8036ab.
- Docs: new docs/plans/2026-10-13-logo-design-and-brand-expansion.md (Track A logo vectorization into SECTION 6 Logo Design, B tools per project, C Brand page business card, voice/tone and one more section, D watermark removal); TODO.md gains 7 open items and a Done bullet; docs/plans/README.md index row.
- Verification: dev server (portfolio-next) served all 12 gallery 900w files byte-identical to disk, no console errors; no .brand-page-watermark element or watermark background on any element after removal. Eyeballed chill, Moonlight, Emergence. NOT run: Playwright suite or visual gate (baselines for the gallery will differ and need a SOL regeneration with --update-snapshots=all).
- Open: user's go-ahead to push (15-credit deploy); where SECTION 6 lives, what '4 rose versions' means, and the rose PSD location; whether the Brand row lists the site's own frameworks.
- Decisions from the user: SECTION 6 is a new project tile; the White Rose set is 4 SVGs (two logos, color and B&W); source PSD found at ArtBridge/Procreate to PSD/White Rose Logo.psd. Plan and TODO updated; still open: tile title, thumbnail, Phoenix source final?, visible numbering.
- Track A vectorizing: Phoenix (redone) and 4 White Rose SVGs (open rose + bud, color + B&W; green to white) saved to iCloud ArtBridge/SECTION 6 Logo Design/. PSD composited with psd-tools (matches the PSD's own composite, max diff 2); traced on SOL via creative-hub sol-run.sh vectorize with cash/scripts/trace.ps1 (the vectorize skill's copy lacks -NoCrop); canvas stripped and viewBox cropped with crop_svg.py. First B&W bud pass lost its stem fill (open outline merged the white fill with the canvas); retraced on a magenta backdrop and deleted that path. Checked by rendering all five on dark and light. Awaiting the user's visual check; nothing added to the site. Decisions: tile 'SECTION 6 Logo Design' (series title), Phoenix on the title card.
- At the user's request the two B&W rose SVGs now have pure white petals: every light fill (#E1-#E7 greys, #FBFBFB, #FEFEFE) set to #FFFFFF; each file is now black outline plus white only. Checked on dark and pink backdrops. Color versions unchanged.
- Handoff: the user checked the five SVGs ('almost perfect') and found a linework mistake in the art itself; they will re-upload corrected art later. Track A paused; the SVGs in ArtBridge/SECTION 6 Logo Design/ are provisional. Added scripts/logo-traces.py (prepare + finish; prepare verified to reproduce the SOL-run PNGs byte for byte, finish verified to match the saved SVGs apart from the canvas path crop_svg.py strips). Plan gained a HANDOFF section (rebuild steps, SOL/trace.ps1 gotcha, decisions not to re-ask, site work after approval); TODO item rewritten as waiting on the user's art. Which lines are wrong is unknown: ask, do not guess.

---

## Entry 154 - 2026-10-09

**Agent:** Claude Haiku 5.5 (quill, VOID), main agent
**Cycle:** watermark overlay
**Task:** Logo watermark pattern overlay, rendered on SOL

- Source: images/icons/BubbleLogo/bubbleLogo-blue-notxt.png (the Blue mark, no text). Delegated to SOL: new Photoshop job creative-hub/sol/adobe/ps-watermark.ps1 (opacity baked in via merge-down). Run 20261009-180433-18774, 8%.
- Output recompressed losslessly with a zlib level-9 re-encode (642 KB to 11 KB, same alpha: max 20/255, 57717 nonzero px). Installed at public/images/patterns/bubble-watermark.png.
- Site: fixed layer .brand-page-watermark in brand.css (tile 200px, repeat), rendered in app/layout.tsx after the noise layer. Verified in the Next dev server (portfolio-next, port 3000) in dark and light themes: layer z -1, asset 200, no console errors, no horizontal overflow.
- Not pushed: portfoliowebsite pushes deploy to production. Visual-gate baselines (40) will now differ and need a SOL regeneration before any release.
- TODO: watermark item removed from Ready; Oct 9 Done bullet added. .claude/launch.json gains a portfolio-next config.

---

## Entry 153 - 2026-10-09

**Agent:** Claude Haiku 5.5 (quill, VOID), main agent
**Cycle:** shxdowflow: next step
**Task:** Refresh stale docs/ARCHITECTURE.md map

- shxdowmap status read STALE (structural drift vs baseline); ran shxdowmap refresh --auto, which regenerated module-map, key-files, dependencies; status now fresh; baseline 06ddcb16.
- Scope: docs-only. No app code, no TODO change, no push, no deploy.
- Verification: shxdowmap status fresh; git status shows only docs/ARCHITECTURE.md and LOGBOOK.md.
- Proposal approved by Avery in chat (Approve).

---

## Entry 152 - 2026-10-09

**Agent:** Claude Opus 5.5 (lumen, VOID), main
**Cycle:** release: print mockups + footer Home
**Task:** Use SOL for the baselines, then merge and deploy (user).

- SOL: first run died on PS 5.1 treating git's stderr as fatal under Stop (fixed to Continue + exit codes). Second run: 40/40 then two 40/40 re-checks, but bare --update-snapshots (= changed) rewrote only failing captures, so 26 kept a footer without Home (186-196px diff, under the 500px floor). Third run with =all: all 40 rewritten, 40/40 twice; committed 1e8a6fd; docs/visual-gate.md now says =all.
- Final signoff: degraded. OpenCode (opencode/deepseek-v4-pro), the only authenticated off-Claude route, failed in 16s with 'Insufficient account funds' (round lost to the route); Codex out of quota until Oct 30; free rows not allowed. Nano wrapper needed Python 3.11+: installed uv + CPython 3.12 user-level and used NANO_AGENTS_PYTHON_BIN. User accepted degraded after a fresh-context native oracle (Opus 5.5) advisory review: PASS.
- Advisory findings fixed before push (76b4448): motion test was vacuous (decode() before assert); now checks both mockups at transition ready under 40ms CDP latency, 8/8 pass, 5/5 fail with warm-up removed. page.route was tried first and rejected: it disables the HTTP cache, so the real img refetched and correct code failed (a probe-holding 'fix' built on that misreading was reverted). images:mockups scoped with --only. Tailscale IP removed from the public repo. Comment/ARCHITECTURE/plan drift; US spelling in alts.
- Release: portfoliowebsite fast-forwarded 88c8091..76b4448 (12 commits), pushed once. Netlify deploy 6ac98a58 ready, not skipped, 30s, 15 credits. Live: 6 pages 200, 72/72 mockup files 200, footer Home, contact cap gone, Blue caption #7eb8ff, /projects/ 301; Gross expands with both mockups painted at 390 and 1440, zero console errors.
- Suite before push: 184 passed + 1 skipped in 165s (est 175). Review server on :4400 stopped after release. Wren never appeared.
- User reviewed the 24 mockup alt strings in gallery-data.ts (2026-10-09): approved as written.

---

## Entry 151 - 2026-10-09

**Agent:** Claude Opus 5.5 (lumen, VOID), main
**Cycle:** shxdowflow: footer Home link
**Task:** Add a Home link to the footer (user).

- app/components/Footer.tsx: Home (/) first in .brand-footer-links, matching the nav order. One file, so no track table.
- Verification: tsc; non-visual suite 185/185 in 171s (est 170); footer checked at 360/768/1440 in both themes on the export server (one row everywhere; clicking Home lands on /).
- Every page renders the footer, so all 40 chromium-win32 baselines move; TODO's SOL item widened from 16 to 40. Signoff: no trigger met; main-agent diff read. On the mockups branch, so it ships in the same push.

---

## Entry 150 - 2026-10-09

**Agent:** Claude Opus 5.5 (lumen, VOID), main
**Cycle:** shxdowloop, Stage 2
**Task:** Two mockups per gallery piece (user: "i want each one to have 2 mockups").
**Branch:** shxdowloop/2026-10-09/print-mockups

- Manifest now holds two rows per piece, each a different kind in a different scene; 24 mockups (canvas 7, framed 8, poster 8, skateboard 1). Gross: skateboard deck plus a poster on a warm off-white wall. Generator needed no change; existing 12 mockups and 24 variants byte-identical.
- Data: mockup? became mockups: GalleryMockup[] with 24 alt strings in the Stage 1 pattern. Render: both inside one .gallery-mockups wrapper that mounts only while expanded; one mockupSizes constant for the img and the warm-up probe.
- Layout found in verification: equal columns left Gross's portrait deck a full column tall beside a landscape poster a third its height. md+ is now a justified row (flex-grow from each ratio), equal heights (Gross 309px, landscape pairs 223px). Below md they stack, capped at 60% of the screen each.
- Verification: tsc; gallery-mockups spec 20/20 on chromium and webkit-mobile; non-visual suite 185/185 in 172s (est 150); collapsed heights still match 20860ef; expanded captures at 360/768/1440/2560/3440 both themes; new mockups reviewed on a contact sheet.
- Reviews: plan review native oracle (Opus 5.5), 1 round, PASS, 9 findings applied (F2 kept single-owner with reason). Final signoff: no trigger met; main-agent diff read. Wren absent.
- ? For the user: 24 alt strings to read; Gross's second mockup choice (poster) is one manifest line to change.

---

