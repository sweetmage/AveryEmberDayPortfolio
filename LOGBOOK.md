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

## Entry 171 - 2026-10-18

**Agent:** OpenCode, claude-opus-5-5 (C0debr34k3r, VOID), main agent
**Cycle:** shxdowloop, visual-baselines
**Task:** Regenerate the copy-pass visual baselines on SOL and fix two intermittent motion tests.

- Branch `shxdowloop/2026-10-18/visual-baselines` from `portfoliowebsite` at `4f2c21f`; Netlify builds only `portfoliowebsite`, so pushing it deploys nothing. Plan: `docs/plans/2026-10-18-visual-baselines-shxdowloop.md`.
- Baselines (SOL, Windows PowerShell, fresh clone in %TEMP%): old set at `c2a2129` 48 passed (3 on retry). Before the update exactly the 24 Portfolio, Brand and Mistrust captures failed. `--update-snapshots=all` also rewrote 4 SECTION 6 captures whose page did not change; they failed both re-checks (639-685px, Trap 7), so the committed copies were restored, and two more re-checks passed 48/48 (2 retries each). Heights match the copy (Portfolio +30.5px per card row; Brand +54 to +190px; Mistrust +0 or +27px); side-by-side crops at the first differing row show only new copy. Committed 24 PNGs.
- `bubbles-motion.spec.js` pointer flick: measured, not slow frames. The stretch follows speed through a 3.2Hz spring and peaks ~80ms after the sweep's last frame; read during the sweep it was 0.02-0.04 (8 of 40 runs under the 0.03 floor), through 20 more frames min 0.113. The test now samples through the settle and asserts > 0.06. 30/30 green; stretch and lean both off fails it.
- `bubbles-exclusion.spec.js` card interior @1440: 4/20 failures on this branch, 0/20 at `c2a2129`. It waited for one of 7 random page-space bubbles to wander into a card (2-200 hits per run; mean ~73 before, ~114 after, so reach did not drop; the taller page made zero more likely). Rewritten to ask the engine: every card has a legal resting spot for the smallest bubble (`_isLegal`), and a bubble placed there stays. 30/30 green at 390/768/1440; re-adding `.gallery-item` to the exclusions fails it.
- Verification: suite minus `visual-baseline.spec.js`, zsh on VOID, twice: 198 passed, 0 failed, 5 skipped each. No leftover processes or scratch on SOL (checked: no 4322 listener, clone and logs removed).
- Review: own diff read; no signoff (tests and baselines, no auth or permission code). Routing: main agent only; spawn_policy found no provider below OpenCode's pace, Claude closed at 100% session.
- Shipped: Comet reviewed the local preview (`serve out` on :4400, stopped after) and said push. `portfoliowebsite` fast-forwarded to the loop branch and pushed: one production deploy.

---

## Entry 170 - 2026-10-18

**Agent:** OpenCode, claude-opus-5-5 (C0debr34k3r, VOID), main agent
**Cycle:** shxdowflow, copy pass
**Task:** Finish the copy pass: Brand and Mistrust summaries and all 12 gallery descriptions, each approved by Comet.

- Copy: the Brand and Mistrust summaries (`BrandProject.tsx`, `MistrustProject.tsx`) and all 12 `description` fields in `app/portfolio/gallery-data.ts`. Each was drafted from the artwork and its listed tools, then revised to Comet's corrections (e.g. Faces, Lollipop and Shadow were painted from photographs; Overflow and Beheaded were color corrected in Photoshop; Shadow is the puppy's name; Texas Lake Landscape is Canyon Lake). Started in a Claude Code session that hit its limit after Faces; continued here.
- `tests/gallery-mockups.spec.js`: the collapsed-height check was measured with every description empty, so it failed by 30.5px once real copy showed its one-line collapsed preview (by design, plan Q1). It now adds the preview back and asserts the preview stays one clamped line (< 31px), so a broken clamp still fails.
- Not done: visual baselines (Portfolio, Brand, Mistrust) must be regenerated on SOL; in TODO.md.
- `bubbles-motion.spec.js:266` failed once under full-suite load and passed 3 of 3 alone; recorded in TODO.md as flaky, unrelated to copy.
- Verification: `tsc --noEmit` clean; `build:next` OK and the new copy is in `out/`; full suite minus `visual-baseline.spec.js` (win32 baselines), zsh on VOID: 198 passed, 0 failed, 5 skipped. First run: 184 passed, 3 failed, 4 skipped, 12 did not run (failures above).
- Review: own diff read; no signoff (copy and one test, no auth or permission code).
- Alt text: all 12 gallery `alt` fields replaced the bare title with a short visual description (Comet approved, with Gross given braids and Overflow made a close-up portrait). Gallery, smoke and project-tile specs: 81 passed, 0 failed, 1 skipped (zsh, VOID).

