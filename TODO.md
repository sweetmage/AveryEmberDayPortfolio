# TODO

> **This file is the complete surface for open work.** Re-verified 2026-08-03 by grep, not by
> assertion — the previous "zero open checkboxes" claim was **wrong**, and the one it missed is now
> carried below under *Waiting validation*. Plan docs record *how* something was built; they are not
> a second to-do list. Anything this returns belongs here too:
>
> ```bash
> grep -rn "^\s*- \[ \]" docs/plans/
> ```
>
> Plan status at a glance: [`docs/plans/README.md`](docs/plans/README.md).
> `[ ]` pending · `[~]` waiting validation · `[x]` done.

---

## Open work

Everything genuinely pending. **The deploy pause is over** (lifted 2026-08-07; this paragraph still
described it as upcoming until 2026-08-09), so nothing below is blocked on it. The standing reason to
batch work still holds: one production deploy costs 15 credits out of 20/month, so everything merged
before a push ships in the same deploy.

### Ready to build now

- [ ] **Two prose measure caps survived the 2026-07-31 "no measure caps" direction.**
      `max-w-[560px]` on the Contact intro and `max-w-[480px]` on the thanks-page paragraph. The About
      box, Contact form and `.project-desc` caps were all removed then; these two were missed. Removing
      them makes both lines span the full 1400px container, which on a two-sentence paragraph is a real
      visual change — hence a user call rather than a silent fix.

- [ ] **Gallery filter entrance stagger (Track B leftover, deliberate).** The concept's §4 asks for
      entering cards to fade up from `0.96` staggered ~25ms by grid position. The *movement* tween
      shipped in Entry 118 and is the part that section calls the one that makes filtering feel
      designed; the stagger did not, for a real reason: inside a view transition CSS cannot tell an
      entering element from a persisting one, so a blanket `::view-transition-new(*)` rule makes every
      *surviving* card pulse on every filter change — contradicting the same section's "staying: tween
      to their new grid positions". Doing it properly means giving entering and leaving cards separate
      `view-transition-name` values through refs before the snapshot is taken. Scoped, not blocked.
- [ ] **Standalone "A History of Mistrust" viewer page** with all canonical slide content and a
      numbered bibliography. Slides and a Sources section currently live inside the Projects tab.
- [ ] **Ten orphaned icon files still ship, 40 KB total.** Found by the same audit that cleared the
      6 MB of Mistrust sources (Entry 129), left alone because the payload argument is weak at this
      size and they sit beside assets the site does use. Six are wrong-format twins of live files:
      `bubbleLogo-black.png` / `bubbleLogo-white.png` (the `.svg` versions are what
      `BrandProject.tsx` renders) and `bubbleLogo-black-notxt.svg` / `bubbleLogo-blue-notxt.svg`
      (the `.png` versions are the referenced ones). The rest are `bubbleLogo.svg`,
      `bubbleLogo_transparent.svg`, and `githubicon.svg` / `linkedinicon.svg` / `emailicon.svg`,
      which lost their consumer when the footer moved to inline SVG.
      **Decide the intent, not just the delete:** if the twins are meant to be a downloadable brand
      kit, they should be linked from the Brand project page rather than sitting unreferenced; if
      not, they go. Verify with `grep -rn` across `app/`, `index.html` and `projects/*.html` before
      removing — the audit's first pass had a regex bug that hid every path containing a space.
- [ ] **A stray white rectangle paints under the nav in WebKit only** (~79 × 17 CSS px, left edge,
      directly below the spectrum bar, home page). Found 2026-08-09 while fixing the theme toggle
      (Entry 127); pre-existing and unrelated to it, so it was flagged rather than folded in.
      **Do not re-derive what is already ruled out:** `elementsFromPoint` reports nothing painting
      there, and it survives disabling the spectrum bar's `filter`, the bar entirely,
      `.brand-page-bg`, `.brand-page-noise`, `.skip-link`, `.brand-hero-blob`, and
      `position: sticky` on the nav (that last one does change it). Reads as a WebKit
      compositing/tiling artifact around the sticky nav.
      **First step is confirmation on real hardware** — the only evidence is headless Playwright
      WebKit on Windows, which may not represent iOS Safari at all. If it does not reproduce on the
      user's iPhone or iPad, close this.
