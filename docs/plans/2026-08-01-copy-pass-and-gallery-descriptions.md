# Copy pass + gallery descriptions

**Status:** planned, not started (user direction 2026-08-01 — document only)
**Branch:** `develop` (deploy pause until Aug 6)
**Related:** LOGBOOK Entries 110–111; `AGENTS.md` → Design Conventions

Proofread and rewrite the site's prose (Contact, project summaries, About), and give each
gallery piece a written description. Copy is the deliverable; the code changes are small and
mostly in service of rendering it.

---

## Goal

1. **Rewrite** the About box, the Contact intro, and both project summaries.
2. **Write 11 gallery descriptions** and render them.
3. Leave the site's voice consistent across all four surfaces.

## The copy that exists today

| Surface | File | Current state |
|---|---|---|
| About box | [`app/page.tsx:69-90`](../../app/page.tsx#L69) | 3 paragraphs: the decade-in-the-margins story, the specialisms paragraph, the closing CTA |
| Contact intro | [`app/contact/page.tsx:27-30`](../../app/contact/page.tsx#L27) | 2 sentences |
| Brand project summary | [`app/projects/BrandProject.tsx:80-84`](../../app/projects/BrandProject.tsx#L80) | 3 lines in `.project-desc` |
| Mistrust project summary | [`app/projects/MistrustProject.tsx:24-31`](../../app/projects/MistrustProject.tsx#L24) | 6 lines in `.project-desc` |
| Thanks page | [`app/contact/thanks/page.tsx`](../../app/contact/thanks/page.tsx) | Says "Your message has been sent" — see risk R4 |
| Gallery descriptions | [`app/gallery/gallery-data.ts`](../../app/gallery/gallery-data.ts) | `description: ''` on all 11 items |

## What the code already gives us

- **`GalleryItem.description` is already in the interface** (`gallery-data.ts:10`) and already empty on
  every item. Nothing about the data shape needs to change — write the strings.
- **It is never rendered.** `GalleryGrid.tsx` renders `caption`, sr-only `tags`, and `tools`. So this
  needs one render change, and that is where the real design decision lives (see Q1).
- Each page's `metadata.description` is separate from the on-page copy and will drift out of sync if
  only the visible prose is rewritten. Update both together.

---

## Parallel tracks

| Track | Scope | Depends on | Verify |
|---|---|---|---|
| **A — Gallery copy** | `app/gallery/gallery-data.ts` — `title` / `alt` / `description` × 11 | User's draft (Q3) | Preview line reads well clipped to one line; `alt` stands alone with images off |
| **B — Expand + motion** | `app/gallery/GalleryGrid.tsx`, `brand.css`, new motion spec | — (parallel with A) | See the motion concept doc's §8 |
| **C — Prose rewrite** | `app/page.tsx`, `app/contact/page.tsx`, both `*Project.tsx` | User's draft (Q3) | Reads in voice; `metadata.description` updated to match |
| **D — Re-baseline + verify** | `tests/…-snapshots/` | A–C done | Full suite green twice |

**B is now independent of the copy** — the expand mechanism can be built and tested against the
existing empty descriptions (or placeholder text) while the writing happens. That is the useful
parallelism here: A and C are blocked on the user's draft, B is not blocked on anything.

D is strictly last — re-baselining before the copy is final wastes the review pass.

---

## Decisions (user, 2026-08-01)

**Q1 — Expand on click, in place.** Each card shows a **one-line preview** of the description;
clicking expands the card so that both the description and the picture grow, **width-wise and
length-wise**, pushing the surrounding cards over. The grid continues below it — no lightbox, no
overlay. Card movement, expansion, and filter changes all get animation.

> Full visual and motion specification, including the CSS-Grid reflow problem this creates:
> [`2026-08-01-gallery-expand-motion-concept.md`](./2026-08-01-gallery-expand-motion-concept.md).

**Q2 — `alt` becomes a real description of the image**, not a repeat of the title. Consequences:

- Today `alt` and `caption` are identical strings (`alt: 'In Danger', caption: 'In Danger'`), so a
  screen-reader user hears the title twice and learns nothing about the artwork.
- The existing "captions" are **titles**, so they should become **headers**. The Gallery page already
  has `<h1 class="sr-only">Gallery</h1>` and `PageHeader`'s `<h2>Gallery</h2>`, which makes each
  piece an **`<h3>`** — correct heading order, and it gives screen-reader users a real navigable
  list of works instead of a wall of figures.
- Rename honestly while touching it: `caption` is now doing the job of a title. Renaming the field
  to `title` avoids the next person assuming it is `figcaption` text. Optional but cheap, and it is
  the moment to do it.
- That makes **three strings per item**: `title` (short), `alt` (describes the image for someone who
  cannot see it), `description` (the writing about the work). They are not interchangeable and
  should not be written by copy-pasting between each other.

**Q3 — The user writes the first draft** for every surface. The agent's role is proofreading,
tightening, and flagging inconsistencies, not generating voice. No copy gets written into these
files until that draft exists.

---

## Constraints

- **No em dashes.** This is copy published as the user, so the standing rule applies. Note the
  existing About copy already follows it (it uses commas and colons); the rewrite must not
  introduce them. Same for the gallery descriptions.
- **Plain language.** Portfolio copy is read by clients and recruiters, not designers. Avoid
  studio-internal vocabulary.
- **WCAG 2.1 AA** on any new text (`AGENTS.md` → Accessibility). Relevant if descriptions land on a
  new surface with its own colour.
- **`--brand-content-max` geometry.** Prose blocks span the shared container with no measure cap
  (Entry 100/107, user call 2026-07-31). Do **not** reintroduce a `max-w` or `mx-auto` on the About
  box or `.project-desc` to make longer copy "read better" — that was deliberately removed.
- **Deploy pause** until Aug 6; work on `develop`.

## Risks

- **R1 — This breaks a lot of visual baselines.** Copy changes move rest-state pixels on Home,
  Contact, both Projects tabs and Gallery. That is potentially most of the 40 visual snapshots
  (5 pages × 4 breakpoints × 2 themes). Budget for a re-baseline pass, update per test group rather
  than in bulk (bulk `--update-snapshots` has silently skipped files twice — `AGENTS.md`), review the
  PNGs, and require green **twice in a row**.
- **R2 — Text reflow at 360px.** Longer copy is where narrow-viewport overflow shows up. Check 360px
  in both themes, not just 1440.
- **R3 — Card-height regression (Track B).** The grid's `md:auto-rows-[1fr]` equal row heights and
  shared caption baseline are what an expanding card fights hardest. The visual gate grades each page
  against its own past self, so a newly-ragged grid still passes once re-baselined. Verify by eye,
  not just by suite.
- **R6 — Three strings per item is three chances to drift.** `title`, `alt`, and `description` will
  be written at different moments and can end up contradicting each other, the way `SLIDE_ALT` drifted
  out of order for twelve slides before Entry 106. The artwork is the source of truth. Consider a
  cheap consistency check (e.g. `alt` must not equal `title`) rather than trusting review.
- **R7 — Motion is invisible to the visual gate.** It captures under reduced motion, where every
  animation in Track B is disabled by design. Track B needs its own motion-enabled spec or it ships
  with zero coverage — see the motion concept doc §6.
- **R4 — The thanks page overpromises.** `/contact/thanks/` says "Your message has been sent" while
  the form is still unregistered (see TODO). If the copy pass touches Contact, fix or soften this in
  the same pass rather than rewriting around it.
- **R5 — Scope creep into redesign.** This is a writing task. Layout changes beyond what rendering
  descriptions requires belong in a separate cycle.

## Verification

- `npx tsc --noEmit`
- `npm run css:build` (×3 byte-identical) if any CSS changed
- `node scripts/measure-content-widths.js` — exit 0
- Full Playwright suite green twice after re-baselining
- Read every rewritten block at 360px and 1440px, both themes

## Out of scope

- Redesigning the gallery grid or Projects layout
- New photography or re-exported artwork
- Anything deploy-related — the push/deploy sequence is tracked separately in `TODO.md`