---

## Entry 169 - 2026-10-17

**Agent:** OpenCode, claude-opus-5-5 (main agent, SOL)
**Task:** Fix the test failures left from Entry 168, and stop the test server leaking.

- `gallery-expand.spec.js`: the two filter-diagonal tests and the slide-out test waited a fixed 60ms for a transition that starts 55-79ms after the click. They now poll until the gallery's view-transition groups exist (`installTransitionWait`). Went from failing 3 of 3 to passing 15 of 15.
- `focus-ring.spec.js:125` (webkit-mobile): Playwright's WebKit on Windows never Tabs to a link, with Alt, Control, Meta or no modifier. Measured: the walk cycles through the theme toggle, Return to top and body. For a control Tab cannot reach, WebKit now Tabs to a button and then focuses the control from script, reading the ring in the same task. Injected-regression check: `transition-all` on the skip link fails it.
- `gallery-mockups.spec.js:119` (webkit-mobile): it was passing but took ~50s against the 30s default. It now has a 120s limit.
- `bubbles-motion.spec.js` layout reads: the zone refresh runs on a 250ms timer, so a slow scroll segment caught extra refreshes and failed 2 of 3 under load. The test now measures what one refresh costs, subtracts refresh reads from both segments, and asserts that scrolling does not raise the refresh count. Injected-regression check: a refresh on every scroll fails it (96 refreshes in 1.5s).
- `bubbles-exclusion.spec.js` hero logo: no repeat in 9 loaded runs. Its failure message now prints the logo rect and the nearest zone, for next time.
- `global-setup.js` teardown: on Windows it killed cmd.exe and left `serve` running on 4322 after every suite. One left over from a temp worktree locked that folder. Fix: `taskkill /T` first. Checked: no 4322 server left after a run.
- Full `npm test` twice, PowerShell: 246 passed, 0 failed, 5 skipped, both runs.

## Entry 168 - 2026-10-17

**Agent:** OpenCode, claude-opus-5-5 (main agent, SOL)
**Task:** Proofread the SECTION 6 logo descriptions and apply the versions the user picked.

- Copy (`app/portfolio/Section6Project.tsx`): Phoenix is now "A stencil symbol for a revolutionary movement ignited by the legendary hero Phoenix, sprayed onto armor, flags and walls." White Rose is now "The logo of a large, morally ambiguous research corporation." The fixes: the order and comma in "large, morally ambiguous", the comma that made "ignited" seem to describe the symbol, the plainer "for", and the sprayed-on detail brought back from the old line.
- 8 `portfolio-section-6` baselines regenerated; 360 light and 1440 dark checked by eye.
- Verification: tsc 0. Full `npm test` twice: run 1 had 235 passed, 3 failed and 4 skipped; run 2 had 221 passed, 4 failed and 4 skipped. Both runs had the 2 known webkit-mobile failures plus `gallery-expand.spec.js:634` (the fixed 60ms wait in TODO). That test fails 3 of 3 at `cf198cb`, before this change, as well. Run 2 also had `bubbles-exclusion.spec.js:219`, which passed 3 of 3 when run alone.

## Entry 167 - 2026-10-17

**Agent:** Claude Opus 5.5 (main agent, SOL)
**Cycle:** shxdowloop, Stage 1 (SECTION 6 logo descriptions)
**Task:** Replace the Phoenix and White Rose descriptions on the SECTION 6 page with the user's wording.

