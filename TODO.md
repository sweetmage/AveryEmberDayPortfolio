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

Everything genuinely pending. Nothing here except the contact-form test is blocked by the deploy
pause, **which expired on Aug 7 and is now three days overdue** — the merge below is the single
gating step for the whole repo. One production deploy costs 15 credits of 20/month, so everything
that lands before it ships in the same deploy.

### Ready to build now

- [ ] **Three controls still paint the browser's focus ring, not the house accent.** `.icon-link`
      (footer icons), `#return-to-top`, and `.skip-link`. **Not a WCAG 2.4.7 failure** — a visible ring
      exists — but it is not the 2px `--brand-accent` the contract promises, and
      `.brand-footer-links a` in the *same declaration block* does paint correctly.
      **Do not re-derive what has already been ruled out** (all by measurement, 2026-08-06, Entry 123):
      the rule is present in the built CSS; an injected `!important` rule with the identical selector
      also fails, so it is *not* being outranked; moving the ring into the utilities layer on the
      element changes nothing, so it is not the Entries 121–122 layer trap; and longhands behave the
      same as the `outline:` shorthand. The only pattern is that the working one carries no Tailwind
      classes and the three failures all do.
      **Retest headed first.** All of the above was measured in headless Chrome, and this project's
      convention is that focus and GUI behaviour are only trustworthy in a headed browser. Reproduce
      with real Tab presses, not `el.focus()` — programmatic focus does not reliably engage
      `:focus-visible`.
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
- [ ] **`public/` ships ~6 MB of unreferenced source PNGs.** The 30 `Instagram post - N.png` files
      plus the 3.1 MB cover are copied into the export but never requested; only the derived webps
      are. **Worth doing before the deploy** — it shrinks what gets published.
      **Not a pure delete:** `scripts/generate-mistrust-assets.js:42` works out of *both* trees
      (`TREES = [images/…, public/images/…]`), so the generator must first be changed to read sources
      from `images/` and write derived webps to both. Left alone in Entry 106 to avoid scope creep.
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

> ### ⚠ THIS BRANCH IS STALE. Read this before trusting anything above.
>
> **`portfoliowebsite` is 8 commits AHEAD of `develop`** (checked 2026-08-10). The deploy pause was
> lifted, the release shipped as `17c5bf6`, and its checkpoint was recorded in `6bf9598`. Every line
> in this file describing the pause as pending predates that release and is wrong — this branch
> never received it.
>
> **This file is not the current TODO.** `portfoliowebsite:TODO.md` is. It carries items this copy
> has never heard of (ten orphaned icon files, a WebKit-only white rectangle under the nav) and has
> already closed one this copy still lists above: the ~6 MB of unreferenced `public/` PNGs, done in
> `0522f32`, payload 15.80 → 9.65 MB.
>
> **The LOGBOOK diverged too.** Production runs to **Entry 132**; this branch's uncommitted entries
> were renumbered to **133–135** to stop them colliding. Production's Entries 127–132 do not exist
> here.
>
> Nothing here should be merged, and no new work should start on this branch, until the
> reconciliation below is decided.

- **Reconcile `develop` with `portfoliowebsite`** — the blocking decision, and it is the user's. The
  uncommitted tree splits cleanly in two:
  - **Genuinely new, not on production:** the plan-doc archive sweep (Entry 133), the sticky-rail
    one-column rule and its 18 specs (Entry 134), the dangling `Script.js` 404 fix, and the
    visual-gate font-race fix (Entry 135).
  - **Superseded:** the bubble-flake fix. Production solved the same defect on 2026-08-09 in
    **Entry 131 / `17c5bf6`**, triggering the rescue on lack of progress (`NO_PROGRESS_FRAMES`, 20)
    rather than on elapsed frames. Both investigations instrumented the live engine and reached the
    same root cause independently — 68 consecutive overlap frames there, 67 here, `_relocating`
    FALSE in both — which is strong mutual confirmation. **Production's mechanism is the better
    one:** progress distinguishes a wedge from the healthy 8px/frame glide with no threshold
    guesswork. What is worth salvaging on top of it is the **seed-clear** (`seedPosition` rejecting
    candidates inside a zone, which removes the initiating event instead of recovering from it) and
    the **from-frame-0 regression spec**.
