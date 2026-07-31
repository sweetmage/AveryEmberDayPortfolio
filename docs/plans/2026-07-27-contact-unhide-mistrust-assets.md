# Plan — Unhide Contact + resync "A History of Mistrust" assets after Figma edits

**Date:** 2026-07-27
**Branch:** `develop` (deploy pause in effect until 2026-08-06 — commit here, do **not** push `portfoliowebsite`)
**Status:** shipped 2026-07-27 (LOGBOOK Entry 106; committed 2026-07-31)

## Goal

Three deliverables:

1. **Contact page unhidden** — Contact returns to the nav and footer, and the four-label nav
   fits at 360px instead of overflowing by ~70px.
2. **"A History of Mistrust" assets resynced** — the user re-exported the source PNGs from Figma
   (copy edits on 10 slides + the cover, plus 3 brand-new set PNGs). Every derived asset the site
   actually serves is stale, and the alt text is the thing WCAG cares about here, so both get
   rebuilt and verified against the new images.
3. **Contact page opened in Chrome** for the user's manual review.

## Current state (verified 2026-07-27)

### Contact

- `app/contact/page.tsx` exists and is complete: `<h1>Contact</h1>`, `ConnectLinks`, and a
  Netlify form (`data-netlify="true"`, honeypot, POST → `/contact/thanks/`).
- `app/contact/thanks/page.tsx` exists.
- The page is **already built and routable** — it is only unreachable through the UI:
  - `app/components/Nav.tsx:10-11` — Contact entry commented out of `navLinks`.
  - `app/components/Footer.tsx:17-20` — Contact `<li>` commented out.
- Already covered by tests: `tests/visual-baseline.spec.js:12` (contact is 1 of the 5 baseline
  pages) and `tests/smoke-next.spec.js:52-56` (form present, `form-name` value correct).

### Mistrust images

| Layer | Path | State |
|---|---|---|
| Source slides | `images/myart/A History of Mistrust/Instagram post - N.png` (1080×1080) | **10 modified** (1, 2, 3, 6, 11, 12, 17, 21, 22, 28) |
| Source cover | `images/myart/A History of Mistrust/A History of Mistrust.png` | modified; **not referenced by the Next app** |
| Source sets | `images/myart/A History of Mistrust/sets/A History of Mistrust Set N.png` (10750×1080) | **new, untracked** |
| Served slides | `.../slides/slide-NN.webp` (720²) + `slide-NN@2x.webp` (1080²) | **stale** — 60 files, predate the Figma edits |
| Served sets | `.../sets/set-N.webp` (10800×1080) | **stale** — built from the previous set export |
| Public mirror | `public/images/myart/A History of Mistrust/**` | **stale**; `public/.../sets/` has only the 3 webp, no source PNGs |
| Alt text | `public/scripts/history-of-mistrust-slideshow.js:9-40` (`SLIDE_ALT`, 30 entries) | **misordered across slides 7-20 — pre-existing live defect, see below** |
| Slide doc | `images/.../supporting material/slides.md` + the `public/` copy | mostly correct on ordering; some stale wording ("Why Minority Communities" vs "Why Some Communities") |

Spot-checks done: slide 6 changed from "lied to and denied Black men treatment" to "lied to Black
men and denied them treatment" — and `SLIDE_ALT[5]` **already** matches the new wording. Slides 1
and 28 also already match. So on *wording*, the Figma pass appears to have been the user bringing
the artwork in line with the written alt text, not the reverse.

### The real defect: `SLIDE_ALT` is out of order, and it predates this export

Verified against the artwork 2026-07-27:

| Slide | What the PNG actually says | `slides.md` | `SLIDE_ALT` |
|---|---|---|---|
| 7 | "The US Government's slow response disproportionately harmed LGBTQ+ & POC communities. Current information on the subject has been removed from USA.gov." | ✅ matches | ❌ has "AIDS Care in Marginalized Communities" |
| 11 | "AIDS Care in Marginalized Communities" (Set 2 title card) | ✅ matches (Set 2 starts here) | ❌ has "LGBTQ+ individuals and POC often receive disproportionately inferior treatment…" |

