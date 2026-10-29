# Bubble brand identity guide (PDF), rebuilt from the college retro guide

**Written:** 2026-10-28 (Consensus, VOID), from the user's ask: recreate the old brand guide PDF with the
bubble brand's design choices.
**Status:** Questions answered 2026-10-28 (see *Decisions*). Copy edit and the three-page mockup in progress.
**Branch:** `portfoliowebsite` (current). Nothing here touches the site or needs a push until the
optional last step (a download link on the Brand page), which is a production deploy and needs the
user's go-ahead in the moment.

## The source: what the old guide is

`D:\My Stuff\creations\Active Projects\finished\BrandAveryEmberDay\BrandAveryEmberDay\` on SOL (read
over `ssh sol` on 2026-10-28). The guide is `Guides\Avery Ember Day Brand Identity Guide.pdf`, also
exported page by page to `Avery Ember Day Brand Identity Guide.png\` (19 pages, 1545 x 2000 px, US
Letter portrait). White pages, black Barlow headings, grey page numbers bottom right. The folder also
holds the logo pack (`AveryEmberDayLogo\`, `.ai` source), mood board images and `.indd`, InDesign files
for the business card, stationery, backdrops and email signature, the Facebook cover `.psd`, and a
one-page `Summary\` sheet.

Page by page:

| # | Old page | Content |
|---|---|---|
| 1 | Cover | Full retro logo (coral circle, teal triangle, pink Dreamboat "Avery Ember" + "DAY"), tagline "Where vision finds form.", **Brand Philosophy** paragraph |
| 2 | Table of Contents | Dot leaders, page numbers (lists a page 20 that does not exist: Contact sits on 19) |
| 3 | Brand Mission | Mission Statement, Tagline, Core Values (Empathy, Positivity, Commitment to Growth), Brand Personality (Resilient, Understanding, ...) |
| 4 | Brand Mission, cont. | Personality (Adaptable, Warm), **Tone** (two paragraphs) |
| 5 | Moodboard | One paragraph ("retro-futuristic, neon-infused") + collage of triangles, neon type, iridescent textures |
| 6 | Logo Exploration: Final Design | 3 x 3 grid: full / AED / star icon, each in color on black, white on black, black on white |
| 7 | Drafts | First iteration (neon "Avery Day" triangle) and second iteration (glow + flat circle-triangle), each with a paragraph |
| 8 | Logo Space Guidelines | Clear space diagram (unit = triangle apex to circle), table: version, context, min size, background, margins |
| 9 | Size Variations + Color Variations | Primary / secondary / icon min sizes; smallest-size strip; color, white, black logo rules |
| 10 | Logo Usage | Do and Do Not lists, eight misuse examples with red crosses, one green tick |
| 11 | Color | Palette table: name, HEX, RGB, CMYK, swatch (7 colors + white), stripe swatch on black |
| 12 | Typography | Dreamboat Bold (logo only), Transducer Bold (H1, AED/DAY), Barlow (everything else, weights) |
| 13 | Typeface Reference | Specimen of every face and weight |
| 14 | Visual Summary | Black one-pager: logo, tagline, palette arrows, type hierarchy with roles |
| 15 | Brand Applications: Business Cards | Front (AED mark on black), back (QR code, site, email) |
| 16 | Stationery | Letterhead: teal wave header and footer, black logo top left |
| 17 | Backdrops | Tiled logo pattern in four colorways (white, color on black, black, color on white) |
| 18 | Social Media Banner, Favicon/App Icons, Social Media Mockup | Banner with tagline and wave lines; icon sizes; a post mockup |
| 19 | Email signature, Contact Info | Gmail signature screenshot; email and site |

Known faults in the old guide, so the new one does not copy them: the TOC lists 20 pages for a 19-page
document; the teal's RGB is wrong (`55,67,182` for `#37A7B6`, which is `55,167,182`); "Resillient" is
misspelled; page 14 says "Where vision meets form" against "finds form" everywhere else; black's CMYK
reads `75,68,67,90` beside RGB `0,0,0,0` (four values for RGB).

## The target: what the bubble brand is

Everything below is read from the repo, not from memory. The guide must pull these values from the
same files so it cannot drift from the site.

