## Archived Logbooks

| File | Entries | Date Range |
|------|---------|------------|
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

## Entry 135 — 2026-08-25

**Agent:** Opus 5 (wren, main)
**Cycle:** shxdowflow — branch inventory, prune, and the two-branch policy
**Branch:** `develop` (committed), merged fast-forward into `portfoliowebsite` (**not pushed**)
**Task:** "What is open to do with existing branches" → prune, then restate the branch rules around
`develop` and `portfoliowebsite` instead of `master`.

### Eleven branches, one with unmerged work

`git branch -a --no-merged develop` returned exactly one name:
**`shxdowloop/2026-08-14/mistrust-reexport`** (`287c46b`, 7 files). It was **local-only and had never
been pushed**, so a disk failure would have taken it, and neither `LOGBOOK.md` nor `TODO.md`
mentioned it existed. Pushed to origin and recorded in TODO under *Awaiting a user step*.

Its Stage 0 is real, finished work: set-strip layout now comes from a committed
`images/A History of Mistrust/frame-geometry.json` rather than template-matching the raster
`sets/*.png` exports, so a pure artwork revision can no longer fail geometry. Stages 1.1–1.4 need a
Figma export only the user can produce — the manifest currently holds bootstrap-derived offsets, not
true canvas coordinates.

**Eight merged branches deleted** with `git branch -d` (the merged-only form, which refuses to orphan
a commit — all eight went through silently, which is the proof nothing was lost):
`claude/loving-knuth-1651f9`, `feat/history-of-mistrust-case-study`, `resume`, `master`, `slides`,
`shxdowloop/2026-07-31/architecture-map`, `shxdowloop/2026-08-01/mistrust-set-seam-dedupe`,
`reconcile/2026-08-10`. Local list is now three: `develop`, `portfoliowebsite`, and the reexport
branch. Three remote refs left standing at the user's discretion
(`origin/feat/history-of-mistrust-case-study`, `origin/master`, `origin/shxdowloop/2026-07-31/architecture-map`).

### The branch policy said to commit to the deploy branch

`AGENTS.md` and `docs/NOTES.md` both opened with "**all changes must be committed to the
`portfoliowebsite` branch**" while simultaneously warning that pushing that branch publishes to
production. That is a rule pointing at the one branch you cannot work on freely.

**Recent practice was inconsistent rather than uniformly diverged** — checked against the `Branch:`
line of each entry rather than assumed: Entries 130, 131 and 132 committed directly to
`portfoliowebsite`, Entry 133 worked on `reconcile/2026-08-10`, Entry 134 on `develop`. Three
different answers in five entries is the actual argument for writing one down.

Rewritten at the user's direction into the model actually in use: **commit to `develop`; release by
merging into `portfoliowebsite` and pushing once, with go-ahead in the moment.** `develop` is now
documented as permanently open, which is what makes a batched release possible at 15 credits per
push. Landed in `AGENTS.md` → Branch Policy (canonical), `docs/NOTES.md` (summary, now pointing at
the canonical copy rather than duplicating it), and `docs/deploys.md` → Current workflow + the
deploy-loop diagram.

**`master` is now documented as dead**, not "retained as historical". Checked rather than assumed:
GitHub's default branch is `portfoliowebsite`, there are no open PRs against `master`, Netlify was
repointed off it 2026-07-12, and the only live references to the word were two rules saying not to
commit to it. It is 93 commits behind `develop`.

### develop stays local-only, deliberately

`allowed_branches` is `["portfoliowebsite"]`, verified against the Netlify API this session — so
pushing `develop` produces **no deploy at all, not a free one**. Offered the user a standing free
branch deploy (`develop--averyemberdayportfolio.netlify.app`, 0 credits) and **they chose to keep it
local-only**, previewing with `npm run dev`, because that URL is publicly reachable by anyone holding
it. Documented as a deliberate choice with the enable-it recipe attached, so the next agent does not
read it as an oversight and "fix" it.