- **Contact form registration.** The old blocker was that the published deploy predated the
  2026-08-01 detection toggle. The release has since shipped, so re-check the Netlify API rather
  than assuming: until a test submission passes, `/contact/thanks/` promises "Your message has been
  sent" without that being true, and the About copy points readers straight at it (Entry 119).
- **Contact form: detection ON, form still unregistered — needs a deploy that builds.** Registration
  happens when Netlify's build-time parser reads deployed HTML; the published deploy (`da4b4be`)
  predates the 2026-08-01 toggle. API confirms `forms: []` and `submissions: []`.
  - **The markup is confirmed correct** in the built export — `name="contact"`,
    `data-netlify="true"`, hidden `form-name`, `bot-field` honeypot, POST to `/contact/thanks/`.
    Nothing to fix in code.
  - **Do not try to shortcut it with a branch deploy.** `allowed_branches` is `["portfoliowebsite"]`
    so `develop` produces no deploy at all, and the credit block is account-level so a branch deploy
    is skipped identically. Both established 2026-08-03 (Entry 115).
  - Until a test submission passes, `/contact/thanks/` promises "Your message has been sent" without
    that being true.
  - **The About copy now points at it, which raises the stakes** (2026-08-05, Entry 119): the closing
    line invites readers to "reach out through my contact page or email below". The email half works
    — the footer prints the address. The contact-page half silently drops messages until this is
    registered, so step 4 of the lift-the-pause checklist is now the difference between a working
    invitation and a lost enquiry, not merely an untested feature.

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

Full detail in `LOGBOOK.md` (newest-first). **`docs/plans/` now holds open plans only** — as of
2026-08-09 every finished plan is consolidated in
[`docs/archives/plans.md`](docs/archives/plans.md#consolidation-stubs-2026-08-09), so a file still
sitting in `docs/plans/` means something is unfinished.

### 2026-08

- **Aug 10** — **The bubble flake is fixed, and the fix had never run.** `scripts/bubbles.js` carried
  the 2026-08-09 fix; `public/scripts/bubbles.js` — the copy the export serves and every spec loads —
  did not. Mirroring it exposed a worse bug: `resolveZoneCollisions` called a `_escape` method that
  was never written, so the engine threw on the first trapped bubble and `window.__bubbleEngine` was
  never assigned. Bubbles were dead on every page. `_escape` written (nearest edge whose exit is not
  another zone); new from-frame-0 spec measures parked *duration*, 67 frames pre-fix → 0 post-fix on
  Contact @1440. Entry 135.
- **Aug 10** — **The sticky rail one-column rule.** Nav unpinned below 768px, tab/filter groups
  pinned from 768px up, `--brand-*-overlay` tokens so every "one screen" calculation subtracts what
  is actually pinned. The `lg:sticky` Projects rail had had **zero travel since Entry 079** and never
  worked; the gate could not see it because it captures at scroll 0. 18 new specs. Entry 134.
- **Aug 10** — Two defects found on the way past: the legacy pages had requested a **deleted
  `Script.js` for a month** (removed 2026-07-09, tags left in all four HTML files), and the visual
  gate's `document.fonts.ready` wait **resolves against an empty font set** while the remote font
  `@import` is still in flight — three consecutive runs failed three different pages, all passing on
  re-run. Both fixed; the font race is Trap 5 in `docs/visual-gate.md`. Entry 135.
- **Aug 9** — **All 23 finished plan docs archived** into `docs/archives/plans.md` as a stub table
  (outcome + LOGBOOK entry + commit per file; full text in git history). `docs/plans/` now holds open
  plans only, so a file sitting there means something is unfinished. Six dangling path references in
  live scripts/specs/docs repointed at the archive; `LOGBOOK.md`'s references left as-is because
  entries are records of their moment. Entry 133.
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

- Everything about the visual gate — coverage, tolerance rationale, the five traps, motion-spec
  rules, the CI item → **[`docs/visual-gate.md`](docs/visual-gate.md)**.
- Deploy/credit model, the pause, and contact-form registration → **[`docs/deploys.md`](docs/deploys.md)**.
- Repo structure, execution model, entry points per task → **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)**.
- The bubble exclusion rename trap → **`AGENTS.md` → File Conventions** (three incidents so far;
  Entries 090, 093).

---

## TickTick Mirror

TickTick "Portfolio Website" list (project id `69c8addc8f0823c509e1979f`) mirrors **Open work**
above. Run `node scripts/sync-all.js --dry-run` after edits.