So **`slides.md` is closer to the truth and `SLIDE_ALT` is the misordered artifact** — the reverse
of the initial read. Set 1 and Set 3 boundaries agree everywhere (Set 3 starts at slide 21 in
both); the drift is confined to the block from slide 7 through slide 20.

Consequences, which raise this above "resync some assets":

- Screen-reader users currently get **the wrong alt text on up to 14 slides** of a published
  portfolio piece. This is a live WCAG 1.1.1 failure that has nothing to do with the Figma
  re-export — the export merely surfaced it.
- The lightbox caption (`:71`, "Slide N of 30 · Set X") is computed from the array index, so
  wrong words are paired with wrong images and wrong set numbers.
- **`slides.md` is not automatically right either.** It has its own stale wording (slide 1
  "Minority"/"Some"; slide 3 "Un-funfact:"/"Un-Fun Fact:"; slide 5 "well into the 20th century"/"as
  recently as 2013"; slide 18 "over 39 million"/"over 44 million"; slide 28 "practices enforced in
  healthcare"/"practices in healthcare"). Neither text file is authoritative. **The artwork is.**

`public/` is the copy the Next export serves. `images/` is the legacy root-site copy. Both are
tracked, so both get updated (same duplication contract as `scripts/bubbles.js`).

## Scope decisions (confirmed by user, 2026-07-27)

- Image work = **re-derive assets + sync alt text + re-check set geometry**. In-image color
  contrast audit is **out of scope** for this run.
- Nav fit = **shrink the padding clamp**. No drawer/hamburger (AGENTS.md records the hamburger
  was deliberately removed in the 2026-07-14 restructure; re-adding it is a bigger decision).

---

## Parallel tracks

| Track | Scope | Depends on | Owner |
|---|---|---|---|
| **A — Nav fit + Contact unhide** | `app/components/Nav.tsx`, `app/components/Footer.tsx`, `brand.css`, `style.css` | none | main agent |
| **B — Asset regeneration** | `images/myart/A History of Mistrust/**`, `public/images/myart/A History of Mistrust/**`, a new `scripts/` generator | none | pro nano-agent sidecar, main agent reviews diff |
| **C — Alt-text + slide-doc verification** | `public/scripts/history-of-mistrust-slideshow.js`, both `slides.md` copies | B (needs the fresh webp to read) — but can read the source PNGs directly, so it can start immediately | main agent (visual reading is the deliverable; nano visual agent assists on batches) |
| **D — Verify + re-baseline + Chrome review** | `tests/`, snapshots | A, B, C all landed | main agent |

A and B are file-disjoint and run in parallel. C reads the same PNGs B reads but writes different
files, so it also runs in parallel. **D is strictly sequential and last** — it re-baselines every
snapshot, so it must not start until A/B/C are final.

---

## Track A — Nav fit, then unhide Contact

### A1. Make room at 360px (do this first)

Entry 099 measured **0px slack at 360px** with two labels. A fourth label overflows by ~68-70px.

All `brand.css` references below are to the **repo-root** `brand.css`, not anything in `src/css/`.

Current budget at 360px (all clamps at their lower bound because 360px is below every `vw`
crossover):

| Element | Rule | Width at 360px |
|---|---|---|
| Container gutters | `brand.css:593` `padding: 0 clamp(4px,0.5vw,6px)` | 8px total |
| Logo | `brand.css:602` `padding: 0 clamp(11px,1.6vw,20px)` + 36px mark (text hidden below `sm`) | ~58px |
| Links margin + gaps | `brand.css:647-648` `gap: 4px; margin-left: 4px` | 4px + 3×4px with four links |
| Each link | `brand.css:667` `padding: 0 clamp(11px,1.6vw,20px)`, `brand.css:670` `font-size: clamp(13px,1.05vw,15px)` | 22px chrome + label |
| Theme toggle | `height: 100%` + `aspect-ratio: 1` against `--brand-nav-height: clamp(62px,6vw,76px)` (`brand.css:101`) | 62px |

Levers, cheapest first. Apply enough to clear ~70px **with measured slack, not estimated**:

1. Link horizontal padding lower bound `11px → 6px` → **−40px** across four links.
2. Logo padding lower bound `11px → 7px` → **−8px**.
3. Link gap `4px → 2px` and `margin-left: 4px → 2px` → **−8px**.
4. Cap the theme toggle at narrow widths (e.g. `width: min(100%, 44px)` below `sm`) → **−18px**.
   44px is still above the WCAG 2.5.8 (AA, 24px) target-size minimum and meets 2.5.5 (AAA, 44px),
   so this does not cost accessibility. **Put this in the `#theme-toggle` block at `brand.css:238`,
   not `.brand-theme-toggle` at `brand.css:704`** — the ID wins, so editing the class is a no-op.
   The trap is already documented in the comment at `brand.css:235-237`.

Budget above totals ~74px, which clears the deficit with a few px to spare. **Do not ship on that
arithmetic** — measure (A3).

Constraints while editing:

- `--brand-nav-height` is read by three rules; change it only at `brand.css:101` if it is touched
  at all (this plan does not need to).
- The theme toggle carries **both** `id="theme-toggle"` and `class="brand-theme-toggle"`, and the
  ID block wins. Editing only the class is a no-op (AGENTS.md).
- Keep `align-items: stretch` on `.brand-nav`, `.brand-nav-inner`, `.brand-nav-actions` — the
  full-bar-height fills depend on it.
- Every clamp's **upper** bound stays where it is. Wide screens must not change, or 40 baselines
  churn for nothing.

### A2. Unhide

- `app/components/Nav.tsx:10-11` — uncomment `{ href: '/contact/', label: 'Contact' }`, delete the
  now-obsolete "Hidden until Netlify form detection" comment.
- `app/components/Footer.tsx:17-20` — uncomment the Contact `<li>`, delete the same comment.

### A3. Measure (gate — no eyeballing)

With `npm run dev` up, at 360/390/768/1440/2560/3440 in both themes:

- `document.querySelector('.brand-nav-inner').scrollWidth <= clientWidth` (no nav overflow).
- `document.documentElement.scrollWidth === clientWidth` (no page-level horizontal scroll — the
  Entry 085 failure mode).
- All four labels render un-truncated; **no clipped abbreviations** (standing user rule: clipped
  text is never acceptable as navigation).
- Each link's rendered width ≥ 24px (WCAG 2.5.8 AA).
- Focus ring still `2px solid var(--brand-accent)` on every nav link (AGENTS.md focus contract).

### A4. Rebuild CSS

`npm run css:build`, commit the regenerated `style.css`. Expect the diff to be limited to the nav
rules; if it is wider, check `git log -1 -- style.css` for staleness before assuming a regression.

---

## Track B — Regenerate derived image assets

### B1. Write `scripts/generate-mistrust-assets.js`

There is no existing generator for these — `scripts/generate-image-variants.js` covers gallery and
project thumbs only, and the Mistrust webp set was produced ad hoc in an earlier session. Write a
committed script so the next Figma re-export is a one-liner instead of another archaeology run.

Contract:

- Input: `images/myart/A History of Mistrust/Instagram post - N.png` for N = 1..30, and
  `images/myart/A History of Mistrust/sets/A History of Mistrust Set N.png` for N = 1..3.
- Output, written to **both** `images/…` and `public/images/…`:
  - `slides/slide-NN.webp` — 720×720, `webp({ quality: 80 })`
  - `slides/slide-NN@2x.webp` — 1080×1080 (native, no upscale)
  - `sets/set-N.webp` — full width, quality 80
- `sharp` is already a dependency (`generate-image-variants.js` uses it).
- Follow the existing script's conventions: skip-if-newer by mtime, `--force` flag, print each
  output path + KB, non-zero exit on a missing source.
- Match the **current** webp encoder settings as closely as possible so unchanged slides re-encode
  to near-identical bytes. If unchanged slides produce large diffs, the quality setting is wrong —
  tune it before committing 60 files of noise.

### B2. Run it, review the diff

`node scripts/generate-mistrust-assets.js --force`

Expect meaningful diffs on the 10 changed slides (both sizes, both trees) and all 3 sets;
near-zero-byte churn elsewhere.

### B3. Set geometry re-check

The new set exports are **10750×1080**; the old `set-1.webp` is **10800×1080**. 10750 does not
divide into 10×1080, so Figma changed the gutters or the frame padding.

What this does and does not break:

- **Does not break the lightbox.** `history-of-mistrust-slideshow.js:254-257` maps
  `.carousel-set img` index → `openLightbox(i * 10)`. That is index math on the set, not pixel
  math on the image. Geometry is irrelevant to it.
- **Does affect layout.** The `<img>` is `w-full h-auto` inside `.brand-frame`, so a changed
  aspect ratio changes the rendered height of all three All-Slides rows on the Projects page →
  the Projects visual baselines shift. Expected, and Track D absorbs it.

Verify: all three new sets are the same height (1080), each contains exactly 10 slides in order,
and slide 1 of each set matches `Instagram post - {1,11,21}.png`. Report the new aspect ratio.

### B4. Source PNG parity

`public/images/myart/A History of Mistrust/sets/` currently holds only the 3 webp — no source
PNGs, unlike the `images/` tree. Decide one way and apply it consistently: either mirror the
source PNGs into `public/` for parity, or (preferred) **leave them out** — they are ~1 MB each,
Next copies all of `public/` into the export, and nothing references them. Note the choice in the
LOGBOOK so the asymmetry is not read as a bug later.

### B5. Cover + thumb check

- `A History of Mistrust.png` (3.1 MB) changed but is referenced by **nothing** in the Next app —
  only historically by the legacy root `index.html`, which now points at `mistrust-thumb.jpg`.
  No action beyond committing the new source.
- `public/images/projects/mistrust-thumb.jpg` derives from **slide-09**, which is *not* in the
  changed set. Confirm slide 9 is byte-identical; if so, no thumb regeneration and no
  `generate-image-variants.js` re-run.

---

## Track C — Alt text and slide documentation

This is the actual WCAG work (1.1.1 Non-text Content). `SLIDE_ALT` is documented as "exact words
written on each slide" and is used as both alt text and lightbox caption source, so any drift
between artwork and array is a real defect for screen-reader users.

### C1. Read all 30 slides and build the source-of-truth table

Read each `Instagram post - N.png` and transcribe its on-image text. Produce a 30-row table:
slide number, **image text (authoritative)**, `SLIDE_ALT[N-1]`, `slides.md` slide N, and a verdict
per column.

**Verify all 30, not just the 10 modified.** The recon above already proved the array is
misordered from slide 7 onward, so a partial pass would leave the defect half-fixed.

Do not OCR-and-trust, and do not shortcut by copying `slides.md` — it has its own stale wording
(list in the recon section). These are the user's own words on a published portfolio piece; read
them visually and transcribe exactly, including punctuation, curly vs straight apostrophes, en/em
dash style, and the attribution format on the two pull-quote slides (Dr. Joycelyn Elders and
Dr. Karthik Sivashanker).

### C2. Rewrite `SLIDE_ALT` from the table

Expect this to be a **reorder of the slide 7-20 block plus wording fixes**, not a few edits. Rebuild
the array from the C1 table rather than patching entries in place — patching a misordered array
one line at a time is how off-by-one drift survives.

Sanity constraints:
- Exactly 30 entries; the loop at `:43-50` indexes 1..30 and a short array yields `undefined` alt.
- Escape apostrophes/quotes correctly — this is a plain `.js` file served as-is, not JSX.
- Long transcriptions are correct here even though they are long: for a text-in-image slide, the
  alt text *is* the content. Do not "summarize for brevity."
- `public/scripts/history-of-mistrust-slideshow.js` is the **only** copy of this file. Unlike
  `bubbles.js`, there is no `scripts/` twin to keep in sync — do not go looking for one.
- After the rewrite, confirm the set title cards land on slides 1 / 11 / 21, matching the
  `Math.ceil(slide.n / 10)` set math at `:71`.

### C3. Resync `slides.md` (both copies)

`images/.../supporting material/slides.md` and `public/.../supporting material/slides.md` get the
same C1 table applied. Its ordering is already correct (Set 2 opens at slide 11, matching the
artwork), so this is a **wording** pass, not a restructure — the inverse of C2. Keep each
`> *Research:*` citation note attached to the claim it supports; if a claim's wording changed
materially (slide 5's sterilization date, slide 18's death toll), check the note still fits the
new number rather than moving it blindly.

### C4. Do not touch

`MistrustProject.tsx` alt strings for the three set images ("slides 1 through 10 combined", etc.)
and the two supporting-material images are descriptive and still accurate. Leave them.

---

## Track D — Verify, re-baseline, review (sequential, last)

### D1. Focused checks

1. `npm run css:build` — three consecutive builds must be byte-identical (the `@source not`
   exclusion contract).
2. `npm run dev`, then the A3 measurements at all six widths × both themes.
3. Projects page: all 3 set images render, all 3 per-set slideshows advance 1→10, lightbox opens
   at the right slide from each set, Esc/arrows/Tab-trap all work.
4. Screen-reader spot check on 3 changed slides: the `<img alt>` in the DOM matches the words on
   screen.

### D2. Full suite + re-baseline

`npm test` will go red across the board — expected, because:
- Track A changes the nav on **all 5 pages** → all 40 visual snapshots.
- Track B changes the set-image aspect ratio → Projects page height.

Procedure (AGENTS.md, learned the hard way in Entry 082):

1. `npm test` first, red, to confirm the failures are *only* the intended ones. Review the
   `test-results/` diff PNGs before regenerating anything — an unreviewed update defeats the gate.
2. `npm test -- --update-snapshots`.
3. **Re-run the full suite until green twice in a row.** A bulk update silently skips files; when
   it does, re-run just those with `npx playwright test --update-snapshots -g "<test name>"`.
   Do **not** use snapshot mtimes as evidence of a complete update — unchanged snapshots keep old
   timestamps legitimately.
4. Review the regenerated PNGs before committing.
5. `tests/bubbles-exclusion.spec.js` must stay green — it is the only motion-enabled spec, and the
   nav padding change touches elements the exclusion list matches by selector.

### D3. Chrome manual review (the user's ask)

Do **not** run `build:next` while `npm run dev` is live — `distDir` is `out`, and the build deletes
the running server's runtime (Entry 080).

Use the `launchtest` skill (or `npm run dev` + open Chrome) and open
<http://localhost:3000/contact/> **headed**, per the standing no-headless rule for manual sessions.
Leave it open, and hand the user a short review checklist: nav shows four labels and Contact is
marked current, form fields are labelled and focusable in order, focus ring visible on every
control, submit button reachable, footer Contact link present, both themes.

---

## Verification summary

| Check | Command / method | Gate |
|---|---|---|
| CSS build stable | `npm run css:build` ×3 | byte-identical |
| Nav fit | DOM measurement at 360/390/768/1440/2560/3440, both themes | `scrollWidth <= clientWidth`, no clipped labels |
| Page overflow | `documentElement.scrollWidth === clientWidth` | equal at 360px |
| Asset regen | `node scripts/generate-mistrust-assets.js --force` | exit 0, **63 outputs per tree** (30 slides × 2 sizes + 3 sets) × 2 trees = 126 files |
| Alt-text parity | 30-row image-vs-array table | 30/30 match, set title cards at 1/11/21 |
| Smoke | `npx playwright test tests/smoke-next.spec.js` | green |
| Bubbles | `npx playwright test tests/bubbles-exclusion.spec.js` | green |
| Visual gate | `npm test` after re-baseline | green **twice in a row** |
| Manual | Chrome headed on `/contact/` | user sign-off |

---

## Risks

1. **Re-baselining hides an unrelated regression.** All 40 snapshots get regenerated in one pass,
   so anything else that drifted this week gets blessed silently. Mitigation: review the red diff
   PNGs *before* updating, and confirm each failure traces to Track A or Track B.
2. **The bulk `--update-snapshots` skip.** Documented, hit twice on 2026-07-23. Mitigation: green
   twice in a row, per-test re-runs for stragglers.
3. **webp re-encode churn.** If the encoder settings do not match the originals, all 60 slide
   files diff even though 20 slides are unchanged. Mitigation: B1 tunes quality until unchanged
   slides produce near-zero byte diffs, before committing.
4. **Tap targets at 360px.** Shrinking link padding to 6px is the main lever. Mitigation: measure
   rendered widths against the 24px WCAG 2.5.8 floor; if a link lands under it, take the reduction
   from the theme toggle and the gaps instead and raise the padding back.
5. **Alt-text transcription errors.** Reading 30 text-heavy images is exactly where a helper agent
   will confabulate. Mitigation: the main agent does the reading and transcription; helper output
   is treated as advisory and diffed against the images before it lands.
6. **The `SLIDE_ALT` misordering is a pre-existing live defect, not export fallout.** It is
   already shipped on the published site and affects up to 14 slides for screen-reader users.
   Two implications: (a) do not let it get absorbed into "resync the Figma export" in the LOGBOOK —
   it deserves its own line, since it predates this work and would have gone unnoticed otherwise;
   (b) it cannot ship fixed until the Aug 6 deploy, so it stays live until then regardless.
7. **Neither text file is authoritative.** `SLIDE_ALT` is misordered; `slides.md` has stale
   wording. The temptation to resolve C1 by diffing the two files against each other instead of
   against the artwork is the single most likely way this track produces confidently wrong output.

## Known dependencies on the user (not blockers for this plan)

- **Netlify form detection is still off.** The Contact page will be visible and the form will
  render, but submissions are not captured until the user flips form detection in the Netlify
  dashboard and sends one test submission. An agent cannot do this. Unhiding the page ahead of that
  toggle is the user's explicit call.
- **Deploy pause until 2026-08-06.** Nothing here reaches the live site. Commit to `develop`;
  do not push `portfoliowebsite`. Contact goes live with the single Aug 6 merge.

## Handoff / documentation

- `LOGBOOK.md` — one entry covering all three tracks, including the B4 `public/` parity decision,
  the new set aspect ratio from B3, and the D2 re-baseline scope. Give the `SLIDE_ALT` misordering
  its own paragraph — it is a pre-existing shipped accessibility defect, not part of the Figma
  resync, and future readers need to be able to find it as such.
- `TODO.md` — close "Re-check nav fit before re-enabling the Contact link" (line 161) and the
  Contact half of "Enable Netlify form detection" (line 26), leaving the dashboard toggle open as
  a user step. Condense to house format.
- `docs/ARCHITECTURE.md` — refresh via `shxdowmap refresh --auto` if the map is present.
- AGENTS.md line 142 says "Contact is temporarily commented out of nav + footer pending the
  Netlify Forms toggle" — update it.
- No commits, pushes, or deploys unless the user asks.