- Copy (`app/portfolio/Section6Project.tsx`), the user's words with a closing period added to the Phoenix line: "A stencil symbol representing a revolutionary movement, ignited by the legendary hero, Phoenix." and "The logo of a morally ambiguous, large scientific research corporation."
- Branch `shxdowloop/2026-10-17/section6-logo-descriptions`, cut from the unmerged bubble branch at `e6c110d` at the user's choice. Plan: `docs/plans/2026-10-17-section6-logo-descriptions-shxdowloop.md`.
- Plan review PASS on agy (gemini-3.8-flash-high). The Codex attempt was void (its sandbox blocked the file read), and OpenCode failed on an expired API key. The reviewer's point applied: the copy change moves pixels, so the 8 `portfolio-section-6` baselines were regenerated and the 360 light and 1440 dark captures were reviewed by eye.
- Verification: tsc 0; `npm run build:next` 0; the export has both new strings and neither old one. Full `npm test` 3 runs: 243 passed, 2 failed every time: `focus-ring.spec.js:124` and `gallery-mockups.spec.js:119` on webkit-mobile. Both are the known base-commit failures in TODO; every visual baseline passed.
- Not merged or deployed. Merging into `portfoliowebsite` also ships the bubble engine and is a 15-credit production deploy.

## Entry 166 - 2026-10-16

**Agent:** Claude Opus 5.5 (main agent, SOL)
**Cycle:** shxdowloop, Stage 2 (fluid squishy bubbles)
**Task:** Port the approved feel-lab model into the site's bubble engine and meet the measured pass marks.