| Area | Bubble brand | Source of truth |
|---|---|---|
| Logo | Organic blue bubble cluster with hand-lettered "AED" in the lowest bubble. Two tiers: **Primary** (with AED) and **Icon Mark** (no text). Each in blue `#7eb8ff`, black, white; SVG + PNG | `public/images/icons/BubbleLogo/`, `primarySwatches` / `iconMarkSwatches` in `app/portfolio/BrandProject.tsx` |
| Palette | Brand Blue `#9acdff`, Accent `#CC44FF`, Neon `#00FFFF`, Gold `#f5b96a`, Dark BG `#0A0A0A`, Light BG `#F2F0EC`; iridescent spectrum `--brand-ir-1..6` | `palette` in `BrandProject.tsx`, `:root` in `brand.css` |
| Type | Display: **Sriracha**. Heading: **Outfit** (300-700). Body: **Inter** (300-600). All Google Fonts | `--brand-font-*` in `brand.css`, `@import` in `app/globals.css` |
| Shapes | Rounded frames (`--brand-radius-lg` 16px), thin low-contrast borders, the spectrum outline, the bubble motif | `.brand-frame` and friends in `brand.css` |
| Voice | Three approved traits: Clear and down to earth, Warm and attentive, Quietly playful; tone by place; words that fit; writing habits | `BrandVoice` in `BrandProject.tsx`, rules in `.agents/memories/brand-voice.md` |
| Description | "A complete personal brand identity system: logos, color, type and voice, built to work together. ..." | Brand page Description |
| Contact | averyemberday@gmail.com, averyemberday.com | `app/components/Footer.tsx`, `CNAME` |
| Applications | Business card and website banner: **the user designs these** (decided 2026-10-13); the site slot is hidden behind `SHOW_BRAND_ASSETS = false` | `TODO.md`, `2026-10-13-logo-design-and-brand-expansion.md` Track C |

Two things the site already settles that the guide must say plainly: the **logo blue `#7eb8ff` is not
Brand Blue `#9acdff`** (Brand Blue documents the `--brand-ir-4` token; Entry 148), and the palette is
documented in its **dark base** values, with the light theme derived.

## Page map: old guide to bubble guide

Same order and the same section names as the original, so the two read as a before and after. Letter
portrait, 8.5 x 11 in, to match.

| # | New page | What changes |
|---|---|---|
| 1 | Cover | Primary bubble logo, large, on Dark BG with a soft iridescent glow behind it. Tagline (Q1). Brand Philosophy in the new voice (Q2) |
| 2 | Contents | Generated from the page list, so the numbers are always right. Clickable, plus a PDF outline (bookmarks) |
| 3 | Brand Mission | Mission Statement, Tagline, Core Values, Brand Personality, rewritten to the voice rules (Q2) |
| 4 | Voice and Tone | Replaces the old Tone page with the approved Brand Voice and Tone section: intro, three trait cards with live-site examples, how it feels on each page, words that fit, writing habits. Text copied from `BrandProject.tsx`, not retyped |
| 5 | Moodboard | New bubble board: soap-film iridescence, soft blobs, glassy light, the spectrum, cozy dark rooms (Q4) |
| 6 | Logo: Final Design | 2 x 3 grid: Primary and Icon Mark, each blue on Dark BG, white on dark, black on Light BG. Same images as the site's download kit |
| 7 | (removed from main) | The retro evolution moves to a single footnote at the end of the guide (decision 6, revised 2026-10-28): the first and second iterations, the retro logo and the previous draft wording. The old PNGs from SOL go in the footnote only |
| 8 | Clear Space | New unit for the bubble mark (proposal: the diameter of the small left bubble, measured from the SVG path, not by eye). Diagram drawn over the SVG, table: version, use, min size, background, margins |
| 9 | Sizes and Color Variations | Min sizes found by rendering the SVGs down until the AED lettering stops reading (Primary) and until the bubbles merge (Icon Mark), checked at 1x and 2x. Rules for blue, white and black, matching the site's swatch notes ("Dark backgrounds", "Light backgrounds", "Favicon, app icon") |
| 10 | Logo Usage | Do and Do Not, phrased as what to do (voice rule 3), with misuse examples rendered from the real SVG with CSS transforms: stretched, recolored, rotated, busy photo background, drop shadow, bubbles rearranged, redrawn lettering. One correct example |
| 11 | Color | Table: name, role, HEX, RGB, CMYK, swatch. Adds the logo blue and the iridescent spectrum as its own strip. CMYK values computed, with a print note: Neon `#00FFFF` and Accent `#CC44FF` sit outside CMYK, so print versions are approximations |
| 12 | Typography | Sriracha (display, short and big), Outfit (headings, 600 default), Inter (body, 400). Roles and rules in the new voice |
| 13 | Typeface Reference | Specimen of every loaded weight of each family, set live in the fonts (real text, not images) |
| 14 | Visual Summary | Dark one-pager: logo, tagline, palette as bubbles (circles in place of the old arrows), type hierarchy with roles |
| 15 | Business Card | The user's own design (Q3). Front and back, plus the print spec |
| 16 | Stationery | Letterhead: black logo top left, a soft bubble-and-spectrum band in place of the teal wave, generous white space |
| 17 | Backdrops | Tiled bubble-mark pattern in four colorways (white on dark, blue on dark, black on light, blue on light) |
| 18 | Social: banner, icons, post mockup | Banner: the user's design (Q3). App icon and favicon sizes from the Icon Mark (512, 192, 48, 32, 16). Post mockup drawn in HTML (no screenshot of a real app) |
| 19 | Email signature, Contact | HTML signature that pastes into Gmail (logo PNG, name, email, site), shown in a drawn mockup; Contact Info with the live site (no longer "in progress") |

