# Logo Design section, project tools, and brand page expansion

**Written:** 2026-10-13, from the user's brief in chat.
**Status:** Track A SVGs made and waiting on the user's visual check; the rest not started. Every open box here is mirrored in [`../../TODO.md`](../../TODO.md).
**Branch:** none yet. Work on a `shxdowloop` or feature branch off `portfoliowebsite`; nothing
here ships until the user says so (a push to `portfoliowebsite` is a 15-credit production deploy,
so batch these tracks into as few pushes as possible).

## Tracks

| Track | What | Who writes the words |
|---|---|---|
| A | Vectorize the Phoenix logo and four White Rose logos, then publish them as "SECTION 6 Logo Design" | The user's draft copy, verbatim; the agent proofreads only |
| B | Add the tools used to each project | The user supplies the facts; the agent writes the site details |
| C | Brand page: business card, brand voice/tone, one more headed section | The user |
| D | Page-wide background watermark | Done 2026-10-13 |

---

## Track A: Logo Design (WGAW-registered series pitch)

### Deliverables

Five SVGs (answered by the user 2026-10-13):

1. **The Phoenix Logo**, one SVG.
2. **White Rose**, four SVGs: two logos, each in two renderings. The first rendering is **color**,
   the second is **black and white**. (An earlier draft of the brief said "4 versions"; the user
   confirmed 4 SVGs, so this is not 8.)

### Source

The PSD is **`White Rose Logo.psd`** in
`~/Library/Mobile Documents/com~apple~CloudDocs/ArtBridge/Procreate to PSD/` (found 2026-10-13, 4.7 MB,
saved Oct 10). The color and B&W renderings are **layer groups** inside it. The layer tree has not
been read yet; read it first and confirm which group is which.

The Phoenix source is in the ArtBridge root: `PhoenixSymbol.png`, `PhoenixSymbol-1.png`, `-2`, `-3`,
and `SVG/PhoenixSymbol.svg`. Confirm which is final (open question 3).

### Steps

1. Read the PSD's layer-group tree (names, which group is color, which is B&W).
2. **Recolor for B&W:** in the B&W rose groups the **green must become white**. The user asked for
   this explicitly; do it in the source group, not in the vector afterwards, so the PSD and the
   SVG agree.
3. Vectorize each group with the existing `vectorize` skill (Illustrator Image Trace; flat-colour
   art). The Phoenix logo was **designed as a stencil**, so keep its bridges and gaps as shapes
   rather than letting the trace close them.
4. Save to the ArtBridge folder next to the PSD first, with the user-facing names agreed below.
5. **Stop for the user's visual check on the saved files.** Nothing is added to the site until the
   user signs off. If they flag a file, loop on that file only.
6. After sign-off: copy the approved SVGs (and PNG fallbacks, as the existing logo kit does) into
   `public/images/`, under a new folder for the series logos.

### Site: "SECTION 6 Logo Design"