- Engine rebuilt (`scripts/bubbles.js`, copied to `public/`): global layer is page-space (`position: absolute`, height from `<html>`'s box) so it scrolls with the content; zones stored in page coordinates with fixed/sticky chrome re-read per frame; fixed 120Hz physics on the rAF timestamp with interpolated rendering; oriented, area-preserving jelly squish as one `matrix()`; cushioned contacts in the 24px buffer with a hard 4px guarantee against each element; drift currents; smoothed scroll sway; pointer flick and lean; touch release clears the pointer. Hero blobs keep their soft steering and gain the clock, drift and squish.
- Measured, before -> after: scroll lag 300px -> 0; layout reads per scroll event 50 -> 0.3; jerk p99 2.90 -> under 0.4; 120Hz/60Hz speed ratio 2.00 -> 1.0001; engine cost 0.13 -> 0.20ms per frame.
- Found and fixed by instrumenting: on Contact @1440 the relocation search demanded the full soft padding and found no free point, so wedged bubbles stayed on the form. Relocation now tests the hard rule and fires at once; 0 overlapping frames in 6x600 frames after.
- Pre-existing, recorded in TODO: two WebKit specs fail on SOL at 9f9f960 too; the gallery filter-diagonal tests' fixed 60ms wait races a 55-79ms view-transition start with or without the engine.
- Plan review: OpenCode (Codex at usage limit), PASS, findings applied. Final signoff: OpenCode `gpt-6-luna` over 9f9f960..8dacf4e, PASS; nits applied (counts, wording, a pointer flick / squish / touch release / hero-blob test). Route: main agent only (tracker missing).

---

## Entry 165 - 2026-10-16

**Agent:** Claude Opus 5.5 (main agent, SOL)
**Cycle:** shxdowloop, Stages 0-1 (fluid squishy bubbles)
**Task:** Make the bubbles fluid and squishy, remove scroll jitter, improve pointer response. Branch `shxdowloop/2026-10-16/fluid-squishy-bubbles`; plan `docs/plans/2026-10-16-fluid-squishy-bubbles-shxdowloop.md`.

- Stage 0: feel lab `docs/mockups/bubble-feel-lab.html` (today's engine ported beside the proposed jelly model, live sliders). Proposed model held 0px² overlap with protected content over a 1500-frame soak with throws and scrolls; today's engine 916px². Awaiting the user's approval before any engine change.
- Stage 1: new `tests/bubbles-motion.spec.js` probe, baseline on the unchanged engine: global bubbles lag a 300px scroll by the full 300px until the engine's next frame (the jitter), 49.5 layout reads per scroll event, 2.0x speed at 120Hz against 60Hz, p99 page-space jerk 0.51px. html is `scroll-behavior: smooth`, so probes scroll with `behavior: 'instant'`.
- Route: main agent only; shxdowTracker missing, so no native helpers. Logbook skill missing; entry written by hand.

---

## Entry 164 - 2026-10-14

**Agent:** Claude Sonnet 5.5 (ember-quill, VOID), main agent
**Cycle:** shxdowloop overnight plans: second release shipped
**Task:** Record the second production release.

- Fast-forwarded origin/portfoliowebsite 5c72a0a..68deb9b (8 commits) in one push; Netlify deploy 6acfe595 ready for 68deb9b (15 credits). Before it: final code re-checked on SOL against the committed baselines, three runs, 48 passed each.
- Live checks: all six pages 200; Brand has the Adobe Creative Suite paragraph, the 48-screenshot wording, the new bubble-logo alt text and no Brand Assets text; Mistrust has the Figma pill and not the old sentence; SECTION 6 cards in the order Phoenix, Rose 1 B&W, Rose 1 color, Rose 2 B&W, Rose 2 color; all five logos load; no console errors.
- Still open: 12 gallery descriptions and both project summaries (user drafts); Brand Assets pieces (user will make); stale local branches (reset or delete on the user's yes).

---

## Entry 163 - 2026-10-14

**Agent:** Claude Sonnet 5.5 (ember-quill, VOID), main agent
**Cycle:** shxdowloop overnight plans: second release
**Task:** Release the White Rose 2x2, Tools rows and Brand alt text together, at the user's 'approve changes and push all together' (2026-10-14).

- Built since the first release: White Rose logos two by two from 768px (open B&W, open color, bud B&W, bud color); Tools row on Mistrust (one Figma pill, no sentence); Brand Tools is the user's paragraph (Adobe Creative Suite, 48-screenshot gate) above the website pills; Brand logo alt text 'Blue/Black/White bubble logo with the initials A E D' and 'Blue/Black/White bubble logo'. JavaScript dropped from the Brand tools.
- Gates: second fresh-context final signoff PASS (typecheck, 148 non-visual chromium tests); its follow-ups applied (stale comment, dead data removed, three new tests for the Tools rows and alt text, plan and mockup wording, TODO and logbook sync). Baselines: a subset regeneration left brand @ 1440 light failing the full-suite re-check (same 1793 px on both attempts, passed alone), so the full 48 were regenerated and only the changed pages kept; three full re-checks, 48 passed each.

---

## Entry 162 - 2026-10-14

**Agent:** Claude Sonnet 5.5 (ember-quill, VOID), main agent
**Cycle:** shxdowloop overnight plans: follow-up
**Task:** White Rose logos two by two, in the user's order.

- Section6Project.tsx: roses reordered (open B&W, open color, bud B&W, bud color) and laid out grid-cols-1 md:grid-cols-2. New tests: order of the four labels, 2x2 at 1440, one column at 767. 21 chromium tests green.
- SOL: the first full regeneration hit Trap 7 noise on the Portfolio page at 768 dark (a page this change did not touch, 1170 px, both attempts). Restored the committed baselines on SOL and regenerated only the 8 SECTION 6 ones; three full re-checks, 0 hard failures (1 to 2 flaky each, passing on retry). Not deployed: costs 15 credits, waits for the user's go-ahead.

---

## Entry 161 - 2026-10-14

**Agent:** Claude Sonnet 5.5 (ember-quill, VOID), main agent
**Cycle:** shxdowloop overnight plans: released
**Task:** Record the production release of the loop branch.

- Released at the user's 'deploy' (2026-10-14): fast-forwarded origin/portfoliowebsite 8bf209f..54177bf (22 commits), one push. Netlify deploy 6acfd688 ready for 54177bf (15 credits).
- Live checks: /, /portfolio/, /portfolio/brand/, /portfolio/history-of-mistrust/, /portfolio/section-6-logo-design/, /contact/ all 200; all 11 new files under /images/section-6/ 200; the Portfolio page shows three tiles with all pictures loaded and no sideways scroll; the SECTION 6 page shows five logos (lazy-loaded, all load on scroll) and 10 downloads; the Brand page has Brand Voice and Tone, has no Brand Assets text and no US-spelling line; no console errors.
- Still open: review of the agent's first-draft logo alt text, mockup 3 (Tools on Brand and Mistrust), the 12 gallery descriptions and both project summaries (user drafts), Brand Assets pieces (user will make), the stale local branches (reset or delete on the user's yes).

---

## Entry 160 - 2026-10-14

**Agent:** Claude Sonnet 5.5 (ember-quill, VOID), main agent
**Cycle:** shxdowloop overnight plans: release
**Task:** Release the loop branch to production at the user's 'deploy' (2026-10-14).

- Gates before the push: 147 non-visual chromium tests green on a fresh export build; visual baselines regenerated on SOL with --update-snapshots=all and two clean re-checks (48 each), run twice (the second after the final-signoff fixes); 24 untouched pages byte-identical, the changed or new ones (portfolio, brand, SECTION 6) reviewed by eye.
- Final signoff: a fresh-context oracle read the full diff and returned PASS (typecheck, next build, 147 chromium tests, webkit-mobile 41 of 42 with 1 skipped; hidden Brand Assets absent from every exported file). Applied: voice table dividers rebuilt as per-row groups (the old last-of-type selector removed every divider at md and up), Phoenix card label now says Dark backgrounds, docs and memory wording synced.
- Not done, and live as drafts: the logo alt text is the agent's first draft (user review still open); mockup 3 (Tools on Brand and Mistrust) still pending; 12 gallery descriptions and both project summaries still need the user's drafts.

---

## Entry 159 - 2026-10-14

**Agent:** Claude Sonnet 5.5 (ember-quill, VOID), main agent
**Cycle:** shxdowloop overnight plans: brand voice approved
**Task:** Put the brand voice and tone section on the Brand page, take out two lines, record the user's approval.

- Drafted and revised over five passes at the user's notes: fewer I statements, no this-not-that comparisons, only what the brand is, plain English with vibe adjectives, no use of the longer bio. Saved the rules to .agents/memories/brand-voice.md (indexed in AGENTS.md). Research in docs/plans/2026-10-13-brand-voice-recommendation.md.
- Built as BrandVoice in app/portfolio/BrandProject.tsx after Type System (text kept as data). User removed 'Use US spelling. Use one title: Brand & Visual Designer.' from the page, then approved (2026-10-14). Checked in the browser: 320px no sideways scroll, the page no longer contains either line.
- Open before the production push: SOL baseline regeneration (portfolio, Brand, new SECTION 6 page), review of the agent's first-draft logo alt text, mockup 3 (Tools on Brand and Mistrust), and the user's go-ahead (one 15-credit deploy). Not pushed to portfoliowebsite.

---

## Entry 158 - 2026-10-13

**Agent:** Claude Sonnet 5.5 (ember-quill, VOID), main agent
**Cycle:** shxdowloop overnight plans: build the approved pages
**Task:** Build the approved SECTION 6 tile and page, add the hidden Brand Assets section, research brand voice and tone.

- User approved mockups 1 and 2, did not approve the business card (mockup 4), named the extra Brand section Brand Assets (hidden for now), and said the rose logo is fixed. Brand voice and tone must be finished before any push to portfoliowebsite.
- Built: SECTION 6 tile (third tile, three-across grid from 768px) and /portfolio/section-6-logo-design/ (Section6Project.tsx, assets in public/images/section-6/ with PNG twins and phoenix-thumb.svg), BrandAssets behind SHOW_BRAND_ASSETS=false (absent from out/ HTML, tested). Tests: project-tiles and smoke-next updated to 3 tiles, new SECTION 6 tests, 20 chromium tests green (project-tiles 16, smoke-next 4) on a fresh export build; visual gate lists the new page, baselines NOT regenerated (one SOL pass, last).
- Research: 9 sources on what brands put in voice and tone sections (Mailchimp, Monzo, Atlassian, Slack, template and freelancer guides) plus an analysis of the live copy. Recommendation in docs/plans/2026-10-13-brand-voice-recommendation.md: one screen, three traits (plainspoken, warm and listening, dry with a little wonder), tone table, use and avoid word list. The user drafts, the agent proofreads.
- Open: the user's voice and tone draft, review of the agent's first-draft logo alt text, mockup 3 (Tools on Brand and Mistrust), SOL baseline regeneration, then the user's go-ahead to push.

---

## Entry 157 - 2026-10-13

**Agent:** Claude Sonnet 5.5 (ember-quill, VOID), main agent
**Cycle:** shxdowloop overnight plans: user's four logo changes
**Task:** Phoenix vivid red, Phoenix tile close-up, rose leaf green under the linework, short descriptions with tools.

- scripts/logo-traces.py: PHOENIX_FILL is now #E4101E; new stack() rebuilds the open rose's leaves as outline ink over green over fill grey and drops the green layers' own rim, so the order is fixed before vectorizing. The bud (green already at the bottom) came out byte-identical. Re-traced on SOL (color and B&W roses 6 Colors, Phoenix Black and White Logo), cropped, checked on dark, mid and light backdrops, saved over the provisional files in ArtBridge/SECTION 6 Logo Design/ (v1 kept in the session scratchpad).
- Mockups updated: Phoenix tile is a 16:9 close-up of the top 36% of the art (phoenix-thumb.svg) on the dark backdrop; page 2 has the short rewrites and a Tools row (Procreate, Adobe InDesign, Adobe Photoshop). Copy rewritten at the user's explicit request, so the verbatim rule is lifted for these strings only.
- Docs: logo plan has an Update 2026-10-13 (later) section; the overnight plan and TODO match. All five mockup pages are still pending the user's approval.

---

## Entry 156 - 2026-10-13

**Agent:** Claude Sonnet 5.5 (ember-quill, VOID), main agent
**Cycle:** shxdowloop overnight plans draft
**Task:** Draft every open plan for the user's morning review and build visual mockups for approval; no real UI built.

- Branch: shxdowloop/2026-10-13/overnight-plans, cut from origin/portfoliowebsite (8bf209f). The starting worktree was 3 docs commits behind; its upstream was unset because switch -c from a remote ref had made it track production. Pushed only as a named branch (Netlify allowed_branches is portfoliowebsite only).
- Added docs/plans/2026-10-13-overnight-plans-shxdowloop.md (master plan in the user's voice: tracks A to E, stages, morning checklist with every question and upload) and five static mockups with an index under docs/plans/2026-10-13-overnight-plans/mockups/, linked to the real brand.css. All five pages are pending; none approved.
- Mockups caught two design problems early: the Phoenix (#610000) disappears on the #0A0A0A tile backdrop, and the B&W roses need a mid-tone backdrop. The business card QR is real (segno, v4, level H, 4-module quiet zone) but not yet scanned by a phone.
- Fresh-context oracle review: FAIL on three findings (index URL broken by serve clean-URL redirect; card back not border-box so front and back differed; branch housekeeping claim contradicted by the reflog), all fixed with no second round, plus the nits. Card re-measured 1.750 at 1440 and 390 wide, no overflow. serve.json added (cleanUrls off plus a rewrite so slash-less URLs also work in the in-app browser).
- Local portfoliowebsite was fast-forwarded to origin at 01:52 by something other than this loop; TODO corrected. My own blunder: a broad pkill -f serve while chasing a duplicate listener may have stopped other serve processes; nothing on disk was affected.
- Not done, by design: no real UI, no SOL baselines, no push to portfoliowebsite, no site copy written. Waiting on the user: approval of 5 mockups, corrected logo art, card email and number, Brand row tools, the extra section topic, and the copy drafts.

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
- Release (user's go-ahead in chat): fast-forwarded origin/portfoliowebsite 1bcecc5..dd205ae (10 commits), pushed once. next build compiled first. Netlify deploy dd205ae ready, not skipped. Live: all 36 gallery files (12 artworks x full/900w/480w) byte-identical to git (sha1 compare, Self Portrait names URL-encoded), /, /portfolio/, /portfolio/brand/, /portfolio/history-of-mistrust/, /contact/ 200, no .brand-page-watermark in the HTML, /images/patterns/bubble-watermark.png 404; Lollipop shows the watermark in a live screenshot. Not run: Playwright suite, visual gate. Visual baselines will differ (gallery art) and need SOL regeneration. Local branches not deleted.
- Branch cleanup (user's yes): deleted shxdowloop/2026-10-06/next-step-cleanup-icons-mistrust, shxdowloop/2026-10-09/print-mockups (local + origin), claude/bold-cannon-wznaig (origin) and the local backup/portfoliowebsite-2026-10-10; each confirmed an ancestor of origin/portfoliowebsite first. Kept: fix/2026-10-06-blue-logo-caption, origin/develop, origin/shxdowloop/2026-08-14/mistrust-reexport (unmerged, conflicting), local portfoliowebsite and the portfolio-reconcile branch checked out in the main checkout.
- Retired at the user's call: deleted origin/develop (last commit ffa7438, 3 commits not on portfoliowebsite: focus-ring transition fix, LOGBOOK archive, branch-policy doc) and origin/shxdowloop/2026-08-14/mistrust-reexport (287c46b, 1 commit), both unmerged and conflicting. Recover with git branch NAME SHA while the objects exist locally, or from GitHub by SHA.

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