### Not pushed

`portfoliowebsite` was fast-forwarded onto `develop` locally and **left unpushed at the user's
choice**. The pending payload is the Entry 134 focus-ring fix plus this documentation — too thin to
spend 15 of 20 monthly credits on. It waits for a batch.

---

## Entry 134 — 2026-08-25

**Agent:** Opus 5 (kestrel, main)
**Cycle:** shxdowflow — the three focus rings that were never broken
**Branch:** `develop` (committed; nothing pushed)
**Task:** TODO's top open item — `.icon-link`, `#return-to-top` and `.skip-link` "still paint the browser's focus ring, not the house accent."

### There was no defect

All three paint the 2px `--brand-accent` ring, and always did. Measured headed, with real `Tab`
presses, in both themes — `rgb(204, 68, 255)` in dark and `rgb(139, 34, 224)` in light, which are
exactly `--brand-accent` per theme, with `:focus-visible` matching and `outline: 2px solid` on every
one.

### What Entry 123 actually measured

**Tailwind v4's `transition-colors` includes `outline-color` in its property list.** Read off the
live computed style, not from docs:

```
color, background-color, border-color, outline-color, text-decoration-color,
fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to   (0.15s)
```

So `getComputedStyle().outlineColor`, sampled at the moment focus lands, returns the transition's
**start** value — the initial `currentColor`. In the footer that is `--brand-text-muted`
(`rgb(162, 162, 154)` dark, `rgb(106, 104, 96)` light); on the skip link, which carried
`transition-all`, it is white. Both read as "the browser's default ring" to an audit that samples
immediately.

Caught with a `focusin` recorder that logged every control in tab order: the three suspects reported
`2px solid rgb(162, 162, 154)` at focus time and `rgb(204, 68, 255)` 800ms later. The skip link was
caught mid-fade twice, at `rgb(226, 149, 255)` and `rgb(251, 239, 255)` — intermediate values on the
ramp between white and the accent, which is only possible if the accent was the target all along.

`.brand-footer-links a` "worked" for exactly one reason: its brand.css rule names
`transition: color`, so its outline never transitioned and sampled correctly.

**This explains every ruled-out hypothesis in Entry 123 at once.** The rule was present, the
`!important` probe changed nothing, the layer move changed nothing, and longhands behaved like the
shorthand — because the declaration was applying correctly the entire time. Three sessions of
cascade debugging were spent on a stopwatch problem.

**The lesson is about the instrument, not the cascade.** Any `getComputedStyle` read of a property
that something transitions is a race with that transition. Sample after it settles, or assert on
`transition-property` instead.

### The change

Not a fix for the ring, which needed none — a fix for the trap. The three components enumerate their
transition properties instead of using the blanket utilities, so `outline-color` no longer animates
and the ring is correct at the instant focus lands rather than 150ms later:

- `SkipLink.tsx` — `transition-all` → `transition-[top]`. `top` is the only property that changes
  (`-top-10` → `focus:top-0`); the slide still runs.
- `ConnectLinks.tsx` ×3, `ReturnToTop.tsx` — `transition-colors` →
  `transition-[color,background-color,border-color]`. Those are exactly the three properties their
  hover states change; the dropped members of the old list (`outline-color`, `text-decoration-color`,
  `fill`, `stroke`, gradient stops) are not animated by anything on these elements.