## How to build it

**HTML pages printed to PDF with Playwright**, in this repo. Reasons: the fonts, tokens and logo files
the guide documents are already here, Playwright is already a dependency, the output is deterministic
and diffable, and the text stays real text (searchable, selectable, readable by screen readers). The
retro guide was a hand-built document; InDesign stays available on SOL for the user's own business
card and banner, which the guide simply places as images.

Files (all under `docs/`, which Tailwind's `@source not "docs/**"` already excludes, so no class in
these pages leaks into the site CSS, and Netlify never publishes it):

- `docs/brand-guide/guide.html`: one HTML file, one `<section class="page">` per page, `@page { size:
  Letter; margin: 0 }`, `break-after: page`. Links `../../brand.css` for the tokens, so a token change
  flows into the next build.
- `docs/brand-guide/guide.css`: page grid, running page numbers, the guide's own components.
- `docs/brand-guide/assets/`: the old guide's iteration PNGs (page 7), mood board images, mockup art.
- `scripts/build-brand-guide.mjs`: loads `guide.html` in Chromium, waits for `document.fonts.ready`
  and every `<img>` to decode, fills the contents page from the `<section>` headings, then
  `page.pdf({ format: 'Letter', printBackground: true, tagged: true, outline: true })`. Also writes a
  PNG per page for review. Add `npm run build:guide`.
- Output: `docs/brand-guide/out/Avery Ember Day Brand Identity Guide.pdf` plus `out/pages/*.png`.
  Commit the PDF (it is the deliverable); gitignore the PNGs.