- [ ] **Watermark artwork.** User's own task.


### Blocked on a prerequisite

- [ ] **Run the visual gate in CI.** Not blocked on a decision — that was made 2026-07-23
      (containerize capture so one Linux snapshot set is canonical). **Blocked on Docker, which is
      not installed on this machine** (recorded 2026-08-03). Requires a one-time regeneration of all
      40 baselines inside `mcr.microsoft.com/playwright`, which should not be interleaved with other
      visual work. Full sequence and rationale:
      [`docs/visual-gate.md`](docs/visual-gate.md#open-item--running-the-gate-in-ci).

### Waiting on the user's draft

- [ ] **Copy pass — remainder of Tracks A and C.** **The About box** (Entry 119, user's draft
      published verbatim) **and the Contact intro** (Entry 120, rewritten to stop duplicating the
      About's closing invitation) **are done**; 16 baselines regenerated and reviewed between them.
      Still waiting on the user's draft for: **11 gallery descriptions** and **both project
      summaries**. **The user writes the first draft; the agent proofreads only.**
      `GalleryItem.description` is `''` on all 11 items and the render path now exists (Entry 118), so
      the gallery side is pure data. Still outstanding from the plan: `alt` becomes a real image
      description (the captions already became `<h3>` titles in Entry 118). Plan:
      [`docs/plans/2026-08-01-copy-pass-and-gallery-descriptions.md`](docs/plans/2026-08-01-copy-pass-and-gallery-descriptions.md).
      Track D (re-baseline) is strictly last — re-baselining before the copy is final wastes the
      review pass.

---

## Awaiting a user step

_Nothing awaiting a user step. The deploy pause was lifted and the contact form verified on 2026-08-08 — see Done, below._

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

## Done

Full detail in `LOGBOOK.md` (newest-first). Plan docs live in `docs/plans/`; earlier ones are
consolidated in [`docs/archives/plans.md`](docs/archives/plans.md).

### 2026-08

- **Aug 25** — **The three "broken" focus rings were never broken.** `.icon-link`, `#return-to-top`
  and `.skip-link` all paint the 2px `--brand-accent` ring, in both themes, under real Tab presses in
  a headed browser. Entry 123's finding was a **measurement artifact**: Tailwind v4's
  `transition-colors` includes `outline-color`, so `getComputedStyle().outlineColor` read at focus
  time returns the transition's *start* value — the initial `currentColor`, which is the footer's
  grey and the skip link's white. That is also why every fix attempted against it failed: the
  declaration was applying the whole time. The three components now enumerate their transition
  properties, so the ring is correct at the instant focus lands rather than 150ms later. Entry 134.
- **Aug 10** — **RELEASED `73b5fa4`.** The one-column rule plus the reconciliation, published in a
  single production deploy (15 credits). Checkpoint:
  `docs/checkpoints/2026-08-10-sticky-rail-release.md`. Entry 133.
- **Aug 10** — **The sticky rail, and the one-column rule for the nav.** If the user can see more
  than one column the nav and the current selection both stay on screen; below 768px nothing is
  pinned and the page scrolls as one piece. Found on the way in: the `lg:sticky` Projects rail had
  **zero travel since Entry 079** and had never worked — a sticky child of a wrapper exactly its own
  height cannot move, and the visual gate captures at scroll 0 where that is invisible. Adds the
  `--brand-*-overlay` tokens, replaces the hardcoded `top-16`, and introduces the
  `scroll-padding-top` the site never had. 18 new specs. Entry 133.
- **Aug 10** — **`develop` was 8 commits stale and is now reconciled.** Its uncommitted tree was
  replayed onto the released branch: the sticky rail, the plan-doc archive sweep, a visual-gate
  font-race fix and the bubble seed-clear were carried across; its bubble wedge fix and `Script.js`
  removal were **dropped as already done better on production** (Entries 131, 128). The two wedge
  investigations were independent and agreed — 67 consecutive overlap frames vs 68 — so that root
  cause is settled. Snapshot of the old tree preserved as `ded51f5`. Entry 133.
- **Aug 10** — **Visual gate: a late layout shift the existing waits could not see (Trap 6).** The
  sticky rail publishes its height from JS after first paint, and `--stage-cap` / `--art-cap` are
  computed from it, so the Mistrust stage resized after images and fonts had settled — surfacing as
  "failed to take two consecutive stable screenshots", 125,968 px, passing on re-run. The gate now
  waits for the document height to hold steady across three frames. Entry 133.
- **Aug 10** — **Visual gate flake fixed (Trap 5).** `document.fonts.ready` resolves against an
  *empty* font set while the remote Google Fonts `@import` is still in flight, so captures could
  render in the fallback. Three runs failed three different pages, all passing on re-run. The gate
  now waits for the faces to exist and report loaded. `docs/visual-gate.md`. Entry 133.
- **Aug 10** — **23 finished plan docs archived** into `docs/archives/plans.md` as stubs; six
  dangling path references repointed. `docs/plans/` now holds open plans only, so a file sitting
  there means something is unfinished. Entry 133.

- **Aug 9** — **RELEASED `17c5bf6`.** Five commits pushed in one production deploy (15 credits),
  `state: ready` and not skipped. Live checks on averyemberday.com: all 5 pages 200, the deployed
  `/scripts/bubbles.js` carries the fix, a deleted source PNG 404s while `slide-01.webp` still
  serves. Checkpoint:
  [`docs/checkpoints/2026-08-09-bubble-wedge-fix-release.md`](docs/checkpoints/2026-08-09-bubble-wedge-fix-release.md).
  Entry 132.
- **Aug 9** — **The `bubbles-exclusion` flake is fixed — the suite is genuinely reliable now.** Cause
  was never the relocation path this file had recorded as the hypothesis: frame-by-frame
  instrumentation caught 68 consecutive overlap frames with `_relocating` **false** at opacity **1**.
  Exclusion zones overlap each other (the Contact intro's zone ends at `y 303`, the form's padded zone
  starts at `y 295`), and a bubble in that band has no legal position, so it oscillates on the form's
  edge until the deadlock rescue's **90-frame** timer fires — 1.5s of visible coverage. The rescue now
  keys on lack of progress (20 frames) instead of elapsed time, which a real escape glide can never
  trigger, and `_relocate` teleports before fading in rather than fading out at the illegal position.
  Probe: 68 overlap frames → **0 in 3600**, on the exact failing case. Entry 131.
- **Aug 9** — **The Aug 9 work is committed** (`a2e4300`, `0522f32`, plus the docs commit) — Entries
  127–129 had all been left in the working tree with HEAD still on Aug 8. Reviewed against the tree
  rather than the entries; suite green twice at 151/151; the WebKit gate proven by injected
  regression (20 of 21 fail on the old CSS). **Also caught: 131 files under `images/` were staged
  for removal from git by an untraceable `git rm -r --cached`**, which would have dropped every
  Figma source and gallery original out of version control. Unstaged, nothing on disk touched.
  **Not pushed** — that is a 15-credit production deploy. Entry 130.
- **Aug 9** — **Published payload cut 39%: 15.80 MB → 9.65 MB**, 33 files. The 30 Figma slide PNGs,
  the 3 MB cover, an unused moodboard export and `slides.md` were deleted from `public/` (they stay
  in `images/`, still tracked). The blocker `TODO.md` recorded — "the generator must first be
  changed to read sources from `images/`" — did not exist: it already reads only from `images/`,
  and `TREES` is an output list. Verified by a clean generator run, 151/151 tests, and a 404 sweep
  over all five routes. Entry 129.
- **Aug 9** — **Suite is green again: 151 passed, 0 failed.** `smoke-interaction.spec.js` and the
  repo-root `webServer` on :4321 that existed only to feed it were deleted, and the four dead
  `<script src="Script.js">` tags were stripped from the legacy static pages. Those pages have not
  been published since the Next.js migration, so the test was guarding a page that does not ship
  while the file it loaded had been gone since Aug 3. `docs/ARCHITECTURE.md`'s "nothing imported
  them" line corrected, since that is what kept the red test unexamined for six days. Entry 128.
- **Aug 9** — **Theme toggle off screen on iPhone/iPad — actually fixed.** Cause was never the
  contact-form zoom Entry 126 blamed: `#theme-toggle` sized itself via `aspect-ratio: 1` against a
  percentage height, and WebKit leaves that out of a flex item's intrinsic contribution, so
  `.brand-nav-actions` measured 0px and `margin-left: auto` pushed the button past the right edge.
  Explicit `width: var(--brand-nav-height)` instead. Chromium never reproduced it, so the suite
  gained a `webkit-mobile` project and `tests/nav-safari.spec.js` (21 assertions; 20 fail on the
  old CSS). Entry 127.
- **Aug 8** — **Checkpoint saved:** `docs/checkpoints/2026-08-08-post-interview-release.md`
  (`bc3e278`). Notification email for the test submission confirmed received, closing the last
  unverified link in the contact chain: submit → thanks page → recorded submission → email.
- **Aug 8** — **RELEASED.** `develop` → `portfoliowebsite` merged fast-forward and pushed once:
  48 commits, deploy `bc3e278`, `state: ready` and NOT skipped, 15 credits. Live checks on
  averyemberday.com: all 5 pages 200, no page errors, Mistrust leads Projects, the slideshow block
  is 823px against an 824px budget, the artwork is a padding-free bubble frame zone and the card is
  not a zone, expand works.
- **Aug 8** — **Contact form is REGISTERED and PROVEN.** Netlify lists form `contact`
  (`6a76439ee6fac40008881b68`) with 1 real submission (2026-08-07 22:25Z). It registered from a
  free BRANCH deploy, not a production one — `docs/deploys.md` had said that was impossible, which
  was true only while credits were exhausted (an account-level block). `/contact/thanks/` is now
  telling the truth. Notification email delivery is the user's to confirm.
- **Aug 8** — Pre-launch work: gallery expand keeps its row and moves orthogonally, artwork tweens
  as its own element with no shrink-then-grow, one-screen caps on gallery art and the Mistrust
  viewer, iOS zoom fix on the contact form (logged then as the cause of the off-screen theme toggle
  — **it was not**, see Aug 9), bubbles bounce off the picture at every width, Mistrust first on
  Projects. Suite 131/131, twice.
- **Aug 8** — Branch deploys for `develop` were enabled to get a testable pre-launch URL, then
  reverted after release: `allowed_branches` is `["portfoliowebsite"]` again.
- **Aug 6** — **Seam-dedupe validation PASSED**, clearing the last `[~]` before release. A fresh
  context (which is the entire point — the merge was main-agent-only) reviewed the offset derivation
  and the set-strip tests: no off-by-one, guards throw rather than no-op, the ±96px search window is
  generic rather than special-casing slides 1–2, and the tests compare the composed webp against the
  independent Figma export rather than against themselves. Key claim spot-checked directly at
  `tests/mistrust-sets.spec.js:43-65`. Entry 125.
- **Aug 6** — Expanded gallery cards no longer reserve empty space: `h-full` removed (it was silently
  outranking `align-self: start`), then row sizing switched to content-sized tracks with
  `align-items: start` while a card is open, at the user's choice. Card 1284px → 923px, no reserved
  track, companion tile unstretched. 90 green twice, zero baselines moved. Entries 121–122.
- **Aug 5** — Gallery cards expand in place (Track B): two columns *and two row tracks* at `md+`, art
  capped at one screen under the sticky nav, grid reflowed through the View Transitions API. The row
  span is what stops `auto-rows: 1fr` dragging every row in the gallery to the expanded height. New
  15-case motion-enabled spec; all 40 visual baselines unchanged by design. Entry 118.
- **Aug 3** — Audit found two load-bearing safety mechanisms documented as working while silently
  doing nothing: the deploy-pause push guard was inert, and the bubble spec was flaking ~1 in 3 runs.
  The flake's real cause was `_relocating` bubbles being measured while fading inside a zone — *not*
  worker contention, which produced two wrong fixes first. Architecture-map branch merged, landing
  `docs/ARCHITECTURE.md` and the tracked `.githooks/`. 18 scratch files untracked. Pause date
  corrected Aug 6 → Aug 7 repo-wide. `docs/visual-gate.md` written. Entries 115–116.
- **Aug 1** — Mistrust set-strip seam dedupe: the shipped `set-1.webp` had a duplicated 19px seam
  because slides 1 and 2 share a band of artwork. Strips now take pixels from slides and geometry
  from the Figma export, guarded by `tests/mistrust-sets.spec.js` (Entry 114). Figma re-export
  swapped into both asset trees (Entry 113). Square images in rounded frames; one purple hover for
  every non-nav action button (Entries 110–111). Netlify form state diagnosed and the notification
  hook created (Entry 112).

### 2026-07

- **Jul 31** — Mistrust slideshow redesigned into one swipeable stage with a Set 1/2/3 switcher,
  React lightbox and seamless set mosaics (Entry 109, merged `152cf2f`). Landed Entries 106–107,
  which had been finished but left **entirely uncommitted** for three days while both claimed
  "committed here" (Entry 108).
- **Jul 28** — Contact polish and one content width site-wide: `--brand-content-max` at 1400px as the
  single source of truth, collapsing three divergent left edges into one. Backed by
  `scripts/measure-content-widths.js`, which the visual suite structurally cannot replace (Entry 107).
- **Jul 27** — Contact unhidden with 360px nav fit solved on lower clamp bounds only; Mistrust assets
  resynced; twelve slides of misordered `SLIDE_ALT` corrected against the artwork; og card
  regenerated from the live hero (Entry 106).
- **Jul 24–26** — Gallery reframed to 1400px/3-column with a shared `PageHeader`; Projects and
  Gallery unified on one content container; gallery tag filter restructured into a vertical rail;
  visual gate hardened and proven with an injected 2px change going red on all 40 snapshots; the
  repo's first motion-enabled bubble tests; CSS duplicates deleted; Patriots page removed
  (Entries 086–101).
- **Jul 22–23** — Visual-baseline spec converted from capture-only to a real compare-based gate;
  nav buttons restyled into a segmented group (Entries 081–087, merged `098f0b1`).
- **Jul 12–15** — Next.js 15 static export migration, all 5 pages; Netlify production branch
  repointed to `portfoliowebsite`; srcset variants; sticky vertical Projects rail (Entries 066–080).
- **Jul 1–9** — Architecture remediation Stages 0–5; Tailwind v4 pipeline restored; utility
  conversion across all pages; EPERM `uv_spawn` resolved externally (playbook in `AGENTS.md`).

### Closed without doing

- **Final polish on the continuous horizontal carousel** — **closed 2026-08-03 as superseded.**
  Entry 109 replaced the continuous horizontal carousel with the swipeable stage, so there is no
  carousel left to polish. The stage, its filmstrip, side-bar nav and lightbox were user-reviewed at
  the merge of `152cf2f`.
- **Re-export Mistrust Set 1/2/3, or drop the set PNGs** — resolved by doing (Entry 114), though the
  investigation inverted the item's premise: the set PNGs were never the broken artefact, the
  composed `set-1.webp` was.
- **Untrack the stale scratch directories** — done 2026-08-03 (Entry 116), 18 files, all still on
  disk.

### Lessons that outlived their items

Durable versions now live where they get read:

- Everything about the visual gate — coverage, tolerance rationale, the six traps, motion-spec
  rules, the CI item → **[`docs/visual-gate.md`](docs/visual-gate.md)**.
- Deploy/credit model, the pause, and contact-form registration → **[`docs/deploys.md`](docs/deploys.md)**.
- Repo structure, execution model, entry points per task → **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)**.
- The bubble exclusion rename trap → **`AGENTS.md` → File Conventions** (three incidents so far;
  Entries 090, 093).

---

## TickTick Mirror

TickTick "Portfolio Website" list (project id `69c8addc8f0823c509e1979f`) mirrors **Open work**
above. Run `node scripts/sync-all.js --dry-run` after edits.