- `brand.css` — the comment block on the shared `:focus-visible` rule carried Entry 123's wrong
  diagnosis ("resolved their ring to `currentColor`… setting `outline-color` directly removes the
  substitution step"). Replaced with the real mechanism and a "do not measure it this way" warning.

### Coverage, proven red first

New `tests/focus-ring.spec.js`, 8 tests. It reads the ring **at focus time with no settle delay**, so
it fails the way the bug was reported, and asserts separately that no control in the group transitions
`outline-color` or uses `all`. Tab-walks with real key presses rather than `el.focus()`, which does
not reliably engage `:focus-visible`.

**Proven to fail**, per the repo's standing rule that a new gate is not trusted until it has been seen
red: reverting `ConnectLinks.tsx` to `transition-colors` turned it red at 2 failed / 6 passed, with
`Expected "rgb(139, 34, 224)"` / `Received "rgb(106, 104, 96)"` — the light-theme accent against
`--brand-text-muted`. That received value *is* the originally reported bug, reproduced on demand.

### Verification

- Full suite **179 passed, exit 0, twice consecutively** on the committed tree.
- `npx tsc --noEmit` clean.
- Headed Chrome (not headless — this project's convention for focus and GUI behaviour), both themes,
  real `Tab` presses. Slide-in and hover fades re-checked after the change: `.skip-link` →
  `transition-property: top`, `.icon-link` → `color, background-color, border-color`.
- `npm run css:build` — `style.css` moved by exactly the two new arbitrary transition utilities, and
  was byte-identical across the later comment-only edit. Diffed, not assumed.
- `shxdowmap refresh --auto` — `tests` 12 → 13, baseline re-recorded.

### One intermittent failure, traced and cleared

An intermediate run went 178 passed / **1 failed**: `visual-baseline › projects-mistrust @ 768px —
dark`, a stable 375,579-pixel diff. It did **not** come from this change, and the diff PNG is what
settles it rather than the re-run: **the red is confined to Mistrust slide artwork in the filmstrip
and mosaic, and the footer — the only region on that page containing anything this diff touches —
shows zero difference.** A focus-ring regression cannot repaint slide cells and leave the footer
untouched.

Supporting, in the order it actually carries weight: the run immediately before it was green with the
same component code; the test passes in isolation; and two later full runs are green. LOGBOOK line
487 records the same test family (`projects @ 768px — dark`) as a known full-parallel flake with the
same isolation behaviour.

**Held the commit until this was settled rather than filing it as flake on the first green re-run** —
line 76 of this file records a case where exactly that instinct was wrong and the "flake" was a real
late-layout defect.

### Notes

- **Not chased, deliberately:** the contact inputs (`app/contact/page.tsx:82,95,108`) use
  `outline-none` with `focus:border-accent`, so their focus indicator is a border recolour rather than
  the house ring. Pre-existing, visible, and outside this item's scope — but it is the one remaining
  control group that does not follow the ring contract, and worth a decision rather than a silent
  exception.
- `tsconfig.tsbuildinfo` moves in this commit. It is a tracked build cache that churns on every
  `tsc`; prior commits carry the same noise.

### Route

Main agent throughout for the investigation, the fix, the flake adjudication and the final diff
review. One pro nano-agent (opencode/qwen3.7-plus) for the shippability review — returned no
regressions; its one substantive claim, that the contact inputs' `outline-none` needs no fix, was
verified against the source rather than taken on trust.

---

## Entry 133 — 2026-08-10

**Agent:** Opus 5 (sable, main)
**Cycle:** shxdowflow — reconcile the stale `develop` tree onto the released branch
**Branch:** `reconcile/2026-08-10`, cut from `portfoliowebsite` @ `6bf9598`
**Task:** "whats next" → finish the bench work, then, at the user's instruction, replay it onto production and release

**Released** as `73b5fa4` at the user's explicit instruction ("merge and publish it looks good"), after
reviewing the diff and the change headed in Chrome. Checkpoint:
[`docs/checkpoints/2026-08-10-sticky-rail-release.md`](docs/checkpoints/2026-08-10-sticky-rail-release.md).
The checkpoint was written *before* the push so this release costs **one** production deploy rather
than the two the 2026-08-09 release spent on a follow-up docs commit.

### The finding that reframed the session

`develop` was **8 commits behind `portfoliowebsite`.** The release had already shipped (`17c5bf6`,
checkpointed in `6bf9598`) and production's LOGBOOK had run on to Entry 132, while `develop` still
carried a deploy-pause banner and a TODO describing the pause as pending.

The preflight that missed it compared `develop` against `origin/develop` — which was perfectly in
sync, and told me nothing. **On this repo "am I current?" means comparing against the production
branch**, because that is where releases land and where work continues afterwards. A stale-branch
banner now sits at the top of `develop`'s TODO so the next reader hits it immediately, and the
uncommitted tree there is preserved as `ded51f5` rather than rebased away.

### Two of the four tracks were already done on production, better

- **The bubble wedge flake.** Fixed on 2026-08-09 as Entry 131. Worth recording that the two
  investigations were independent and *agreed*: production measured **68** consecutive overlap
  frames at opacity 1 with `_relocating` FALSE on Contact @1440; the `develop` session measured
  **67** under the same conditions. Both falsified the relocation hypothesis `TODO.md` had carried
  for weeks. Production's mechanism is the better one and is what survives here — rescue on lack of
  progress (`NO_PROGRESS_FRAMES`) rather than on elapsed frames, which separates a real wedge from
  the deliberate 8px/frame escape glide with no threshold guesswork. The `develop` version, which
  attacked the same deadlock from the escape side, was **dropped**.
- **The dangling `Script.js` 404.** Also already fixed on production, and more thoroughly: the tag
  was removed from all four legacy pages *and* `tests/smoke-interaction.spec.js` plus the `:4321`
  `webServer` block were deleted with it, on the correct reasoning that those pages are unmaintained
  history and are not deployed. (My earlier "production still has it" reading was wrong — the grep
  hit production's explanatory comment, not a live tag.)

### What was carried across

- **The sticky-rail one-column rule** (plan doc included). Not on production at all. The
  `lg:sticky` Projects rail had **zero travel since Entry 079** and had never worked: a sticky child
  of a wrapper exactly its own height cannot move, and the visual gate is blind to it because it
  captures `fullPage` at scroll 0 where both look identical. Sticky now lives on the column;
  `lg:items-start` on the flex parent is load-bearing in the counter-intuitive direction, keeping
  the column short so travel exists. Adds `--brand-nav-overlay` / `--brand-rail-overlay` /
  `--brand-top-overlay`, replaces the hardcoded `top-16`, and introduces the `scroll-padding-top`
  the site never had. 18 new `sticky-chrome.spec.js` cases.
- **The plan-doc archive sweep** — 23 finished plans into `docs/archives/plans.md` as stubs, six
  dangling path references repointed. `docs/plans/` now holds open plans only.
- **The visual-gate font race** (Trap 5). `document.fonts.ready` **resolves against an empty font
  set**: the faces arrive via a remote `@import`, so before that stylesheet lands there are no
  `@font-face` rules and "all zero fonts loaded" is trivially true. Three consecutive runs failed
  three *different* pages, every one passing on re-run — different-page-each-time is the signature.
- **The seed-clear**, lifted onto production's engine. It is complementary rather than an
  alternative: 2–3 of the 7 global bubbles were being *born* inside a zone on every load, so the
  rescue was catching wedges the engine manufactured for itself at t=0. The rescue is untouched and
  still the safety net for wedges from scrolling and resizing, which no seeding can prevent.
- **The from-frame-0 parking spec**, rethresholded against this engine (below).

### `brand.css` merged rather than overwritten

Both branches edited it. Production's change was the WebKit fix — an explicit
`width: var(--brand-nav-height)` replacing `aspect-ratio: 1`, because WebKit does not fold an
aspect-ratio-derived width into a flex item's intrinsic contribution and the theme toggle rendered
entirely off screen on every iPhone and iPad. A three-way merge applied cleanly (the regions are
disjoint) and both sides were verified present afterwards, rather than assumed.

### A second gate defect, found by the reconciled tree rather than reasoned about

The suite went 171/171, then failed one case on the next run: `projects-mistrust @ 768px — light`,
with **"Failed to take two consecutive stable screenshots"** and 125,968 differing pixels — a
distinct signature from the font race, and far too large to be glyphs. It passed 3/3 standalone
immediately after, so it was tempting to file as flake. It is not.

`useStickyRailOverlay` publishes the pinned strip's height from a `useEffect` + ResizeObserver,
so it lands **after first paint**, and `--stage-cap` / `--art-cap` are computed from it. The stage
therefore resizes once more *after* images, fonts and two composited frames have all settled — a
late layout shift that this change introduced and that none of the existing waits could see.

The gate now waits for `document.documentElement.scrollHeight` to hold steady across three
consecutive frames. Height rather than the token, deliberately: it catches any late reflow, does not
need to know which pages have a rail, and `scrollHeight` is an integer so equality is exact.
Recorded as Trap 6.

### Verification

- Suite **171 tests** (`--list`): production's 151 plus 18 sticky-chrome and 2 parking cases.
- Parking-spec threshold re-derived on *this* engine, not carried over: natural load reads 0 on both
  cases across three loads; the pre-fix engine read 67; an adversarial probe that plants all seven
  bubbles dead-centre on the target reads 44–66 on Contact and 4–12 on Projects. Bar set at 30 —
  above `NO_PROGRESS_FRAMES` (20) plus exit slack, far below the 67 that means the wedge is back.
- Engine copies byte-identical; `node --check` clean on both.
- `shxdowmap refresh --auto` → baseline re-recorded.

---

## Entry 132 — 2026-08-09

**Agent:** Opus 5 (kestrel, main)
**Cycle:** post-release cleanup
**Branch:** `portfoliowebsite` — **RELEASED**
**Task:** push the Aug 9 work, at the user's explicit instruction ("push once suite is green")

### Released `17c5bf6`, five commits, one deploy

`38c183b..17c5bf6` pushed to `portfoliowebsite` after the suite went green twice. One production
build, 15 credits. `bc3e278` (2026-08-08) was the previous production SHA.

Verified against the live site rather than the local build:

| Check | Result |
|---|---|
| Netlify deploy | `state: ready`, `skipped: null` — a real build, not a credit-exhausted skip |
| `/`, `/projects/`, `/gallery/`, `/contact/`, `/contact/thanks/` | all 200 |
| `/scripts/bubbles.js` in production | contains `NO_PROGRESS_FRAMES` — the fix is actually live |
| `Instagram post - 1.png` in production | **404** — the payload cut really shipped |
| `slides/slide-01.webp` in production | 200 — and nothing was over-deleted |

The `skipped` check matters here specifically: `docs/deploys.md` records that an out-of-credits push
returns `skipped: true` with no build log, which looks like a successful push and publishes nothing.
Worth noting the two commits immediately before this release both show `state: error` /
"Canceled build due to no content change" — that is the `[build] ignore` rule working on docs-only
pushes, not a failure.

Checkpoint: [`docs/checkpoints/2026-08-09-bubble-wedge-fix-release.md`](docs/checkpoints/2026-08-09-bubble-wedge-fix-release.md).

### Honest caveat

The bubble flake was stochastic — ~1 run in 3, and it passed 10/10 standalone while genuinely
broken. Two green full runs plus 7200 clean probe frames across two passes is strong evidence, not
proof. The checkpoint says so too, so nobody later reads "fixed" as "cannot recur".

---

## Entry 131 — 2026-08-09

**Agent:** Opus 5 (kestrel, main)
**Cycle:** post-release cleanup
**Branch:** `portfoliowebsite`
**Task:** `/shxdowflow` — the `bubbles-exclusion` flake

### The recorded hypothesis was wrong, and the measurement said so in the first run

`TODO.md` had a detailed suspect: the deadlock rescue teleports a trapped bubble, holds
`_relocating` for ~560ms while it fades back in, and `resolveZoneCollisions` skips it the whole
time — so a bubble fades to full opacity *inside* the form. Two previous sessions had theorised at
this defect and produced three wrong fixes between them (Entries 090, 115).

So this time nothing was changed until the engine had been instrumented. A throwaway spec walked
3600 animation frames on `/contact/` at 1440px, recording every visible bubble overlapping the form
along with the engine's own state for that bubble.

It caught the failure on the first run, and the state was the opposite of the hypothesis:

```
frame 0..67, 68 CONSECUTIVE frames of overlap
area 263px²   opacity 1   _relocating FALSE   stuckFrames 35 → 90+
bubble (517, 316) r=12     form zone top y=319
```

**`_relocating` was false and opacity was 1.** The bubble was not fading in after a rescue; it was
sitting there fully painted, *waiting* to be rescued. Every frame the resolver dutifully pushed it
out, and every frame something pushed it back — `bx` moved 517 → 514 in 24 frames.

### The zones overlap each other, so the bubble had no legal position

Dumping the 11 registered zones on `/contact/` found the pair immediately:

| Zone | Element | Rect |
|---|---|---|
| 5 | Contact intro `<p>` | `y 201..303` |
| 3 | the form, padded | `y 295..753` |

**They overlap by 8px.** A bubble in that band is pushed *up* by the form (nearest edge, 21px away)
and pushed *back down* by the paragraph the moment it gets there. There is no y where it clears
both, because clearing the paragraph upward needs `y ≤ 189` and the escape only looks one zone at a
time. So it oscillated about a pixel on the form's top edge, penetrating 9px, at full opacity.

The deadlock rescue does exist for exactly this. It fired — after **90 frames**. That is 1.5 seconds
of a bubble parked on the furniture the whole zone system exists to keep clear, and it is what the
spec was catching all along. The flake was never a measurement artefact; the test was right.

### Two changes, both in `scripts/bubbles.js` (and its `public/` copy)

**1. Rescue on lack of progress, not elapsed time.** A duration threshold cannot tell a wedge from
the deliberate 8px/frame escape glide, and that is why the old one was set so high: the glide is
healthy behaviour and can legitimately run 15+ frames when a scrolling card closes over a bubble.
Lowering 90 would have started teleporting bubbles mid-glide.

Progress separates them with no ambiguity. A glide reduces its penetration depth every single frame
and keeps setting a new record; a wedge oscillates and never beats its own best. `NO_PROGRESS_FRAMES`
(20) counts frames that fail to improve on the episode's *minimum* depth — compared against the
minimum rather than the previous frame, or a bubble bouncing +1/−1px would reset the counter every
other frame and never be rescued at all.

**2. `_relocate` teleports first and fades in at the destination.** It used to fade out over 250ms
*at the position it had already judged illegal*, with `_relocating` telling the resolver to leave it
alone — a quarter second of guaranteed coverage baked into the rescue itself. Fading in somewhere
legal costs the same 250ms and covers nothing, and the bubble still never appears to jump because it
is invisible while it moves. `_relocating` is now cleared as soon as the position is valid, so the
bubble is resolved normally throughout the fade-in instead of being skipped for 560ms.

### Verification

Same probe, same two cases, before and after:

| | contact @1440 | projects @768 |
|---|---|---|
| **Before** | 68 overlap frames, maxStuck 90, 3 relocations | 0 overlap frames, maxStuck 90, 3 relocations |
| **After, pass 1** | **0 / 3600**, maxStuck 2, 0 relocations | **0 / 3600**, maxStuck 20, 4 relocations |
| **After, pass 2** | **0 / 3600**, maxStuck 2, 0 relocations | **0 / 3600**, maxStuck 20, 6 relocations |

The Projects column is the fix working rather than the wedge disappearing: `maxStuck` sits exactly at
the new 20-frame threshold and relocations went *up*, so wedges are still occurring — they are now
detected in 333ms instead of 1.5s and moved invisibly. Zero overlap either way.

**`npx playwright test` — 151 passed, twice in a row** (3.3m each) with the probe specs deleted.

Both engine copies verified identical after editing (`scripts/bubbles.js` → `public/scripts/bubbles.js`);
that duplication has bitten before. No CSS touched, so no rebuild and no baseline movement — and the
visual gate captures under reduced motion, where the engine creates no bubbles at all.

### What to take from this

The two-line version for the next person, now in `AGENTS.md`: **zones on this site overlap each
other**, so "push the bubble to the nearest free edge" has cases with no free edge; and **measure
before theorising** — three wrong fixes came out of reasoning about this engine, and one afternoon of
instrumenting it found the cause in a single run.

---

## Entry 130 — 2026-08-09

**Agent:** Opus 5 (kestrel, main)
**Cycle:** post-release cleanup
**Branch:** `portfoliowebsite` — committed, **not pushed**
**Task:** `/shxdowflow` — review and land the uncommitted Aug 9 work

### Three sessions' worth of work had been sitting in the working tree

Entries 127, 128 and 129 were all finished and all uncommitted. HEAD was still
`38c183b` from Aug 8. Each of the three entries says "not pushed (working tree only)" in its
own header, so this was known rather than lost — but it meant a WebKit fix, a red-suite fix and a
39% payload cut were one `git checkout` away from gone, with no restore point between them.

Landed as three commits, reviewed against the tree rather than against the entries:

| Commit | What |
|---|---|
| `a2e4300` | Entries 127–128 — theme-toggle width, `webkit-mobile` project, dead `Script.js` tags |
| `0522f32` | Entry 129 — 33 files out of `public/` |
| (this one) | LOGBOOK, TODO, AGENTS, ARCHITECTURE |

### 131 source files were staged for removal from git, by nothing

`git rm -r --cached images/` had been run against the whole tree — every file still on disk,
every one staged as deleted, nothing on disk changed. No entry in this LOGBOOK mentions it, and
Entry 129 immediately below states the opposite: the slide sources "stay in `images/`, still
tracked". Committing the tree as found would have dropped every Figma source, every gallery
original and every icon out of version control, in a commit whose message was about something
else entirely.

Unstaged at the user's call (`git restore --staged images/`). Nothing on disk was touched.

**If you find a staged change you cannot trace to an entry, do not commit it.** The index survives
across sessions and an interrupted agent leaves no note.

### The WebKit gate was verified, not taken on faith

Entry 127 justifies a whole second Playwright project with "20 fail on the old CSS". That is the
kind of claim the repo's own convention says to prove by injected regression, so it was:
`brand.css` reverted to `aspect-ratio: 1` on both toggle blocks, CSS rebuilt,
`--project=webkit-mobile` run.

**20 failed, 1 passed** — exactly as claimed. The one that passes is *theme toggle still toggles
the theme*, which is correct: the button still works, it is just off screen. `brand.css` and
`style.css` were restored from backup and diffed byte-identical before committing.

### Verification

- **`npx playwright test` — 151 passed, twice in a row** (3.4m each). Two runs because
  `bubbles-exclusion › Contact form @ 1440px` flakes ~1 in 3 and one green run proves nothing
  against it. It passed both times; the open flake item stands unchanged.
- `npm run css:build` re-run before review — no further change, so the committed `style.css` was
  already current rather than the 8-day-stale case AGENTS.md warns about.
- `grep` for `Script.js` across HTML/JS/TS: no live `<script>` tag anywhere, only the replacement
  comments and history.
- `grep` for the deleted `public/` sources across `app/`: no reference except the doc comment in
  `mistrustSlides.ts` that names `slides.md` as *not* the source of truth.
- `shxdowmap status` → `fresh`, before and after.

### Not done

Not pushed. Pushing this branch is a production deploy at 15 credits, and the branch policy wants
the user's go-ahead in the moment, every time.

---