Pages are designed **dark-first** (Dark BG, Light text, the site's look) for the cover, section
openers and the Visual Summary, and **Light BG** for reading-heavy pages, so the PDF still prints well
on a home printer. Settled at the mockup step (step 2).

## Steps

1. **Answers first.** Get the open questions below answered.
2. **Mockup three pages for approval** (UI mockup rule): Cover, Color, Logo Usage. Render to PNG,
   share through the local export server link per `.agents/memories/review-links.md`. Stop until the
   user approves the look.
3. **Copy.** Per the standing rule the user writes and the agent proofreads, unless Q2 says the agent
   drafts. Either way the draft lands in `docs/brand-guide/copy.md` first, applies every rule in
   `.agents/memories/brand-voice.md` (few "I" statements, no "this, not this", no em dashes, plain
   words), and the user approves it before it goes into pages.
4. **Measure the logo** (clear-space unit, min sizes) from the SVGs with a small script, so the
   numbers on pages 8 and 9 are measured, not guessed.
5. **Build all pages**, then the applications the agent owns: stationery, backdrops, icons, post
   mockup, email signature. Business card and banner slots take the user's files when they exist
   (Q3).
6. **Verify** (below), then show the user the full PDF and the page PNGs. Loop on flagged pages only.
7. **Optional, needs a go-ahead:** offer the PDF as a download on the Brand page (and use the
   card/banner art to fill `SHOW_BRAND_ASSETS`). That is a site change: new visual baselines through
   `node tests/visual-docker.mjs --update-snapshots=all`, then a push, which deploys.

## Verification

- Every page PNG looked at, at full size, in the review link; nothing overflows the page or clips.
- Page count and contents numbers match; every contents entry and outline bookmark jumps to its page.
- Fonts: Sriracha, Outfit and Inter embedded (check with `pdffonts` or `qpdf --show-pages`; install
  poppler with Homebrew if missing). No fallback font on any page.
- Every HEX, RGB and token on the Color page is read from `brand.css` / `BrandProject.tsx` at build
  time; a check fails the build if a value in the page differs from the source.
- Text contrast WCAG AA on both page themes (`docs/accessibility.md`): 4.5:1 body, 3:1 large.
- The PDF is tagged and has a document title and language, so a screen reader reads it in order.
- Email signature: paste into a Gmail draft (send to self only) and check it holds its layout.
- QR code (if the card has one): scanned from the printed or on-screen PDF before sign-off.
- Two consecutive builds produce the same page PNGs.

## Decisions (Comet, 2026-10-28)

1. **Tagline:** keep "Where vision finds form."
2. **Words:** the old guide's text is Comet's draft. The agent edits it to the voice rules in
   `docs/brand-guide/copy.md`; **Comet makes the final call** on every line.
3. **Business card and banner:** wait for Comet's own designs. Those two slots stay placeholders.
4. **Mood board:** built from Comet's own material only (art, logo, spectrum, textures drawn in code).
5. **Logos:** the retro guide's three marks (full, AED, star icon) appear only as the previous
   version. The new guide documents Comet's existing bubble logos (Primary and Icon Mark), nothing new.
6. **Evolution page:** show the retro marks as earlier iterations.

## Open questions (answered above)

Kept for the record.

1. **Tagline.** Keep "Where vision finds form." from the retro guide, or write a new one for the
   bubble brand? *Recommend:* keep it; it reads fine with the bubble look and it is already yours.
2. **Who writes the words.** The old copy (mission, values, personality, philosophy) is in a voice the
   brand has moved on from: lots of "I", em dashes, abstract nouns. *Recommend:* the agent drafts a
   rewrite of each section to the approved voice rules in `copy.md`, keeping your meaning, and you edit
   it; the Voice page reuses the approved site text word for word. Default without an answer: you
   write, the agent proofreads.
3. **Business card and banner.** You said you'd design these. *Recommend:* the guide waits for your
   designs and places them; until then those two slots show "coming soon" in the draft PDF only.
   Alternative: the agent mocks up drafts in the guide for you to react to (the earlier card mockup
   was not approved, so this would be a fresh take).
4. **Mood board images.** The old board mixes found images (likely not yours to republish). *Recommend:*
   build the new board from your own material (site screenshots, the logo, the spectrum, your gallery
   art, textures drawn in code) so the PDF is safe to post publicly. Keep found images only if this
   stays a private or class document.
5. **Logo tiers.** The retro guide had three (full name, AED, star icon); the bubble brand has two
   (Primary with AED, Icon Mark). *Recommend:* document the two that exist. If you want a full-name
   wordmark lockup ("Avery Ember Day" in Sriracha beside the mark), that is new logo design and yours
   to make or approve.
6. **Evolution page.** *Recommend:* turn the old Drafts page into a retro-to-bubble story, showing the
   old marks as earlier iterations. Or leave the retro brand out of the new guide entirely.

## Approved scope (acceptance contract, 2026-10-28)

Approved by Comet through `/shxdowflow` Proposal mode. Scope: build all remaining pages of the guide into
`docs/brand-guide/guide.html` (the page order below), fix the grey strip, build the PDF and page PNGs, and make a
local commit on `portfoliowebsite`. No push, no site change, no deploy. Business card and banner stay placeholders
until Comet sends designs. Mood board drawn in code from the logo, spectrum and textures unless Comet sends images.
Retro marks (the three old logos) appear only in the footnote, copied from the SOL logo pack into
`docs/brand-guide/assets/retro/`.

Page order (folio numbers): 1 Cover, 2 Contents, 3 Mission, 4 Values and personality, 5 Voice and tone,
6 Moodboard, 7 Logo final design, 8 Clear space, 9 Sizes and color variations, 10 Logo usage, 11 Color,
12 Typography, 13 Type reference, 14 Visual summary, 15 Business card (placeholder), 16 Stationery,
17 Backdrops, 18 Social and icons, 19 Email and contact, 20 Footnote: previous retro brand.