Add a **new project tile** to the Projects tab (a third tile, after A History of Mistrust and the
Avery Ember Day Brand), decided by the user 2026-10-13. Each project tile has its own page under
`/portfolio/`, so this adds a project page for it. The tile is titled exactly
**SECTION 6 Logo Design** ("SECTION 6" is the series title) and its image is the Phoenix symbol. Its description (the user's draft, to be published verbatim):

> Done for a WGAW-registered animated series pitch.

Per-logo descriptions (user's drafts, verbatim; the agent proofreads, never rewrites):

**The Phoenix Logo**

> a symbol of a revolutionary. This symbol was designed as a stencil. revolutionaries spray painted
> this icon onto armor, flags, buildings, and everything else they could get their hands on to
> honor their hero, The Phoenix, who assassinated their dictator. It is a symbol of the
> destruction it took in order to rebuild their lives without opression

**White Rose**

> A logo representative of a morally ambiguous individual who owns and operates a large scale
> scientific research coorporation.

Proofreading flags to raise with the user, **not fix silently**: `opression` (oppression),
`coorporation` (corporation), the lower-case sentence starts, and the missing closing period on the
Phoenix text. "WGAW" is the Writers Guild of America West.

Each logo card should reuse the existing logo-card pattern on the Brand page (swatch image, label,
SVG and PNG download links). Needs real `alt` text per logo, written with the user.

### Decisions (user, 2026-10-13)

- The tile is titled **"SECTION 6 Logo Design"**. "SECTION 6" is the **animated series title**, so it
  shows as visible text on the tile and page.
- The **Phoenix symbol is the title-card image** of the tile.
- The Phoenix is **redone** from the ArtBridge PNG, not reused from the old `SVG/` file.
- Rose logo 1 is the open rose (PSD group `rose1`), rose logo 2 is the bud (`New group`).

### Progress: vectorizing done, waiting on the visual check

Saved 2026-10-13 to `~/Library/Mobile Documents/com~apple~CloudDocs/ArtBridge/SECTION 6 Logo Design/`:

| File | Source | Result |
|---|---|---|
| `phoenix-logo.svg` | `ArtBridge/PhoenixSymbol.png` | 47 paths, one fill `#610000` (the art's own dark red), transparent |
| `white-rose-1-color.svg` / `-1-bw.svg` | PSD group `rose1` | 24 / 16 paths |
| `white-rose-2-color.svg` / `-2-bw.svg` | PSD group `New group` | 53 / 101 paths |

How they were made (so it can be repeated):

1. **PSD to PNG** with `psd-tools`: the groups were composited layer by layer (checked against the PSD's
   own group composite: max difference 2 of 255 on white). The B&W versions replace every non-black pixel
   of the layers named `If Colored` with white, so the green becomes white and the black outlines stay.
2. **Trace on SOL** (Illustrator Image Trace), with `creative-hub/scripts/sol-run.sh ... vectorize`
   and the art repo's `cash/scripts/trace.ps1` (the copy in the vectorize skill lacks `-NoCrop`, which the
   template needs). `6 Colors` for the color roses and the B&W roses, `Black and White Logo` for the Phoenix
   (traced as black, filled `#610000` afterwards).
3. **The B&W roses were traced on a magenta backdrop.** On transparent/white, the bud's stem outline has gaps,
   so its white fill merged with the white canvas and was removed with it (the first pass left a hollow stem).
   The magenta canvas path is deleted afterwards; the white stem and leaf fills stay.
4. **Background and crop:** the Illustrator canvas path was stripped and the viewBox cropped with
   `cash/scripts/crop_svg.py --pad 20`. All five are transparent.

Notes for the visual check:

- The B&W petals stay light grey (`#E2E3DF` / `#E5E2E1`) because that is the PSD's own petal fill. Only
  the green became white (leaves and stem, `#FEFEFE`). Say if the petals should be pure white too.
- The color roses keep two greens (`#003B0D`, `#004F11`) for leaf veins.
- `white-rose-2-bw.svg` has 101 paths because the petal fill traced as many small pieces; it renders correctly
  but would be worth merging if the file size matters.

Open questions: none for Track A. Next: the user's visual check of the five files; then copy the approved SVGs
(plus PNG fallbacks) into `public/images/`, add the project tile and page, write alts with the user.

---

## Track B: Tools used, per project

Add a "Tools" listing to each project. Facts from the user (2026-10-13) plus the build details,
read from `package.json` and `AGENTS.md` on the same day:

| Project | Tools |
|---|---|
| **A History of Mistrust** | Figma. Made entirely in Figma. |
| **Avery Ember Day Brand** | The logo was made in **Adobe InDesign**. The website is described below. The business card (Track C) will be made in InDesign. |

**How the website is built** (the detail the user asked the agent to write):

- **Framework:** Next.js 15 (App Router) with React 19, written in TypeScript 5. It is a **static
  export** (`output: 'export'`, built to `out/`), so the live site is plain HTML, CSS and JS files
  with no server.
- **Styling:** Tailwind CSS v4 utility classes plus a hand-written brand stylesheet (`brand.css`)
  that holds the design tokens, the spectrum outlines and the hover rules. Tailwind compiles
  `app.css` to `style.css`.
- **Motion and effects:** a bubble physics layer in JavaScript, plus CSS for the gradient outlines
  and transitions.
- **Images:** `sharp` generates the responsive 480w and 900w WebP sizes from each artwork.
- **Testing:** Playwright, including a 40-screenshot visual regression gate.
- **Hosting:** Netlify, deploying from the `portfoliowebsite` branch on every push.

Open: the user asked earlier (TODO "Reference data") whether to also list the portfolio site's own
frameworks on the Brand row. This plan assumes yes, since they asked for the details to be
written; confirm.

Where it renders: a short "Tools" row or section on each project's page, in the existing tag style
if one is added (no tag system exists yet).

---

## Track C: Brand page expansion

The user is adding more to the Brand project page (`app/portfolio/BrandProject.tsx`, rendered at
`/portfolio/brand/`).

1. **Business card (InDesign).** Design a business card containing:
   - the logo;
   - a **stylized, small QR code** that links to the portfolio website;
   - the email address;
   - the **Google Voice professional phone number**;
   - a sleek, fun design that matches the brand identity as expressed in the website CSS
     (palette, spectrum outline, type system, bubble motif from `brand.css`).
   Needs from the user: the email and phone number to print, the card size (US 3.5 x 2 in is the
   default assumption) and print-vs-digital. Pull colours and type from the live tokens, not from
   memory. The QR code must be tested by scanning before sign-off. Show the finished card on the
   Brand page.
2. **Brand voice and tone section.** A new section on the Brand page. The user writes the first
   draft; the agent proofreads only.
3. **One more new section with a header.** Recorded as the user said it ("another section with a
   header"). **Needs clarifying:** what the section covers and its title.

New sections need the Brand page's existing section-title styling, new visual-gate baselines
(regenerate on SOL with `--update-snapshots=all`, see `docs/visual-gate.md`), and a copy pass.

---

## Track D: Page background watermark (done)

The user reported on 2026-10-13 that the website background had become covered in watermarks.
Cause: the logo watermark pattern overlay added in Entry 154 (`.brand-page-watermark` in
`brand.css`, a fixed full-page layer tiling `public/images/patterns/bubble-watermark.png`).

Fix, 2026-10-13: removed the layer from `app/layout.tsx`, the rule from `brand.css`, and the unused
PNG. The tile can be restored from git (`git show a8036ab:public/images/patterns/bubble-watermark.png`)
if the overlay is ever wanted back at a lower strength. Verified in the Next dev server: no
`.brand-page-watermark` element, no watermark background on any element.

Separate from this, the **gallery artwork watermarks** are the per-image logo marks and are
unrelated; they stay.

---

## Order of work

1. Track D (done).
2. Resolve Track A's open questions with the user, then A end to end up to the visual check.
3. B and C can proceed in parallel with A; each needs the user's input first.
4. Copy for all new sections goes through the copy-pass rule: the user writes, the agent
   proofreads.
5. Re-baseline the visual gate **once, last**, on SOL, after all copy and layout are final
   (re-baselining earlier wastes the review pass).
6. One batched push, with the user's go-ahead in the moment.
