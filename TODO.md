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
pause — and there is a reason to land work *before* Aug 7: one production deploy costs 15 credits out
of 20/month, so anything merged before the pause lifts ships in the same deploy.

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

- [ ] **The bubble flake survived Entry 115's fix, and it is now the only thing keeping the suite
      from being reliably green.** `bubbles-exclusion › Contact form @ 1440px`, ~1950px² overlap
      against an expected 0. Measured 2026-08-05 (Entry 118): **2 failures in 4 full runs** with the
      new gallery spec present, **1 in 3** with it excluded, **0 in 1** standalone (10/10). So it is
      not caused by the gallery work, and the sample is too small to say that work worsens it.
      **Start from the recorded hypothesis, not from scratch:** the overlap is a *whole* bubble, not a
      graze, which fits the relocation path Entry 115 named as the next suspect — the deadlock rescue
      teleports a trapped bubble and holds `_relocating` for ~560ms while it fades back in, and
      `resolveZoneCollisions` skips it that whole time. If the destination is inside a zone, the bubble
      fades to full opacity *inside the form*, past the `opacity <= 0.05` skip and deliberately not
      being pushed out.
      **Do not raise a tolerance** — twice now the cause was elsewhere (Entries 090, 115), and Entry
      115 produced two wrong fixes by theorising instead of reading `bubbles.js`. Remember the engine
      is duplicated: `scripts/bubbles.js` and `public/scripts/bubbles.js`.
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

### Waiting validation

- [~] **Fresh-context review of the set-strip seam dedupe (Entry 114).** The only genuine open
      checkbox anywhere in `docs/plans/`. Its own merge-readiness checklist flagged that a
      fresh-context review was still recommended, and the work has since been **merged without one**
      (`ada0210`). Both the original run and the merge were main-agent-only, so no context other than
      the author's has ever read that diff — and the change is image-forensics work whose conclusion
      turned on distinctions like `d=0.00` vs `d≈4` and 99.7% vs byte-exact.
      **What to review:** `scripts/generate-mistrust-assets.js` (the offset-derivation and the
      width/height guards) and `tests/mistrust-sets.spec.js`. `[~]` is "waiting validation", not
      done — it flips to `[x]` on a passing review and reopens on a failing one.
      Not doable in the session that merged it; needs a genuinely separate context.

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

- **[Aug 7] Lift the deploy pause.** Merge `develop` → `portfoliowebsite` and push **once** (one
  production deploy = 15 credits, not one per commit). Then test the contact form immediately, and
  revert the pause banners in `AGENTS.md` / `docs/NOTES.md`. Full checklist:
  [`docs/deploys.md`](docs/deploys.md#lifting-the-pause-on-2026-08-07); LOGBOOK Entry 105.
  - **Aug 7, not Aug 6.** The credit cycle ends `2026-08-07T00:00:00-07:00`, confirmed against the
    Netlify API. Every doc and the `pre-push` guard said Aug 6 until 2026-08-03 — the guard would
    have expired a full day before credits reset (Entry 115).
  - **The guard was also found inert and is now permanently fixed** (Entries 115–116).
    `core.hooksPath` pointed at `.githooks`, which existed only on the architecture-map branch, so
    `develop` ran with no hooks at all — no deploy guard, no Git LFS. That branch is merged and the
    config points back at the tracked directory. A fresh clone still needs
    `git config core.hooksPath .githooks` once.
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

Full detail in `LOGBOOK.md` (newest-first). Plan docs live in `docs/plans/`; earlier ones are
consolidated in [`docs/archives/plans.md`](docs/archives/plans.md).

### 2026-08

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

- Everything about the visual gate — coverage, tolerance rationale, the four traps, motion-spec
  rules, the CI item → **[`docs/visual-gate.md`](docs/visual-gate.md)**.
- Deploy/credit model, the pause, and contact-form registration → **[`docs/deploys.md`](docs/deploys.md)**.
- Repo structure, execution model, entry points per task → **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)**.
- The bubble exclusion rename trap → **`AGENTS.md` → File Conventions** (three incidents so far;
  Entries 090, 093).

---

## TickTick Mirror

TickTick "Portfolio Website" list (project id `69c8addc8f0823c509e1979f`) mirrors **Open work**
above. Run `node scripts/sync-all.js --dry-run` after edits.
