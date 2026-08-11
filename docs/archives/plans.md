# Consolidated Archived Plans

All completed, cancelled, and superseded implementation plans consolidated from docs/archives/plans/*.md into a single reference file. Original individual files have been removed; this is the authoritative archive copy.

## Table of Contents

### Retired stubs (2026-08-09 consolidation)
Every plan that had shipped as of 2026-08-09 — see [Consolidation Stubs — 2026-08-09](#consolidation-stubs-2026-08-09) for outcome + LOGBOOK entry per file, and the recovery commands.

### Retired stubs (2026-07-12 consolidation)
Full text of these plans lives in git history — see [Consolidation Stubs](#consolidation-stubs-2026-07-12) at the bottom of this file for one-line status + recovery commands.

### Full-text archives
- [2026-05-20 — hero-bubbles-nanoagent-plan](#2026-05-20-hero-bubbles-nanoagent-plan)
- [2026-05-22 — branded-resume-nanoagent-plan](#2026-05-22-branded-resume-nanoagent-plan)
- [2026-05-28 — history-of-mistrust-canonical-content](#2026-05-28-history-of-mistrust-canonical-content)
- [2026-05-28 — history-of-mistrust-carousel-slideshow-lightbox](#2026-05-28-history-of-mistrust-carousel-slideshow-lightbox)
- [2026-05-28 — history-of-mistrust-sync-nanoagent-plan](#2026-05-28-history-of-mistrust-sync-nanoagent-plan)
- [2026-06-02 — all-plans-nanoagent-analysis](#2026-06-02-all-plans-nanoagent-analysis)
- [2026-06-02 — consolidate-plans-nanoagent-plan](#2026-06-02-consolidate-plans-nanoagent-plan)
- [2026-06-02 — google-ticktick-cross-target-sync](#2026-06-02-google-ticktick-cross-target-sync)
- [2026-06-03 — all-slides-fullwidth-stacked-sets](#2026-06-03-all-slides-fullwidth-stacked-sets)
- [2026-06-03 — complete-google-ticktick-plan-shxdowloop-nanoagent-plan](#2026-06-03-complete-google-ticktick-plan-shxdowloop-nanoagent-plan)
- [2026-06-03 — history-of-mistrust-rework](#2026-06-03-history-of-mistrust-rework)
- [2026-06-04 — accessibility-docs](#2026-06-04-accessibility-docs)
- [2026-06-04 — google-docs-access](#2026-06-04-google-docs-access)
- [2026-06-04 — phase-1-structural-fixes-shxdowloop](#2026-06-04-phase-1-structural-fixes-shxdowloop)

---

> **Status:** Consolidated in TODO.md > Completed Plans Archive

<a id="2026-05-20-hero-bubbles-nanoagent-plan"></a>
# Nanoagent Plan — Hero Bubble Animation Rebuild

**Date:** 2026-05-20  
**Handle:** NOVA  
**File:** `brand.css` (hero blob section only)

---

## Goal

Rebuild the 5 hero blobs in `brand.css` to feel like living, organic iridescent bubbles
instead of circular blobs rotating as a rigid group. Keep all brand token colors unchanged.
Do not touch any other section of brand.css.

---

## Current problems

1. `.brand-hero-blobs` has `animation: brand-blob-layer-rotate 60s linear infinite` — this
   spins all blobs as one rigid group. Mechanical, not bubbly.
2. All 5 blobs use the same `brand-float` keyframe, differentiated only by duration/offset.
   Their paths look identical.
3. `border-radius: 50%` — perfect circles, not organic blobs.
4. No per-blob rotation.
5. The `::before` specular highlight is static relative to each blob.

---

## Implementation spec

### Step 1 — Remove container rotation

Remove `animation: brand-blob-layer-rotate 60s linear infinite` from `.brand-hero-blobs`.
Keep `position: absolute; inset: -20%; pointer-events: none; z-index: 0; overflow: hidden;`
on `.brand-hero-blobs`. Remove `transform-origin: center center` since rotation is gone.

### Step 2 — Add organic morphing keyframes (5 unique)

Use CSS 8-value `border-radius` syntax to morph through 3 organic shapes per blob.
Add these 5 keyframes:

```css
@keyframes brand-blob-morph-1 {
  0%,100% { border-radius: 58% 42% 62% 38% / 44% 56% 44% 56%; }
  33%     { border-radius: 44% 56% 38% 62% / 60% 40% 58% 42%; }
  66%     { border-radius: 62% 38% 44% 56% / 38% 62% 50% 50%; }
}
@keyframes brand-blob-morph-2 {
  0%,100% { border-radius: 50% 50% 44% 56% / 56% 44% 62% 38%; }
  40%     { border-radius: 62% 38% 56% 44% / 44% 56% 38% 62%; }
  75%     { border-radius: 38% 62% 50% 50% / 62% 38% 44% 56%; }
}
@keyframes brand-blob-morph-3 {
  0%,100% { border-radius: 54% 46% 58% 42% / 42% 58% 46% 54%; }
  30%     { border-radius: 42% 58% 46% 54% / 54% 46% 58% 42%; }
  70%     { border-radius: 60% 40% 42% 58% / 46% 54% 40% 60%; }
}
@keyframes brand-blob-morph-4 {
  0%,100% { border-radius: 48% 52% 56% 44% / 58% 42% 52% 48%; }
  45%     { border-radius: 56% 44% 48% 52% / 42% 58% 44% 56%; }
  80%     { border-radius: 44% 56% 52% 48% / 50% 50% 60% 40%; }
}
@keyframes brand-blob-morph-5 {
  0%,100% { border-radius: 52% 48% 60% 40% / 40% 60% 48% 52%; }
  35%     { border-radius: 40% 60% 52% 48% / 58% 42% 56% 44%; }
  65%     { border-radius: 60% 40% 44% 56% / 44% 56% 42% 58%; }
}
```

### Step 3 — Add 5 unique float path keyframes

Each blob gets its own float trajectory. Remove `brand-float` from individual blobs and
use these instead:

```css
@keyframes brand-float-1 {
  0%,100% { transform: translate(0,   0)   scale(1);    }
  25%     { transform: translate(42px, -38px) scale(1.06); }
  55%     { transform: translate(-30px, 28px) scale(0.94); }
  80%     { transform: translate(18px, -16px) scale(1.02); }
}
@keyframes brand-float-2 {
  0%,100% { transform: translate(0,   0)   scale(1);    }
  20%     { transform: translate(-52px, -22px) scale(1.07); }
  50%     { transform: translate(24px,  44px)  scale(0.92); }
  75%     { transform: translate(-16px, 12px)  scale(1.03); }
}
@keyframes brand-float-3 {
  0%,100% { transform: translate(0,   0)   scale(1);    }
  30%     { transform: translate(28px, -44px) scale(1.10); }
  60%     { transform: translate(-36px, 20px) scale(0.90); }
  85%     { transform: translate(14px,  -8px) scale(1.04); }
}
@keyframes brand-float-4 {
  0%,100% { transform: translate(0,   0)   scale(1);    }
  35%     { transform: translate(-24px, -52px) scale(1.08); }
  65%     { transform: translate(36px,  18px)  scale(0.93); }
  90%     { transform: translate(-10px, -10px) scale(1.02); }
}
@keyframes brand-float-5 {
  0%,100% { transform: translate(0,   0)   scale(1);    }
  28%     { transform: translate(46px, 32px)  scale(1.12); }
  58%     { transform: translate(-22px, -40px) scale(0.88); }
  82%     { transform: translate(10px, 20px)  scale(1.05); }
}
```

### Step 4 — Update `.brand-hero-blob` base rule

Replace `border-radius: 50%` with an unset (let each numbered blob set it via animation).
Add `will-change: transform, border-radius` for performance.

```css
.brand-hero-blob {
  position: absolute;
  mix-blend-mode: screen;
  overflow: hidden;
  will-change: transform, border-radius;
}
```

### Step 5 — Update each numbered blob's animation

Replace each blob's single `animation: brand-float ...` with a compound animation
using `brand-float-N`, `brand-blob-morph-N`, and one of the existing `brand-float`
durations as a reference:

```css
.brand-hero-blob-1 {
  /* keep width/height/position/background/box-shadow unchanged */
  animation:
    brand-float-1   9s  ease-in-out infinite 0s,
    brand-blob-morph-1 12s ease-in-out infinite 0s;
}
.brand-hero-blob-2 {
  animation:
    brand-float-2  13s  ease-in-out infinite -4s,
    brand-blob-morph-2 16s ease-in-out infinite -3s;
}
.brand-hero-blob-3 {
  animation:
    brand-float-3   7s  ease-in-out infinite -2s,
    brand-blob-morph-3 10s ease-in-out infinite -5s;
}
.brand-hero-blob-4 {
  animation:
    brand-float-4  11s  ease-in-out infinite -7s,
    brand-blob-morph-4 14s ease-in-out infinite -2s;
}
.brand-hero-blob-5 {
  animation:
    brand-float-5   8s  ease-in-out infinite -5s,
    brand-blob-morph-5  9s ease-in-out infinite -1s;
}
```

### Step 6 — Update `prefers-reduced-motion`

Add all new animation names to the existing `prefers-reduced-motion` block:

```css
@media (prefers-reduced-motion: reduce) {
  .brand-hero-blobs,
  .brand-hero-blob,
  .brand-page-bg {
    animation: none;
  }
}
```

(This already covers blobs by class, so no extra selectors needed.)

---

## Files to touch

- `D:\My Stuff\Git\CometGit\portfoliowebsite\brand.css` — hero blob section only

## Do NOT change

- Any brand token (`--brand-*` vars)
- Any background/gradient values on numbered blobs
- box-shadow values on numbered blobs
- width/height/position on numbered blobs
- The `::before` specular rule
- `brand-page-bg`, `brand-page-noise`, or any non-blob section

---

## Verification

Open `index.html` in a browser. The hero should show 5 blobs that:
- Each morph independently into organic non-circular shapes
- Each float on a unique, non-identical path
- Do not spin as a rigid group

---

## Risks

- 8-value `border-radius` is fully supported in all modern browsers (Chrome/FF/Safari/Edge).
- `will-change: transform, border-radius` is a mild perf hint; safe to add.
- `mix-blend-mode: screen` unchanged; no new blend modes added.


---

> **Status:** Consolidated in TODO.md > Completed Plans Archive

<a id="2026-05-22-branded-resume-nanoagent-plan"></a>
# Nanoagent Plan: Branded Resume 2026-05-22

## Goal
Create `resume/AveryEmberDay_Resume_2026_Brand.html` — a resume that uses the brand.css token system fully, replacing all custom CSS with `--brand-*` variables and `brand-*` classes. Includes the BubbleLogo SVG, light/dark theme via `data-theme`, and print-friendly single-page layout.

## Approach
- Source content: `resume/AveryEmberDay_Resume_2026.html`
- Source tokens: `brand.css` (linked via `../brand.css`)
- Logo: `../images/icons/BubbleLogo/bubbleLogo-white.svg` (dark), `bubbleLogo-black.svg` (light, via CSS class swap)
- Theme toggle: mirror pattern from `index.html`
- Fonts: Sriracha (name/display), Outfit (section headings), Inter (body) — all from brand.css @import
- No external font imports — brand.css handles it

## Files to Touch
- CREATE: `resume/AveryEmberDay_Resume_2026_Brand.html`
- CREATE: `docs/plans/` (this file)

## Nano-Agent Roles
1. **explore** (readonly): Check brand-avery-ember-day.html, Dark resume, resume.html for brand-* patterns → findings
2. **implement** (if dispatched): bounded to resume/ only

## Verification
- Open in browser, check dark/light toggle, check print preview
- Confirm brand fonts render, logo appears, colors match brand palette

## Review Owner
Main agent (shxdow-flow) performs final diff review.

## Risks
- Print layout: brand.css is dark-first; need explicit `@media print` overrides for legible paper output
- Logo color: white SVG invisible on light bg — handle via separate logo variants per theme or CSS filter
- brand.css `@import` in `<head>` has Google Fonts; resume must link brand.css, not re-import fonts


---

> **Status:** Consolidated in TODO.md > Completed Plans Archive

<a id="2026-05-28-history-of-mistrust-canonical-content"></a>
# A History of Mistrust — Canonical Slide Content

Source: 30 final PNGs at `D:\My Stuff\creations\Best\A History of Mistrust\`
Transcribed: 2026-05-28

---

## Slide 1 — Title Cover
**A History of Mistrust:**
Why Some Communities Struggle to Trust Doctors

---

## Slide 2 — Fun Fact
**Fun Fact:**
Being LGBTQ+ is normal and okay

---

## Slide 3 — Un-Fun Fact
**Un-Fun Fact:**
Homosexuality was classified as a mental disorder that was treated with harmful conversion therapy or even shock therapy until 1973. Even after guidelines were changed, harmful treatments persisted through the 1980s, and discrimination persists today.

---

## Slide 4 — Systemic Discrimination
POC & LGBTQ+ individuals often face **systemic discrimination** when seeking healthcare.

---

## Slide 5 — Sterilization
Black, Indigenous, and Latinx women have been **sterilized without consent** as recently as 2013.

---

## Slide 6 — Tuskegee Experiment
**Tuskegee Experiment (1932-1972):**
American healthcare providers **lied** to Black men and **denied** them treatment for syphilis to study the disease, even **after** a widespread cure was developed.

---

## Slide 7 — AIDS Disparities
**AIDS Care in Marginalized Communities**

---

## Slide 8 — Diagnosis Disparity Stats
Black people represent only 12% of the population but bear 38% of new diagnoses (which is a >3x disparity ratio), while Hispanic individuals represent 18% of the population but bear 32% of new diagnoses.
**Why?**

---

## Slide 9 — Systemic Barriers / PrEP
**Systemic barriers** prevent access to life-saving treatments like **PrEP**

---

## Slide 10 — Barriers List
- High costs
- Lack of access to healthcare
- Stigma & discrimination
all contribute to these disparities.

---

## Slide 11 — Inferior Treatment
LGBTQ+ individuals and POC often receive **disproportionately inferior treatment** and face dismissal of symptoms.

---

## Slide 12 — Avoidance
This discrimination leads to avoidance of crucial treatment.

---

## Slide 13 — Later Diagnoses
This directly leads these communities to **later diagnoses & worse health outcomes.**

---

## Slide 14 — AIDS Crisis Stats
The AIDS crisis emerged in the early 1980s, claiming the lives of **over 44 million people worldwide.**

---

## Slide 15 — Government Response
The US Government's slow response **disproportionately** harmed LGBTQ+ & POC communities.
Current information on the subject has been **removed** from USA.gov.

---

## Slide 16 — Mistrust Consequences
**Mistrust leads to:**
- Late diagnoses
- Poorer mental health
- Non-adherence to necessary treatment
- **Higher mortality rates**

---

## Slide 17 — Quote (Dr. Joycelyn Elders)
"Health is more than the absence of disease. Health is about jobs and employment, education, the environment, and all of those things that go into making us healthy."
—Dr. Joycelyn Elders

---

## Slide 18 — Rebuilding Trust Intro
The first step to rebuilding trust is understanding why it was broken.
Share this series with your community and let's start that conversation together.

---

## Slide 19 — Do Your Part
**Do your part:**
- Get yourself tested
- End the stigma behind STDs
- Educate yourself
- Encourage your loved ones to get tested

---

## Slide 20 — Awareness
Awareness is only effective in numbers. Share this post among your community.
Let's work towards a better future together.

---

## Slide 21 — Rebuilding Trust Section Header
**Rebuilding Trust**
Between Marginalized Communities & Healthcare Providers

---

## Slide 22 — Why Rebuild Trust
Rebuilding trust is critical to closing the gap in medical care for marginalized communities.
Okay sounds cool, but... >>>

---

## Slide 23 — How Do We Start?
**How Do We Start?**
>>>

---

## Slide 24 — Community-led Clinics
**Support Community-led Clinics**
Clinics run by LGBTQ+ & POC often provide safe, affirming care. >>>

---

## Slide 25 — Representation Matters
**Representation Matters**
Patients trust providers who reflect their race, culture, & experiences.

---

## Slide 26 — Cultural Competency
**Cultural Competency is Essential**
Training doctors and nurses to understand diverse experiences is key to changing how marginalized communities receive care.

---

## Slide 27 — Quote (Dr. Karthik Sivashanker)
"We do have the power, if we come together, to make change."
—Dr. Karthik Sivashanker

---

## Slide 28 — Policy Changes
**Advocate for Policy Changes**
We need policies that require inclusive care and punish discriminatory practices in healthcare systems. >>>

---

## Slide 29 — Community Support
Community support for policy changes is necessary to ensure **inclusive healthcare for all!**

---

## Slide 30 — Final CTA
Share this to spread awareness so we can secure a future with healthcare that is:
- **inclusive**
- **affordable**
- **accessible**
- **culturally competent**

---

*End of canonical content.*


---

> **Status:** Tracked in TODO.md > A History of Mistrust — cross-target sync

<a id="2026-05-28-history-of-mistrust-carousel-slideshow-lightbox"></a>
# Plan: History of Mistrust — Carousel, Slideshow, Lightbox (Nanoagent)

**Date:** 2026-05-28  
**Agent:** kimi-k2.6 (shxdow-flow)  
**Scope:** `projects/history-of-mistrust.html` — replace static slide grid with interactive viewing modes: horizontal carousel, per-set slideshow, and click-to-fullscreen lightbox. Includes verification pass.

---

## Goal

Implement three interactive viewing experiences for the 30-slide Instagram carousel, then verify responsive behavior, both themes, keyboard navigation, and accessibility.

- **06** — Continuous horizontal carousel (3 sets of 10, no gaps, seamless)
- **07** — Per-set slideshow (one slide at a time) + combined set image after each set
- **08** — Click-to-fullscreen lightbox (keyboard + close, accessible)
- **10** — Verify: responsive, theme, a11y, keyboard nav, browser test

---

## Assets

| Asset | Path | Purpose |
|-------|------|---------|
| Display slides (720px) | `../images/myart/A History of Mistrust/slides/slide-NN.webp` | Grid, carousel, slideshow |
| Full slides (1080px) | `../images/myart/A History of Mistrust/slides/slide-NN@2x.webp` | Lightbox source |
| Combined sets | `../images/myart/A History of Mistrust/sets/set-1..3.webp` | Carousel strips + slideshow set boundaries |

---

## Approach

### 1. Horizontal Carousel (Task 06)

Replace the static grid with a **view-mode switcher** (Grid | Carousel | Slideshow). Default to Grid.

**Carousel mode:**
- A single wide container `overflow-x: auto` with `scroll-snap-type: x mandatory`
- Insert all 30 slides as `<img>` in a single `<div class="carousel-track">` with `display: flex; gap: 0;`
- Each slide `scroll-snap-align: start; flex-shrink: 0; width: 80vw;` (or `min(320px, 80vw)`)
- At boundaries between sets 1→2 and 2→3, insert a 1px separator or just let them flow ("no gaps, seamless")
- Add left/right arrow buttons and dot indicators
- Touch/swipe support via native horizontal scroll

**Rationale:** Using individual slides (not set images) preserves clickability for the lightbox and gives true "carousel" feel. The set images are used in the slideshow for set boundaries.

### 2. Per-set Slideshow (Task 07)

**Slideshow mode:**
- A single large slide viewer (max-width 720px, centered)
- Show one slide at a time
- Navigation: prev/next buttons + keyboard ArrowLeft/ArrowRight
- **Set boundaries:** After slide 10, insert the set-1 combined image as an interstitial. After slide 20, set-2. After slide 30, set-3.
- Set indicator tabs: Set 1 | Set 2 | Set 3 — clicking a tab jumps to that set's first slide
- Slide counter: "Slide X of 30"

**Slide order:**
```
Slides 1–10 → Set 1 image → Slides 11–20 → Set 2 image → Slides 21–30 → Set 3 image
```

### 3. Lightbox (Task 08)

**Trigger:** Click any `<img>` in Grid, Carousel, or Slideshow modes.

**Behavior:**
- Open fullscreen overlay (`position: fixed; inset: 0; z-index: 100`)
- Load `slide-NN@2x.webp` (full resolution)
- Close: Escape key, click backdrop, click close button (×), Enter/Space on close button
- Navigate: ArrowLeft/ArrowRight keys, click left/right hit areas
- Focus trap: Tab cycles within lightbox (close button, prev, next, image)
- Scroll lock: `overflow: hidden` on `<body>` while open
- Transition: fade-in 200ms

**Accessibility:**
- `role="dialog"`, `aria-modal="true"`, `aria-label="Image viewer"`
- Close button: `aria-label="Close image viewer"`
- Prev/Next: `aria-label="Previous image"` / `"Next image"`
- Live region: `aria-live="polite"` announcing slide number

### 4. View Mode Switcher

Add a tab-like switcher above the content area:
```
[ Grid ] [ Carousel ] [ Slideshow ]
```
- Active tab has `aria-pressed="true"`
- Only one mode visible at a time
- Grid: existing 3-column responsive grid (retained)
- Carousel: horizontal scroll strip
- Slideshow: single large viewer

### 5. CSS Conventions

All styles inline in `<style>` within `history-of-mistrust.html` to keep scoped. Use existing CSS custom properties from `brand.css` where available:
- `--brand-surface-1`, `--brand-surface-2`
- `--brand-border`, `--brand-border-mid`
- `--brand-text`, `--brand-text-muted`, `--brand-text-soft`
- `--brand-accent`, `--brand-accent-dim`
- `--brand-radius-lg`, `--brand-radius-md`
- `--brand-transition`, `--brand-transition-fast`
- `--brand-shadow-lg`, `--brand-shadow-card`

### 6. JavaScript Conventions

Inline `<script>` at bottom of page. No external dependencies. Vanilla JS only. Use event delegation for clicks. Cache DOM refs. Cleanup on page unload not needed (single-page).

---

## Files to Touch

1. `projects/history-of-mistrust.html` — primary implementation target
2. `TODO.md` — tick off 06, 07, 08, 10 when done
3. `LOGBOOK.md` — add entry

---

## Implementation Steps

### Phase A: Layout & View Switcher
1. Wrap existing slide grid in `<div id="view-grid" class="view-pane active">`
2. Add `<div id="view-carousel" class="view-pane">` and `<div id="view-slideshow" class="view-pane">`
3. Add tab buttons above with event listeners

### Phase B: Carousel
1. Generate 30 `<img>` elements in `.carousel-track`
2. Add CSS: `overflow-x: auto`, `scroll-snap-type`, flex layout
3. Add prev/next buttons and dot nav
4. Sync dot highlight on scroll (intersection observer or scroll event)

### Phase C: Slideshow
1. Create single `<img>` viewer + caption
2. Build slide array (slides 1–30 + set images at boundaries)
3. Prev/next + set tabs + counter
4. Keyboard nav within slideshow

### Phase D: Lightbox
1. Create overlay DOM structure (backdrop, image, close, prev, next)
2. Click handler on all slide images (grid, carousel, slideshow)
3. Open/close/keyboard logic
4. Focus trap + body scroll lock
5. Use @2x images for full resolution

### Phase E: Verify
1. Responsive: test 360px, 768px, 1024px, 1440px via browser dev tools
2. Theme: light/dark toggle, verify no hardcoded colors break contrast
3. Keyboard: Tab order, Enter/Space on buttons, Escape close, Arrow nav
4. Accessibility: axe-core or manual check for labels, roles, alt text
5. Console: no JS errors, all 30 slides + 3 set images load
6. Paths: all `src` attributes resolve

---

## Verification Criteria

| Check | Method |
|-------|--------|
| Carousel scrolls smoothly, snaps to slides | Manual drag / arrow buttons |
| Slideshow prev/next cycles through all 33 items (30 slides + 3 set images) | Keyboard + button click |
| Lightbox opens from all 3 view modes | Click grid img, carousel img, slideshow img |
| Lightbox keyboard: Esc close, Arrows nav | Manual keyboard test |
| Lightbox focus trap | Tab cycle within overlay |
| Responsive at 360/768/1024/1440px | Browser dev tools |
| Both themes readable | Toggle light/dark |
| No console errors | DevTools console |
| All image paths 200 OK | Network tab / visual confirm |
| Screen reader announces slide number | aria-live region |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| 30 slides × 3 modes = heavy DOM | Use `loading="lazy"` on grid, carousel images hidden until active |
| Lightbox focus trap complexity | Simple focusable element query, wrap tab at boundaries |
| Scroll-snap browser differences | Test in Chromium + Firefox; fallback to smooth JS scroll |
| Set image aspect ratios differ from slides | Set images are wider; limit max-height in slideshow/lightbox |
| Keyboard conflict with view switcher | Only bind slideshow/lightbox keys when respective mode active |

---

## Stop Conditions

- Any image fails to load → fix path first
- axe-core reports violation → fix before proceeding
- Console error → fix before final review
- Plan changes > 20% → stop and rewrite plan

---

## Human Decisions Required

None identified. All design choices map to existing brand system tokens.


---

> **Status:** Tracked in TODO.md > A History of Mistrust — cross-target sync

<a id="2026-05-28-history-of-mistrust-sync-nanoagent-plan"></a>
# A History of Mistrust — Cross-Target Sync (Nanoagent Plan)

Date: 2026-05-28
Owner (review): main agent (you, driving kilo)
Status: ready to execute

## Goal

The 30 final PNGs are the source of truth. Bring four targets into agreement with them:

1. **Portfolio website** (`D:\My Stuff\Git\CometGit\portfoliowebsite`) — build the missing case study page + fix the stale card.
2. **TickTick** — audit `history-of-mistrust` tasks, close finished ones, add follow-ups.
3. **Google doc** (private) — read + sync copy to match the PNGs, via agent-browser on the logged-in session.
4. **Local folder** (`D:\My Stuff\creations\Best\A History of Mistrust`) — reorganize / renumber, group finals vs supporting material.

Project is a 30-slide Instagram carousel infographic about medical mistrust in marginalized communities (HIV/AIDS, Tuskegee-era distrust, LGBTQ+ health, community-led clinics, policy advocacy). NOT an "illustrated narrative."

## Source assets

Local source: `D:\My Stuff\creations\Best\A History of Mistrust\`
- `A History of Mistrust.png` — full horizontal master infographic (all copy in one image)
- `Instagram post - 1.png` … `Instagram post - 30.png` — carousel slides (1 = title cover)
- `supporting material\` — `A History of Mistrust Process.pdf`, `HistoryofMistrustMoodboard.png`, `aHistoryOfMistrustStoryboard.jpg`

Repo already has: `images/myart/A History of Mistrust/` with cover PNG + supporting material. **Missing: the 30 carousel slides** — must be copied in.

## Roles / iteration plan (nano-agents)

> Max two concurrent tracks. Sequential by default. Don't fan out all 30 at once.

| # | Role | Type/Model | Scope | Writes? |
|---|------|-----------|-------|---------|
| 1 | Image transcription | `--type image`, **Kimi K2.6** (`kilo/moonshotai/kimi-k2.6`); fallback DeepSeek v4 Pro | Transcribe text + describe layout of slides in batches of ~6, attach via `--file`. Output structured per-slide JSON/markdown. | no (readonly) |
| 2 | Plan review | native or `--readonly` | Review this plan | no |
| 3 | Final diff review | native or `--readonly` | Review portfolio working tree | no |

**Vision check first:** before batching, run ONE slide through the chosen model and confirm it actually reads the pixels (returns real slide text, not a hallucination). If Kimi K2.6 lacks usable vision, fall back to DeepSeek v4 Pro, then to the default image model. Main agent verifies transcription against 3-4 slides read directly before trusting it (subagent output is not truth).

## Steps

### Phase 0 — Extract (source of truth)
- [ ] Vision smoke test on `Instagram post - 2.png`.
- [ ] Transcribe all 30 slides in 5 batches of 6. Capture: slide number, heading, body copy, any stats/citations, visual motif.
- [ ] Main agent spot-checks slides 1, 7, 15, 30 directly. Assemble canonical content doc.

### Phase 1 — Portfolio website
- [ ] Copy `Instagram post - 1..30.png` into `images/myart/A History of Mistrust/slides/` (consistent zero-padded names, e.g. `slide-01.png`).
- [ ] Create `projects/a-history-of-mistrust.html` from `projects/brand-avery-ember-day.html` template (header/nav/footer, theme toggle, return-to-top, `../brand.css` + `../style.css`). Sections: hero (correct tag = "Editorial / Infographic" or "Social Campaign", real description), carousel/slide grid (all 30), Moodboard, Storyboard, Process (link the PDF).
- [ ] Fix `index.html` card: replace `placeholder-img` with the cover image, correct the tag + description (currently wrongly "Narrative Illustration" / "multi-page illustrated narrative").
- [ ] Verify: open page in headed agent-browser, check all 30 slides load, links resolve, light/dark both look right, no clipped layout. Check gallery if mistrust belongs there too.

### Phase 2 — TickTick
- [ ] List tasks in Portfolio Website list (project id `69c8addc8f0823c509e1979f`) tagged `history-of-mistrust`.
- [ ] Complete tasks the finished PNGs satisfy.
- [ ] Add follow-ups (e.g. "publish case study page", "post carousel to IG", "sync doc"), tagged `history-of-mistrust`. Do NOT create new lists/groups.

### Phase 3 — Google doc
- [ ] agent-browser (headed) to the doc URL on logged-in Google session. Read current content.
- [ ] Diff against canonical content. Sync copy to match the final PNGs (title, framing, slide copy/order). Confirm edits with user before destructive rewrites.

### Phase 4 — Local folder
- [ ] Renumber/group: finals zero-padded (`slide-01.png`…`slide-30.png` or keep "Instagram post" naming consistently), keep `supporting material/` grouped. Add a README/manifest summarizing project + where it's published.

### Phase 5 — Document + review
- [ ] Update portfolio `LOGBOOK.md` (newest-first, format per conventions).
- [ ] Final review pass (native or readonly nano-agent) on the portfolio working tree.
- [ ] Main agent reviews full diff. No commits without explicit user go-ahead.

## Verification
- Portfolio: headed browser, all 30 slides + supporting assets render, links work, both themes, responsive (wide + narrow), no clipping.
- TickTick: re-list tasks, confirm states.
- Doc: re-read after edit, confirm matches canonical content.
- Folder: `ls` confirms consistent naming + grouping.

## Risks / notes
- Free/flash image models may attach files without real pixel vision — verify before trusting (per user feedback).
- Google doc is private; agent-browser session must be logged in. Confirm before overwriting doc content.
- No commits, pushes, or doc destructive rewrites without explicit user approval.
- Keep CDP/agent-browser commands strictly sequential (memory blowup risk on overlap).


---

> **Status:** Consolidated in TODO.md > Completed Plans Archive

<a id="2026-06-02-all-plans-nanoagent-analysis"></a>
# Nanoagent Plan: All Plans Cross-Reference Analysis (2026-06-02)

## Goal
Analyze all 5 existing implementation plans in `docs/plans/`, cross-reference each against the current codebase state (TODO.md, LOGBOOK.md, actual files), and produce a single consolidated summary for the user.

## Approach
Read-only analysis — no code changes. Pure synthesis of existing artifacts.

## Roles
| Role | Worker | Type |
|------|--------|------|
| Exploration | Main agent (already complete) | — |
| Plan review | Pro nano-agent (readonly) | Review analysis plan |
| Execution | Main agent | Synthesize findings |
| Final review | Pro nano-agent (readonly) | Review final summary |

## Steps
1. Read all 5 plan files + TODO.md + LOGBOOK.md (done)
2. Write this analysis plan
3. Dispatch pro nano-agent for plan review of this plan
4. Apply review feedback
5. Synthesize cross-reference of all 5 plans vs. current state
6. Present summary to user
7. Update LOGBOOK.md
8. Dispatch pro nano-agent for final review

## Files to Touch
- `#2026-06-02-all-plans-nanoagent-analysis` (this plan)
- `LOGBOOK.md` (update)
- No code files modified

## Verification
- Every plan has a status (DONE / PARTIAL / PENDING)
- Every plan's claimed status matches actual codebase files
- Open items from TODO.md accounted for
- No contradictory statements across the summary

## Risks
- Low risk: read-only analysis, no code changes
- The user may want a deeper dive on specific plans — mention this as a follow-up option

## Queue
Sequential (single track). One pro nano-agent for plan review, one for final review.

## Model Route (Codex via Kilo)
- Flash nano-agent: opencode/deepseek-v4-flash-free
- Pro nano-agent: opencode/go/deepseek-v4-pro (paid route available)


---

> **Status:** Consolidated in TODO.md > Completed Plans Archive

<a id="2026-06-02-consolidate-plans-nanoagent-plan"></a>
# Plan Consolidation — Nanoagent Plan (2026-06-02)

**Goal:** Consolidate 7 scattered plan documents (`docs/plans/*.md`) into a single authoritative reference within TODO.md. Make TODO.md the native source of truth for all project planning.

**Scope:** Documentation only. No code changes, no file deletions (yet — archive after user approval).

---

## Current State

**Plan files in `docs/plans/`:**
| File | Goal | Status | TickTick Ref |
|------|------|--------|--------------|
| 2026-05-20-hero-bubbles-nanoagent-plan.md | Rebuild hero blobs → organic iridescent animation | ✅ DONE | (no tasks) |
| 2026-05-22-branded-resume-nanoagent-plan.md | Create branded resume using brand.css tokens | ✅ DONE | (no tasks) |
| 2026-05-28-history-of-mistrust-canonical-content.md | Transcribe 30 carousel slides (source of truth) | ✅ DONE | (no tasks) |
| 2026-05-28-history-of-mistrust-carousel-slideshow-lightbox.md | 3 interactive viewing modes + lightbox for slides | ⏳ PARTIAL | Tasks 06, 07, 08, 10 open |
| 2026-05-28-history-of-mistrust-sync-nanoagent-plan.md | Sync source PNGs → portfolio, TickTick, Google, local folder | ⏳ PARTIAL | Phases 0–2 done; 3–5 pending |
| 2026-06-02-all-plans-nanoagent-analysis.md | Cross-reference all 5 plans vs. current codebase | ✅ DONE | (analysis only) |
| 2026-06-02-google-ticktick-cross-target-sync.md | Bi-directional task sync pipeline (TickTick ↔ Google) | ⏳ PARTIAL | Phase 0 done; 1–5 pending; auth setup done |

**Problem:** Planning knowledge is scattered across 7 files + TODO.md. Specs, implementation details, and task tracking are duplicated/fragmented.

---

## Consolidation Approach

**Key insight from plan review:** 2 of the 7 plans (carousel tasks 06/07/08/10, sync pipeline phases) are *already* tracked in TODO.md. Consolidation should:
1. Not duplicate what's already there
2. Add missing plans (hero bubbles, branded resume, canonical content, analysis) as summary references
3. Clarify which plans are "archived" (done) vs. "active" (in progress)

### Phase 1 — Create "Completed Plans Archive" section in TODO.md

Add a new section after the intro but before TickTick mirror, covering **DONE** plans only:

- **Hero Bubble Animation (2026-05-20)** — Rebuild hero blobs in brand.css with organic morphing + unique float paths. ✅ DONE
- **Branded Resume (2026-05-22)** — Create resume/AveryEmberDay_Resume_2026_Brand.html using brand tokens. ✅ DONE
- **A History of Mistrust — Canonical Content (2026-05-28)** — Transcribe 30 carousel slides as source of truth. ✅ DONE
- **All Plans Cross-Reference Analysis (2026-06-02)** — Analysis of all 5 plans vs. current codebase. ✅ DONE

Each entry includes:
- Short goal + date
- Status (✅ DONE)
- Key files touched
- Any noteworthy specs or verification notes
- Link to original plan file (for deep reference)

**In-progress plans** (carousel, sync pipeline) remain where they are in TODO.md — no duplication.

---

## Sample Archive Entry (Template)

Here's the format each DONE plan should follow in the "Completed Plans Archive" section:

```markdown
### Hero Bubble Animation (2026-05-20)
**Goal:** Rebuild 5 hero blobs in `brand.css` with organic morphing + unique float paths
**Status:** ✅ DONE
**Files:** `brand.css` (hero blob section only)
**Key specs:** 5 unique morphing keyframes + 5 unique float path animations; all brand tokens preserved
**Plan ref:** [#2026-05-20-hero-bubbles-nanoagent-plan](#2026-05-20-hero-bubbles-nanoagent-plan)
```

Apply this template to all 4 DONE plans (adjust goal/files/specs for each).

### Phase 2 — Add header notes to plan files

At the top of each plan file (first line, before existing content), add:
- For DONE plans: `> **Status:** Consolidated in TODO.md > Completed Plans Archive`
- For IN-PROGRESS plans: `> **Status:** Tracked in TODO.md > [section name]` (e.g., "A History of Mistrust — cross-target sync")
- For ANALYSIS plans: `> **Status:** Archived in TODO.md > Completed Plans Archive (reference documentation)`

Example (for hero-bubbles plan):
```markdown
> **Status:** Consolidated in TODO.md > Completed Plans Archive

# Nanoagent Plan — Hero Bubble Animation Rebuild
...
```

### Phase 3 — Update LOGBOOK.md

Add an entry documenting the consolidation:
- Task: Consolidated 4 completed plans into TODO.md "Completed Plans Archive"
- Impact: Single source of truth for finished work, cleaner reference structure
- What changed: Added "Completed Plans Archive" section to TODO.md
- Follow-up: Plan file archival decision (delete, keep, or move to docs/archives/)

### Phase 4 — User decision point

After user reviews the consolidated TODO.md, they can decide:
- **Keep plan files** — reference-only, no active maintenance
- **Delete plan files** — consolidation is complete
- **Archive plan files** — move to docs/archives/ or similar

---

## Files to Touch

| File | Change |
|------|--------|
| TODO.md | Add "Completed Plans Archive" section with 4 done plans (hero bubbles, branded resume, canonical content, analysis) |
| 4 completed plan files | Add one-line status note (reference to TODO.md) |
| 3 in-progress plan files (carousel, sync) | Add one-line status note (reference existing TODO.md sections) |
| LOGBOOK.md | Add entry for this consolidation task |

---

## Verification

- [ ] TODO.md has "Completed Plans Archive" section with 4 done plans
- [ ] Each archive entry has goal, date, key files, link to original plan file
- [ ] In-progress plans (carousel, sync) are NOT duplicated — existing TODO.md sections remain primary
- [ ] All 7 plan files have one-line status header pointing to their consolidated location
- [ ] LOGBOOK.md entry documents the scope and user decision point

---

## Risks

- **Low:** Documentation-only, no code changes.
- **User decision needed:** Should individual plan files be deleted or kept as archives?

---

## Implementation Order

1. Read all 7 plan files (done)
2. Synthesize into TODO.md Plan Archive section
3. Add cross-links from individual files
4. Update LOGBOOK.md
5. Present to user with archive decision point


---

> **Status:** Tracked in TODO.md > TickTick mirror — Portfolio Website list

<a id="2026-06-02-google-ticktick-cross-target-sync"></a>
# Nanoagent Plan: Google ↔ TickTick Cross-Target Sync (2026-06-02)

## Goal
Establish a cross-target task sync pipeline where **local files** (TODO.md, plus `docs/sync/` manifests) are the source of truth. Changes to local files are pushed outward to both **Google Tasks** and **TickTick** via MCP/API calls. No bidirectional pull — local wins always.

## Source of Truth
- `TODO.md` (existing task mirror sections)
- `docs/sync/ticktick-manifest.json` — TickTick project/task serialization (new)
- `docs/sync/google-manifest.json` — Google Tasks task-list serialization (new)
- `docs/sync/mapping.json` — cross-target ID mapping (local → Google ID, local → TickTick ID) (new)

## Approach
1. **Define the local schema** — a single canonical task representation in `docs/sync/local-tasks.json` derived from TODO.md; a regeneration script (`scripts/parse-todo.js`) extracts tasks from TODO.md's structured sections
2. **Build sync scripts** — two standalone Node scripts: `scripts/sync-ticktick.js` and `scripts/sync-google.js`
3. **Auth** — TickTick via existing MCP server (already working); Google via agent-browser logged-in session (Google Tasks API or direct DOM)
4. **Mapping layer** — after first push, persist `localId → remoteId` in `docs/sync/mapping.json` so subsequent syncs update existing tasks instead of duplicating
5. **Deletion sync** — if a task is removed from local-tasks.json, mark it `deleted` in mapping; sync scripts skip deleted tasks and optionally delete or archive the remote copy
6. **Dry-run mode** — `--dry-run` flag on all scripts outputs planned changes without mutating remote state
7. **Security** — `.gitignore` `docs/sync/mapping.json` and `docs/sync/*-manifest.json` to prevent leaking personal task IDs into the public repo

## Roles
| Role | Worker | Type |
|------|--------|------|
| Exploration | Main agent | — |
| Plan review | Pro nano-agent (readonly) | Review this plan |
| Implementation | Main agent + native Codex subagents | Build sync scripts + manifests |
| Verification | Main agent | Dry-run against TickTick MCP |
| Final review | Pro nano-agent (readonly) | Review working tree |

## Steps

### Phase 0 — Auth & access audit
- [ ] Verify TickTick MCP is running — list available MCP tools (check for `getTasks`, `listProjects`, `createTask`, `updateTask`, `completeTask`)
- [ ] Pull live TickTick data to confirm tool schemas and project/task structure
- [ ] Document Google auth path: agent-browser logged-in session OR Google Tasks API with OAuth token
- [ ] Surface login prompts for user (see Login Prompts section below)
- [ ] Create `docs/sync/` directory; add `.gitignore` entries for mapping/manifest files

### Phase 1 — Local schema
- [ ] Create `docs/sync/local-tasks.json` — canonical task array with fields: `id`, `title`, `description`, `dueDate`, `priority`, `status`, `tags`, `list/project`
- [ ] Populate from TODO.md TickTick mirror section + any Google-relevant tasks
- [ ] Create `docs/sync/mapping.json` — skeleton `{ ticktick: {}, google: {} }`

### Phase 2 — TickTick sync script
- [ ] Build `scripts/sync-ticktick.js` using TickTick MCP tools
- [ ] Support: create new tasks, update existing (by mapping), close completed
- [ ] Dry-run mode

### Phase 3 — Google sync script
- [ ] Build `scripts/sync-google.js` using Google Tasks API (REST via fetch)
- [ ] Same CRUD + dry-run support
- [ ] Auth: prompt for OAuth token or use agent-browser session cookies

### Phase 4 — Orchestration
- [ ] `scripts/sync-all.js` — runs both sequentially, reports diff, updates mapping
- [ ] Wire into TODO.md maintenance workflow (run after manual TODO.md edits)

### Phase 5 — Document + review
- [ ] Update TODO.md with sync pipeline section
- [ ] Update LOGBOOK.md
- [ ] Final diff review

## Files to Touch
- `docs/sync/` directory (new)
- `docs/sync/local-tasks.json` (new)
- `docs/sync/mapping.json` (new, gitignored)
- `docs/sync/ticktick-manifest.json` (new, gitignored)
- `docs/sync/google-manifest.json` (new, gitignored)
- `scripts/sync-ticktick.js` (new)
- `scripts/sync-google.js` (new)
- `scripts/sync-all.js` (new)
- `scripts/parse-todo.js` (new) — extracts tasks from TODO.md into local-tasks.json
- `.gitignore` (update — add `docs/sync/mapping.json` and `docs/sync/*-manifest.json`)
- `TODO.md` (update)
- `LOGBOOK.md` (update)
- No HTML/CSS changes

## Verification
- `scripts/parse-todo.js` correctly extracts all TickTick-mirror tasks from TODO.md into local-tasks.json
- TickTick MCP `getTasks` returns data matching local manifest
- Dry-run output shows correct create/update/delete operations
- Deleted tasks in local-tasks.json trigger remote archive/delete in dry-run
- Mapping file persists IDs correctly; no duplicates on re-sync
- No destructive operations fire without `--apply` flag
- Google sync gated behind login
- `docs/sync/mapping.json` and `docs/sync/*-manifest.json` are gitignored (not in repo)

## Login Prompts (for user)

### TickTick
TickTick MCP server is already configured and working (confirmed in Entry 012). No additional login needed — MCP handles auth via the existing TickTick account session.

### Google
Google sync requires one of two authentication paths. Choose one:

**Option A — Google Tasks API (recommended)**
A Google Cloud project with Tasks API enabled is needed and an OAuth 2.0 client ID configured. Use the following prompt with an agent-browser session:

```
Log into Google at https://accounts.google.com. Navigate to https://console.cloud.google.com/apis/credentials. Create an OAuth 2.0 client ID (Desktop application type), download the JSON, and provide the client_id, client_secret, and refresh token. Store these in a local .env file (never committed).
```

**Option B — Agent-browser DOM automation**
Use a logged-in agent-browser session to interact with https://tasks.google.com/ directly:

```
Log into Google at https://accounts.google.com and keep the session open. Navigate to https://tasks.google.com/ to verify your task lists are visible. Provide the session cookie string so the sync script can use it for authenticated API calls.
```

## Risks
- Medium: Google OAuth setup requires human with Google Cloud Console access
- Low: TickTick MCP rate limits on mass create/update
- Low: ID mapping drift if tasks are manually created in TickTick/Google outside the sync pipeline
- Mitigation: dry-run mode always runs first; `--apply` guarded by confirmation prompt

## Queue
Sequential. Phase 0 must complete before implementation. Phases 1-4 can be parallelized within scope.

## Model Route (Codex via Kilo)
- Flash nano-agent: opencode/deepseek-v4-flash-free
- Pro nano-agent: opencode/go/deepseek-v4-pro (paid route available)


---

<a id="2026-06-03-all-slides-fullwidth-stacked-sets"></a>
# Plan: All Slides — Full-Width Stacked Sets

**Date:** 2026-06-03
**Scope:** `projects/history-of-mistrust.html` — "All Slides" section layout: each set image takes full section width, stacked vertically.

---

## Goal

Ensure the "All Slides" section displays each set image (set-1.webp, set-2.webp, set-3.webp) at full section width, stacked top-to-bottom, with no grid side-by-side layout and no width constraints that shrink the images below the available section width.

## Current State

- `.project-section` has `max-width: 1200px` + `padding: 0 24px 80px`
- `.all-sets-full` uses `flex-direction: column; gap: 24px` (vertical stack)
- `.all-sets-full .carousel-set` has `width: 100%`
- Images have `width: 100%; height: auto`
- Layout is functionally correct but lacks visual polish (no border-radius, no overflow hidden on container)

## Changes

1. **CSS adjustments:**
   - Ensure `.all-sets-full` has `width: 100%` explicitly
   - Add `overflow: hidden` + `border-radius: var(--brand-radius-lg)` to `.all-sets-full .carousel-set` for visual consistency with other section cards
   - Add `border: 1px solid var(--brand-border)` and `background: var(--brand-surface-1)` to match `.slide-card` style
   - Add `cursor: pointer` via CSS (currently set by JS)
   - Add a subtle hover/focus style for the clickable sets

2. **Remove dead code:**
   - Remove `.slide-grid.all-slides-grid` media query (line 232) since it's never used
   - Remove `.slide-grid` CSS entirely if it has no other consumers (check)

3. **Verify:**
   - Responsive at 360px, 768px, 1200px, 1440px
   - Light/dark theme rendering
   - Lightbox click wiring still works
   - Labels remain correctly positioned

## Files Touched

- `projects/history-of-mistrust.html` (embedded CSS + HTML only)

## Result

All changes applied to `projects/history-of-mistrust.html`:

- `.all-sets-full` — added `width: 100%` explicitly
- `.all-sets-full .carousel-set` — added `border-radius`, `overflow: hidden`, `border`, `background`, `cursor: pointer`, hover/focus styles
- Removed dead `.slide-grid` and `.all-slides-grid` CSS + responsive overrides
- Changed `.carousel-set img` cursor from `zoom-in` to `pointer` in JS

Layout unchanged in structure — sets remain stacked vertically at full section width. Visual polish added to match `.slide-card` and `.supporting-card` styles.


---

<a id="2026-06-03-complete-google-ticktick-plan-shxdowloop-nanoagent-plan"></a>
# Nanoagent Process Plan: Complete Google ↔ TickTick Cross-Target Sync

**Date:** 2026-06-03  
**Branch:** `shxdowloop/2026-06-03/complete-google-ticktick-plan`  
**Source plan:** `#2026-06-02-google-ticktick-cross-target-sync` (archived) + `#2026-06-02-google-ticktick-cross-target-sync` (untracked working copy)

---

## Goal

Finish the Google ↔ TickTick cross-target sync pipeline: local files (`TODO.md` → `docs/sync/local-tasks.json`) as the single source of truth, with outbound sync scripts to TickTick (via MCP) and Google Tasks (via REST API). All phases from the original plan that are still pending must be implemented, verified, and documented.

---

## Preflight Results and Degraded Paths

| Check | Result |
|-------|--------|
| Workspace | Read-write |
| `docs/`, `docs/plans/`, `docs/sync/` | Exist and writable |
| Node.js | v25.9.0 — ok |
| npm | 11.12.1 — ok |
| Git remote | `origin` reachable — ok |
| Dirty worktree | Yes (user-owned from previous `archive-resume-html` loop); branched from current state |
| shxdowTracker | Blocked by Windows Application Control policy — **degraded** (cannot read provider usage) |
| Nano-agents | Available at `~/.codex/skills/nano-agents/scripts/nano-agent.sh` |
| Google auth | `.env` contains `GOOGLE_REFRESH_TOKEN` and `GOOGLE_ACCESS_TOKEN` — appears complete |
| TickTick auth | MCP server configured previously; live status unverified until Stage 1 probe |

**Degraded paths:**
- If TickTick MCP is unreachable, attempt to re-add MCP config or fallback to manual task reconciliation.
- If Google refresh token is expired/revoked, flag as hard blocker (requires human browser auth).
- If provider usage is above 70% but shxdowTracker is unavailable, route small tasks to nano-agents and self-review.

---

## Branch and Remote

- **Branch:** `shxdowloop/2026-06-03/complete-google-ticktick-plan`
- **Remote:** Pushed to `origin` with upstream tracking
- **Base:** `shxdowloop/2026-06-03/archive-resume-html` (includes uncommitted user-owned changes from prior session)
- **Policy:** Commit and push after every completed stage. Only commit intentional loop changes; do not stage unrelated dirty files without user direction.

---

## Helper Routing

- **Default:** Native Codex/Claude subagents for exploration, phase planning, plan review, and final review.
- **Execution:** Native subagents for scoped script builds (sync-ticktick.js, sync-google.js). Main agent owns integration and diff review.
- **Nano-agents:** Small directed tasks (parse-todo.js verification, narrow file searches, doc updates). Also used as pressure fallback if native capacity is constrained.
- **Fallback order:** Native → Nano-agent → Main-agent local work with extra self-review.

---

## Stage/Phase Outline

### Stage 1 — Foundation: Auth Audit, Local Schema, and Parser

**Status:** Active  
**Goal:** Verify both target APIs are reachable, establish the canonical local task schema, and build the TODO.md parser.

**Findings (updated during stage):**
- **Google auth verified:** Refresh token works; new access token obtained successfully.
- **TickTick auth gap:** TickTick MCP (`https://mcp.ticktick.com`) is configured in Kilo but not directly accessible from standalone Node.js without OAuth credentials. TickTick Developer Portal registration (Client ID + Secret + OAuth flow) is required for standalone script access. The sync script will be built with an auth abstraction and a `scripts/ticktick-oauth.js` helper (mirroring `google-oauth.js`). The user must complete the OAuth flow to obtain a `TICKTICK_ACCESS_TOKEN`.

**Phases:**
- [x] 1.1 Verify TickTick MCP live connectivity (list projects/tasks, confirm tool schemas) — **DEGRADED:** MCP reachable from Kilo agent context but not from standalone Node without TickTick Developer OAuth credentials. Documented auth gap; `scripts/ticktick-oauth.js` will be built in Stage 2.
- [x] 1.2 Verify Google refresh token (test token refresh or a minimal `tasks.list` API call) — **DONE:** Token refresh successful; new access token obtained.
- [x] 1.3 Define `docs/sync/local-tasks.json` schema (`id`, `title`, `description`, `dueDate`, `priority`, `status`, `tags`, `list/project`)
- [x] 1.4 Build `scripts/parse-todo.js` — extracts tasks from TODO.md structured sections into `local-tasks.json`
- [x] 1.5 Run parser and populate `docs/sync/local-tasks.json` — 80 tasks extracted (45 completed, 35 pending).
- [x] 1.6 Create `docs/sync/mapping.json` skeleton (`{ ticktick: {}, google: {} }`)

**Helpers:**
- 1.1–1.2: Main agent (auth probes require local env access)
- 1.3–1.4: Native phase-planner for schema design; main agent implements parser
- 1.5–1.6: Main agent

**Verification:**
- TickTick MCP returns project/task list without error
- Google API returns 200 on `tasks.list` or successfully refreshes token
- `scripts/parse-todo.js` correctly extracts all TickTick-mirror tasks from TODO.md
- `docs/sync/local-tasks.json` is valid JSON and matches schema
- `docs/sync/mapping.json` created and gitignored

**Checkpoint:** Commit after 1.6

---

### Stage 2 — TickTick Sync Script

**Status:** Complete  
**Goal:** Build a standalone Node script that syncs `local-tasks.json` outbound to TickTick via REST API, with mapping persistence and dry-run support.

**Phases:**
- [x] 2.1 Build `scripts/sync-ticktick.js` skeleton (load local tasks, load mapping, diff logic)
- [x] 2.2 Implement create task via TickTick REST API
- [x] 2.3 Implement update task via TickTick REST API (using `mapping.json` localId → remoteId)
- [x] 2.4 Implement complete/close task logic
- [x] 2.5 Implement deletion sync (local removed → remote archive/close)
- [x] 2.6 Implement `--dry-run` flag (print planned changes, no remote mutation)
  - [x] 2.7 Dry-run verification against live TickTick data — **DONE:** TICKTICK_ACCESS_TOKEN added to .env. Dry-run lists 83 planned creates (all tasks unmapped). Token valid, project reachable, diff logic correct.
  - [x] 2.8 Live apply (pending-only) — **DONE:** 24 pending tasks created in TickTick. Mapping persisted.

**Helpers:**
- 2.1–2.6: Native execution subagent (scoped to `scripts/sync-ticktick.js`)
- 2.7: Main agent runs dry-run and validates output

**Verification:**
- `--dry-run` outputs correct create/update/complete/delete operations
- Mapping file updated correctly after `--apply`
- No duplicate tasks created on re-sync
- Deleted local tasks trigger remote archive in dry-run

**Checkpoint:** Commit after 2.7

---

### Stage 3 — Google Sync Script

**Status:** Complete  
**Goal:** Build a standalone Node script that syncs `local-tasks.json` outbound to Google Tasks via REST API, with token refresh, mapping, and dry-run support.

**Phases:**
- [x] 3.1 Build `scripts/sync-google.js` skeleton (auth refresh, load local tasks, load mapping, diff logic)
- [x] 3.2 Implement token refresh on 401 (`POST https://oauth2.googleapis.com/token`)
- [x] 3.3 Implement create task via Google Tasks API
- [x] 3.4 Implement update task via Google Tasks API (using `mapping.json`)
- [x] 3.5 Implement complete task logic (`status=completed`)
- [x] 3.6 Implement deletion sync
- [x] 3.7 Implement `--dry-run` flag
  - [x] 3.8 Dry-run verification against live Google Tasks — **DONE:** Google Tasks API enabled. Token refresh works, `tasks.list` returns 200, "Portfolio Website" list found, 83 tasks queued for creation.
  - [x] 3.9 Live apply (pending-only) — **DONE:** 24 pending tasks created in Google Tasks list "Portfolio Website". Mapping persisted.

**Helpers:**
- 3.1–3.7: Native execution subagent (scoped to `scripts/sync-google.js`)
- 3.8: Main agent runs dry-run and validates output

**Verification:**
- Token refresh works automatically if access token expired
- `--dry-run` outputs correct create/update/complete/delete operations
- Mapping file updated correctly after `--apply`
- No duplicate tasks created on re-sync

**Checkpoint:** Commit after 3.8

---

### Stage 4 — Orchestration, Documentation, and Final Review

**Status:** Complete  
**Goal:** Wire both sync scripts into a single runner, update docs, and hand off.

**Phases:**
- [x] 4.1 Build `scripts/sync-all.js` — runs both sequentially, reports diff, updates mapping
- [x] 4.2 Add `--pending-only` flag to `sync-google.js`, `sync-ticktick.js`, and `sync-all.js`
- [x] 4.3 Update TODO.md with sync pipeline status and workflow notes
- [x] 4.4 Update LOGBOOK.md with sync cycle entry
- [x] 4.5 Final diff review by main agent
- [x] 4.6 Commit checkpoint

**Helpers:**
- 4.1: Main agent (small integration script)
- 4.4: Native reviewer subagent (readonly)

**Verification:**
- `scripts/sync-all.js --dry-run` runs without error and reports expected changes
- No application HTML/CSS modified
- `.gitignore` correctly excludes `docs/sync/mapping.json` and `docs/sync/*-manifest.json`
- No secrets committed
- TODO.md and LOGBOOK.md reflect completed work

**Checkpoint:** Commit after 4.6

---

## Helper Roles and Iteration Stop Conditions

| Role | Worker | Stop Condition |
|------|--------|----------------|
| Explorer | Native subagent | Returns relevant files, auth risks, and MCP schemas |
| Phase planner | Native subagent | Produces ordered edits with file paths, verification, and risks |
| Plan reviewer | Native subagent | Returns actionable issues only; planning stops when issues are addressed or accepted |
| Executor (TickTick) | Native subagent | Delivers `scripts/sync-ticktick.js` with dry-run support and test evidence |
| Executor (Google) | Native subagent | Delivers `scripts/sync-google.js` with dry-run support and test evidence |
| Final reviewer | Native subagent | Delivers findings on correctness, regressions, and checkpoint readiness |
| Small chores | Nano-agent | Task completes or stalls >6 min with no progress |

If a nano-agent fails, stall, or returns unusable output: retry once with a different model/route, then fall back to native or main-agent local work. Document the retry in LOGBOOK.

---

## Checkpoint Log

| Stage | Commit SHA | Push Status | Notes |
|-------|-----------|-------------|-------|
| 1 | `914cf52` | Pushed | Auth audit, local schema, parser. Google refresh token verified. TickTick auth gap documented. |
| 2 | `5f0ccc1` | Pushed | TickTick sync script built (REST API). Verification blocked on missing TICKTICK_ACCESS_TOKEN. |
| 3 | `5f0ccc1` | Pushed | Google sync script built (Tasks API v1 + auto refresh). Verification blocked on Google Tasks API not enabled. |
| 4 | `5f0ccc1` | Pushed | Orchestration (sync-all.js), docs (TODO.md, LOGBOOK.md), final diff review by main agent. |

---

## Verification Matrix

| What | How | Stage |
|------|-----|-------|
| TickTick MCP reachable | List projects/tasks call | 1 |
| Google token valid | `tasks.list` API call or refresh | 1 |
| parse-todo.js correct | Diff against TODO.md source | 1 |
| local-tasks.json valid | JSON parse + schema check | 1 |
| TickTick dry-run accurate | Inspect console output vs expected task list | 2 |
| TickTick mapping persists | Re-run dry-run, expect 0 creates | 2 |
| Google dry-run accurate | Inspect console output vs expected task list | 3 |
| Google mapping persists | Re-run dry-run, expect 0 creates | 3 |
| sync-all.js runs end-to-end | `node scripts/sync-all.js --dry-run` | 4 |
| No secrets in repo | `git diff --check` + grep for `REFRESH_TOKEN` in tracked files | 4 |
| Docs updated | TODO.md + LOGBOOK.md contain sync entries | 4 |

---

## Open Risks

1. **Google token expiration:** The stored access token may be expired. The sync script must handle 401 by refreshing. If the refresh token itself is revoked, this becomes a hard blocker requiring human re-auth.
2. **TickTick MCP schema drift:** TickTick MCP tools (`getTasks`, `listProjects`, `createTask`, etc.) were confirmed working in Entry 012. If schemas changed, the sync script will need adjustments.
3. **ID mapping drift:** Tasks manually created in TickTick/Google outside the sync pipeline will not have local IDs. The sync script should skip unmapped remote tasks rather than delete them.
4. **Rate limits:** Mass create/update on TickTick MCP or Google Tasks API may hit rate limits. The scripts should batch operations and surface rate-limit errors clearly.
5. **Uncommitted dirty files:** The current branch has pre-existing uncommitted changes from the `archive-resume-html` loop. These must not be accidentally staged into sync checkpoints.

---

## Merge Readiness Checklist

- [x] All 4 stages complete (script implementation, docs, and live apply done)
- [x] Each stage committed and pushed to origin
- [x] `docs/sync/mapping.json` and `docs/sync/*-manifest.json` are gitignored
- [x] `.env` is gitignored
- [x] No HTML/CSS/application code modified (this is a tooling/sync task)
- [x] Scripts include `--dry-run` mode and do not mutate remote state without `--apply`
- [x] TODO.md and LOGBOOK.md reflect completed pipeline
- [x] Process plan updated with final statuses and checkpoint SHAs
- [x] No secrets, tokens, or personal task IDs committed
- [x] Open risks documented with mitigations or acceptance

**Pre-merge human actions required:**
1. ~~Enable Google Tasks API~~ — **DONE** (verified via dry-run)
2. ~~Obtain TICKTICK_ACCESS_TOKEN~~ — **DONE** (saved to `.env`, verified via dry-run)
3. Run `node scripts/sync-all.js --dry-run` to verify both targets after unblocking. — **DONE**
4. ~~Run `node scripts/sync-all.js --apply` to perform the first live sync.~~ — **DONE** with `--pending-only` flag (2026-06-04). 24 pending tasks created in both TickTick and Google Tasks. 59 completed archive tasks skipped.

---

*Plan written by main agent during shxdowloop bootstrap. Live updates will be appended as stages progress.*


---

<a id="2026-06-03-history-of-mistrust-rework"></a>
# Plan: A History of Mistrust — Page Rework

**Date:** 2026-06-03
**Scope:** `projects/history-of-mistrust.html` (embedded CSS/HTML/JS) + crop `images/myart/A History of Mistrust/supporting material/HistoryofMistrustMoodboard.png`

---

## Goals (user request)

1. **Drop double headers** — remove the tiny gray `.section-label` eyebrows; keep only the big blue `.section-title`.
2. **Description to top** — move the description section directly under the hero title.
3. **Per-set slideshows** — replace the single tabbed slideshow (Set 1/2/3 tabs over one frame) with 3 independent slideshows, one per set. Desktop = 3 columns; mobile = stacked single column.
4. **New section order:** Title → Description → Slideshows (1|2|3) → Moodboard & Storyboard → All Slides → Sources.
5. **Match moodboard to storyboard** — crop moodboard left/right equally so its aspect ratio matches the storyboard, so the two captions line up in the 2-col grid.
6. **Kill All-Slides caption overlays** — the `.carousel-set-label` overlays are decorative; remove them visually (images already carry alt).
7. **Real alt text** — set every slide image's alt to the exact words on that slide (from canonical content doc).

## Current state

- Order: Slideshow (tabbed) → Description → All Slides → Moodboard → Sources.
- Slideshow JS: one `.slideshow-track`, internal array of 30 slides + 3 set images at boundaries, Set tabs jump to 0/11/22, shared prev/next.
- Lightbox: built from 30 individual slides; opened from slideshow viewer click + carousel-set image clicks.
- Slide alt generated in JS as `'Slide N'`.
- Moodboard 2000×1478 (ratio 1.353), Storyboard 2919×2439 (ratio 1.197).

## Changes

### Image crop
- Target moodboard ratio = storyboard ratio 2919/2439 = 1.1968.
- Keep height 1478; new width = round(1478 × 1.1968) = 1769. Trim 231px total (115 L / 116 R), centered.
- Write cropped `HistoryofMistrustMoodboard-cropped.png`; point the `<img>` at it. Original file untouched.

### HTML
- Delete all `<p class="section-label">…</p>` lines.
- Reorder sections: Description, Slideshows, Moodboard, All Slides, Sources.
- Replace the single slideshow section markup with a `.set-slideshows` grid containing three `.set-slideshow` widgets (data-set 1/2/3), each: small label, viewer (`.set-ss-viewer` + `.set-ss-track`), caption, prev/next + counter.
- Remove `.carousel-set-label` spans from All Slides (or wrap in visually-hidden — chosen: remove; alt covers a11y).

### CSS
- Remove `.section-label` rule + the old `.slideshow-*` single-frame / tab styles that are now unused.
- Add `.set-slideshows` grid: 1 col default, `repeat(3, 1fr)` at ≥900px, gap 24px.
- Add `.set-slideshow` widget styles (viewer aspect-ratio 1/1, track translateX, caption, controls) — adapted from existing slideshow styles, scoped per-widget.

### JS
- Remove tabbed slideshow logic.
- Add init loop over `.set-slideshow`: each builds its 10 slides into its track, wires its own prev/next + counter + caption + keyboard (when focused) + click-to-lightbox (maps local→global index `(set-1)*10 + local`).
- Keep lightbox as-is (30 individual slides). Carousel-set clicks still open lightbox at set start (0/10/20).
- Add `SLIDE_ALT[1..30]` array of exact slide words; slideshow + lightbox images use it.

## Files touched
- `projects/history-of-mistrust.html`
- `images/myart/A History of Mistrust/supporting material/HistoryofMistrustMoodboard-cropped.png` (new)

## Verification
- Preview server: load page, check console clean.
- Each per-set slideshow: prev/next cycles 10 slides, counter/caption correct, click opens lightbox at correct slide.
- 3-col at desktop, stacked at mobile (resize 360 / 1440).
- Moodboard & storyboard captions align in 2-col grid.
- No gray eyebrows; no All-Slides overlays.
- Lightbox still works from slideshows + set images.
- Light/dark themes.

## Risks
- Index mapping local→global for lightbox must match the 30-slide lightbox array (no set images in lightbox list).
- Removing shared keyboard handler — ensure per-widget keyboard only fires when that widget has focus.


---

<a id="2026-06-04-accessibility-docs"></a>
# Plan: Accessibility Documentation — brand.css

**Date:** 2026-06-04  
**Agent:** Kilo (Claude route, shxdow-flow)  
**Status:** Archived (completed)

---

## Goal

Create a living accessibility reference document (`docs/accessibility.md`) that captures how the current `brand.css` token system and component library satisfy WCAG 2.1 and AudioEye guidelines — plus marks known gaps and conventions that future contributors must follow.

No CSS changes are in scope for this plan. This is a documentation-only task.

---

## Context

An AudioEye-aligned accessibility audit of `brand.css` identified five areas where the codebase's design decisions intersect with WCAG conformance:

1. **Dark mode contrast** — `#0A0A0A` bg + `#f3f3ee` text → >10:1 ratio (exceeds AA/AAA)
2. **Light mode contrast adjustment** — accent shifts from `#CC44FF` (dark) to `#8B22E0` (light); text shifts from `#f3f3ee` to `#1C1C1A` on `#F2F0EC` bg
3. **Text hierarchy & muted swatches** — four tiers (`--brand-text`, `--brand-text-soft`, `--brand-text-muted`, `--brand-text-faint`); muted/faint are intentionally restricted to non-essential metadata
4. **Non-color interactivity indicators** — `.brand-card:hover` uses `translateY(-4px)` + shadow (not color alone); `.brand-btn:focus-visible` uses `outline: 2px solid var(--brand-border-focus); outline-offset: 2px`
5. **Reduced-motion & photosensitivity** — `@media (prefers-reduced-motion: reduce)` halts blob animations, bubble floats, iridescent border orbits, and bg drift; sets `animation-duration: 0.01ms`

---

## Approach

Write `docs/accessibility.md` as a structured reference covering:
- Contrast ratio table (dark + light, primary text, accent, muted tiers) with specific hex pairs and calculated ratios
- Per-section prose aligned to the five audit areas above
- Usage constraints: where muted/faint tokens are permitted vs. prohibited
- Focus indicator contract: explicit spec for `outline` on interactive elements
- Reduced-motion contract: what is suppressed and how to extend it when adding new animations
- Gap register: known remaining risks (muted/faint body-copy misuse, iridescent border-only conveying state, `.brand-circle-icon` using `--brand-text-muted`)
- Future contributor checklist

---

## Files Touched

| File | Action |
|------|--------|
| `docs/accessibility.md` | **Create** — primary deliverable |
| `TODO.md` | **Update** — add entry to Completed Plans Archive |
| `LOGBOOK.md` | **Update** — new entry |

No changes to `brand.css`, `style.css`, HTML pages, or scripts.

---

## Steps

1. Write `docs/accessibility.md` using the structure above, citing specific token names and hex values from `brand.css`
2. Add a completed-plan entry in `TODO.md` under the Completed Plans Archive section
3. Add a LOGBOOK entry documenting what was created and why

---

## Verification

- All hex pairs cited in the doc are verifiable against `brand.css` tokens (no invented values)
- Contrast ratios computed from actual token values using WCAG relative luminance formula
- Muted/faint usage constraints match `.brand-eyebrow`, `.brand-section-label`, `.brand-footer-credit` patterns actually present in `brand.css`
- Reduced-motion block at `brand.css:1126–1134` accurately described
- `focus-visible` spec at `brand.css:963–966` accurately described

---

## Risks

- **Contrast ratio precision:** Ratios stated from formula; not verified with a live tool run. Mark clearly as calculated approximations; user should validate with axe/WAVE before publishing accessibility statement.
- **Scope creep:** Do not audit `style.css` or project-specific HTML in this pass — that is a separate task.
- **Muted token misuse in HTML:** The doc can only prescribe usage rules; enforcement requires a future linting/audit pass against actual HTML pages.

---

## Review Owner

Main agent (Kilo) performs final diff review before handoff. User reviews and commits.


---

<a id="undefined"></a>
<a id="2026-06-04-google-docs-access"></a>
# Google Tasks Retire + Google Docs Access — Plan

**Date:** 2026-06-04
**Owner:** Avery (user) — agent implements after plan review.
**Replaces:** `#2026-06-02-google-ticktick-cross-target-sync` (Google Tasks half only; TickTick half stays as one-way reference).
**Status:** Reviewed and decisions resolved (2026-06-04). Ready for implementation on user go-ahead.

---

## Goal

Two-part scope change:

1. **Retire Google Tasks sync** — stop all writes from this repo to Google Tasks; clean up 24 orphan tasks pushed on 2026-06-04; remove or quarantine the Google-Tasks-specific code paths so they cannot be run by accident.
2. **Stand up Google Docs read/edit access** for the agent — re-scope the existing Google OAuth credentials to the Docs API, build a thin `scripts/google-docs.js` helper that supports `get`, `read` (export plain text/markdown), and `update` (batchUpdate) operations against a small allow-list of doc IDs, and document the workflow.

The pipeline stays local-first: the source of truth remains repo files; Google Docs becomes a **target the agent can read/edit on request**, not an autonomous sync target.

---

## Decisions (resolved 2026-06-04)

| # | Decision | Choice |
|---|----------|--------|
| D1 | **Doc scope** | **Allow-list** of doc IDs in `docs/sync/google-docs.json`. Agent never edits this file. |
| D2 | **OAuth scope** | `https://www.googleapis.com/auth/documents` **+** `https://www.googleapis.com/auth/drive.readonly`. Drive read access enables `find <name>` (title → ID) so user can discover doc IDs to add to the allow-list without leaving the terminal. Drive remains read-only; all writes go through the Docs API and are still gated by the allow-list. |
| D3 | **Orphan cleanup** | Scripted `sync-google.js --purge --apply` before retiring the script. |

**Implications of D2 (drive.readonly added):**
- The `find <alias_or_query>` subcommand becomes part of the `google-docs.js` MVP (was previously listed as optional/deferred).
- Token swap will request both scopes; verification gate must check **both** scopes are present and `tasks` is absent.
- `find` is read-only and unrestricted by the allow-list (it only returns IDs); `read`/`update` remain allow-list-gated.

---

## Approach

### Part A — Retire Google Tasks (one-shot cleanup, then quarantine)

1. **Add a `--purge` mode to `scripts/sync-google.js`** (single targeted addition, not a rewrite): deletes every task in list "Portfolio Website" whose `notes` contains `localId:` (i.e. previously synced by us). Dry-run first, then `--apply --purge`. Skips tasks the user added by hand. After each successful delete, clears the corresponding entry from `docs/sync/mapping.json` `google` map so stale mappings don't survive.
2. **Run purge once.** Verify Google Tasks UI shows 0 synced tasks remaining and `mapping.google` is empty (or only contains entries for tasks not in the list, which step 6 of Part A will drop wholesale).
   - **Recovery note:** if `--apply --purge` fails partway, re-run it. The `localId:` marker is idempotent (deleted tasks don't re-appear), and remaining tasks still get matched. Do **not** swap OAuth scope (Part B) until purge confirms 0 synced tasks remain. If the purge is unrecoverable for any reason, fall back to manual deletion in the Google Tasks UI before scope swap.
3. **Quarantine the scripts** by creating `scripts/_archive/` (does not exist yet), moving `sync-google.js` (and possibly `sync-all.js`, see step 4) into it, and dropping a `README.md` there explaining why they are retired. Use `git mv` so history is preserved.
4. **Update `scripts/sync-all.js`** to drop the Google leg (TickTick stays). If sync-all only had Google + TickTick, archive it too and keep TickTick callable directly.
5. **Trim `.env`** — leave `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_REDIRECT_URI`/`GOOGLE_TOKEN_URI` (reused for Docs); rotate `GOOGLE_REFRESH_TOKEN` + `GOOGLE_ACCESS_TOKEN` when scope is swapped (Part B step 2).
6. **Update `docs/sync/mapping.json`** — drop the `google` key; keep `ticktick` for the live TickTick mirror.

### Part B — Google Docs access

1. **Add `scripts/google-oauth.js`** (recreate; was deleted). One-shot OAuth helper that:
   - Prompts for the new scope (driven by D2).
   - Opens browser to consent URL, captures code via local `http://localhost` redirect.
   - Exchanges for refresh + access token, writes both to `.env`.
   - Idempotent: re-running rotates tokens cleanly.
2. **Run the OAuth helper** with both scopes from D2 (`documents` + `drive.readonly`). **Verification gate (must pass before continuing):** `curl -s "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=$GOOGLE_ACCESS_TOKEN"` returns a `scope` field containing **both** `https://www.googleapis.com/auth/documents` **and** `https://www.googleapis.com/auth/drive.readonly`, and **not** `https://www.googleapis.com/auth/tasks`. If the old `tasks` scope is still present, the user revokes the old grant in Google Account → Security → Third-party apps and re-runs the OAuth helper.
3. **Create `docs/sync/google-docs.json`** — allow-list of doc IDs the agent may touch (D1=a). Schema:
   ```json
   {
     "version": "1.0",
     "docs": [
       { "id": "<doc-id>", "alias": "history-of-mistrust", "permissions": ["read", "write"], "notes": "Phase 3 deferred sync from 2026-05-28 plan" }
     ]
   }
   ```
   Start with one entry: the History of Mistrust doc (Phase 3 of the 2026-05-28 plan was deferred specifically for this).
4. **Build `scripts/google-docs.js`** — thin Node helper, no extra deps, mirrors `sync-google.js` patterns (raw `https`, env loader, token refresh). Subcommands:
   - `node scripts/google-docs.js list` — print allow-list.
   - `node scripts/google-docs.js read <alias|id>` — fetches the document; outputs plain text by default; `--format=markdown` runs a minimal paragraph/heading converter; `--format=json` dumps raw `documents.get` response.
   - `node scripts/google-docs.js diff <alias|id> <local-file>` — reads doc, diffs against a local file, exits non-zero on differences. Read-only.
   - `node scripts/google-docs.js update <alias|id> --from=<local-file> [--apply]` — replaces the entire body via a single `batchUpdate` (`deleteContentRange` + `insertText`). Default is dry-run; `--apply` writes. Refuses if `permissions` lacks `write`.
   - All write paths require the alias/id to be present in `google-docs.json` AND have `write` in `permissions`.
5. **`find` subcommand (in MVP per D2):** `node scripts/google-docs.js find <query>` — Drive search by title (`drive.googleapis.com/drive/v3/files?q=name contains '<query>' and mimeType='application/vnd.google-apps.document'`) returns matching `(id, name, modifiedTime)` rows so the user can copy an ID into the allow-list manually. Read-only; bypasses the allow-list intentionally (it's a discovery tool that returns nothing actionable on its own).
6. **Documentation**:
   - Add a "Google Docs access" section to `AGENTS.md` (or `README.md` near the scripts table if AGENTS.md doesn't exist) with one-paragraph usage and the allow-list rule.
   - Note that **the agent never adds entries to `google-docs.json` autonomously** — user must edit it. This is the safety boundary.

---

## Files to Touch

**Add:**
- `scripts/google-oauth.js` (new; recreates retired helper, scope-configurable). Note: this file was referenced by `scripts/sync-google.js:232` but is currently **absent** from the repo — recreating it is mandatory, not optional.
- `scripts/google-docs.js` (new)
- `docs/sync/google-docs.json` (new; allow-list, starts with 1 entry). **Add to `.gitignore`** alongside `.env` — doc IDs are sensitive and the allow-list should not enter git history.
- `scripts/_archive/` (new directory) + `scripts/_archive/README.md` (new; explains retired sync scripts)
- `tests/google-docs.test.js` (new; minimal `node --test` style or plain `node -e` assertions — no new dependency. Covers: allow-list enforcement, purge filter, scope rejection.)

**Modify:**
- `scripts/sync-google.js` → add `--purge` mode, then move to `scripts/_archive/`
- `scripts/sync-all.js` → drop Google leg, then archive if only Google+TickTick
- `docs/sync/mapping.json` → drop `google` key
- `TODO.md` → close the "Sync Scope Change" item; add brief "Google Docs access" reference under Active Plans
- `LOGBOOK.md` → entry for retire + Docs setup
- `AGENTS.md` (or `README.md`) → Docs access usage paragraph

**Untouched:**
- `scripts/sync-ticktick.js` (still useful one-way mirror)
- TickTick portion of `docs/sync/local-tasks.json` and TickTick MCP config

---

## Steps (in order)

1. User answers D1 / D2 / D3.
2. Implement Part A step 1 (`--purge` mode in `sync-google.js`); dry-run; user confirms; `--apply --purge`.
3. Verify Google Tasks list is clean.
4. Archive `sync-google.js` + adjust `sync-all.js` per Part A 3–4.
5. Update `mapping.json`, `TODO.md`, `LOGBOOK.md` for retire.
6. Write `scripts/google-oauth.js`; run it with chosen scope; verify token swap.
7. Create `docs/sync/google-docs.json` with the History of Mistrust doc ID (user pastes ID into the file).
8. Write `scripts/google-docs.js`; manual test against the allow-listed doc:
   - `read` → confirm content matches what user sees in Docs UI.
    - `diff` against `#2026-05-28-history-of-mistrust-canonical-content` → confirm exit code and output.
   - `update --from=... ` (dry-run) → confirm planned change preview.
   - `update --from=... --apply` only after user explicit go-ahead, on a doc the user accepts may be overwritten.
9. Add docs section.
10. Final review pass.

---

## Reuse / Dependencies

- **No new npm deps.** Match existing pattern in `sync-google.js`: raw `node:https`, `node:fs`, `URLSearchParams`, manual `.env` loader.
- Reuse Google OAuth client + secret already in `.env`; only the scope and resulting refresh token change.
- Reuse the env-loader / `request()` / `apiGet` style from `sync-google.js` for `google-docs.js`.

---

## Verification

- **Auth:** `curl -s "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=$GOOGLE_ACCESS_TOKEN"` returns the chosen Docs scope and **no** `tasks` scope.
- **Read path:** `node scripts/google-docs.js read history-of-mistrust` returns non-empty text matching Docs UI (spot-check first 200 chars + final paragraph).
- **Allow-list enforcement:** running `read`/`update` with an alias not in `google-docs.json` exits 1 with a clear message. Covered by `tests/google-docs.test.js` using built-in `node:test` + `node:assert` (no framework, no new deps).
- **Purge filter test:** `tests/google-docs.test.js` includes a unit test that feeds a mixed array of remote tasks (some with `localId:` in notes, some without) into the purge filter function and asserts only the marked ones are selected for deletion.
- **Scope rejection:** test that `update` aborts when the allow-list entry's `permissions` array lacks `"write"`.
- **Write path (gated):** `update --apply` is run only with explicit user confirmation, on a doc whose allow-list entry has `permissions: ["read", "write"]`. Re-read after write to confirm round-trip.
- **No regressions:** TickTick sync (`node scripts/sync-ticktick.js --dry-run`) still works.
- **Repo cleanliness:** `git status` shows only the intended additions/moves; `.env` `GOOGLE_*` keys present and consistent.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| OAuth scope swap invalidates the existing refresh token mid-flight before purge runs | Run purge **first** while `tasks` scope is still valid; then swap scopes for Docs. Plan steps reflect this order. |
| `batchUpdate` whole-body replace corrupts a doc with embedded objects (images, tables) | MVP `update` only handles plain text. Refuse (or warn) if the fetched doc has non-text structural elements; require user opt-in via `--allow-rich-loss` flag. |
| Allow-list bypass via direct script edit | Acceptable: agent operates inside the repo; user owns the file. Document the rule explicitly in AGENTS.md. **Also gitignore `docs/sync/google-docs.json`** so doc IDs don't enter public history (mitigates the secondary risk of leaking which docs the user has granted access to). |
| Partial purge failure leaves tasks half-cleaned and OAuth scope half-swapped | Plan sequences purge fully before scope swap. `--purge` is idempotent (re-runnable). Verification gate (`tokeninfo`) blocks Part B until purge is confirmed. Last-resort fallback: manual deletion in Google Tasks UI. |
| Google Tasks list "Portfolio Website" contains user-added tasks the agent didn't sync | `--purge` only deletes tasks whose `notes` contain `localId:` — user-created tasks have no such marker and are skipped. |
| Token storage (`.env`) leak | Already gitignored; unchanged. Just call out scope rotation in LOGBOOK. |
| Scope creep — agent gradually adds doc IDs to allow-list autonomously | Hard rule in AGENTS.md: only the user edits `google-docs.json`. Plan reviewer should flag if any implementation step tries to write that file from a script. |

---

## Out of Scope

- TickTick sync changes (untouched).
- A Drive-wide search/list UX (deferred until D2 changes or user requests it).
- Real-time bidirectional Doc ↔ repo sync (this plan is on-demand read/edit, not autosync).
- Rich-content (images/tables/comments) editing in `update`.
- A Docs MCP server (could come later; out of scope for MVP).

---

## Review Owner

- **Plan review:** pro nano-agent (per shxdow-flow Claude route).
- **Final code review:** dedicated Codex agent if available, else pro nano-agent.
- **Main agent (Claude) owns correctness on diff before handoff.**


---

<a id="undefined"></a>
<a id="2026-06-04-phase-1-structural-fixes-shxdowloop"></a>
# Process Plan — Phase 1 Structural Fixes

**Date:** 2026-06-04
**Branch:** `shxdowloop/2026-06-04/phase-1-structural-fixes`
**Status:** Archived (completed)
**Goal:** Complete Phase 1 structural fixes before framework decision.

---

## Preflight Results

- Workspace: read-write
- Git branch: `master` → `shxdowloop/2026-06-04/phase-1-structural-fixes` (created)
- Remote: origin reachable
- Tools: npm ok, nano-agents available, shxdowTracker ok
- Provider pressure: Claude 30% / Codex 5% — native-first route

---

## Stage Outline

### Stage 1 — Unify Navigation & Footer
**Status:** Complete
**Files:** `projects/history-of-mistrust.html`, `projects/brand-avery-ember-day.html`, `projects/patriots-low-thirds.html`, `gallery/gallery.html`
**Goal:** Replace old `<header>` / `<footer>` markup with `.brand-nav` / `.brand-footer` patterns from `index.html`. Update all resume nav links to branded resume.
**Changes:** Replaced `<header>` with `<nav class="brand-nav">` and `<footer>` with `<footer class="brand-footer">` in all four sub-pages. Resume nav links updated to `AveryEmberDay_Resume_2026_Brand.html`.

### Stage 2 — Resume Links & Upwork Icon
**Status:** Complete
**Files:** `index.html`, all sub-pages from Stage 1
**Goal:** Point every Resume nav link to `resume/AveryEmberDay_Resume_2026_Brand.html`. Wire existing `images/icons/upworkicon.svg` into `index.html` Contact section.
**Changes:** `index.html` resume nav link updated. Upwork icon added to Contact section with `currentColor` fill. `upworkicon.svg` stripped of hardcoded `#000000` fill.

### Stage 3 — Clean Placeholders
**Status:** Complete
**Files:** `projects/patriots-low-thirds.html`, `gallery/gallery.html`, `index.html`
**Goal:** Replace Patriots storyboard/render placeholders with a clean WIP notice. Remove 9 empty Digital Art placeholder items from gallery. Add a visible WIP label to the Patriots project card in `index.html`.
**Changes:** Patriots storyboard grid + video frame replaced with `.wip-notice` blocks. 9 empty gallery placeholders removed. `.wip-badge` added to Patriots card in `index.html`; `.wip-badge` CSS added to `style.css`.

### Stage 4 — Verification
**Status:** Complete
**Goal:** Grep for leftover old resume paths, old `<header>` patterns, 404-risk links. Confirm no merge conflict markers remain.
**Results:** All checks pass — zero old resume links in HTML, zero `<header>` tags in sub-pages, zero gallery placeholders, zero conflict markers.

### Stage 5 — Documentation & Checkpoint
**Status:** Complete
**Goal:** Update `TODO.md`, `LOGBOOK.md`, process plan. Commit and push checkpoint.
**Commit:** TBD

---

## Verification Matrix

| Check | Command / Method |
|---|---|
| No old resume links | `grep -r "AveryEmberDay_Resume_2026\.html" --include="*.html" .` (should only appear in archive/docs or old resume files) |
| No old header pattern in sub-pages | `grep -r "<header>" --include="*.html" projects/ gallery/ resume/` (branded resume excluded) |
| No empty gallery placeholders | Check `gallery.html` Digital Art section has no `.placeholder-img` items |
| Patriots WIP present | Check `patriots-low-thirds.html` has clean WIP notice |
| Upwork icon wired | Check `index.html` Contact section references `images/icons/upworkicon.svg` |
| No conflict markers | `grep -r "<<<<<<<\|=======\|>>>>>>>" --include="*.html" --include="*.md" .` |

---

## Risks

- `history-of-mistrust.html` is large (879 lines); header/footer swap must not break embedded slideshow JS or lightbox CSS.
- `brand-avery-ember-day.html` inline CSS is heavy; footer swap must preserve styles.
- Patriots thumbnail still missing; can only add a text/label WIP indicator, not a real image.


---

<a id="consolidation-stubs-2026-07-12"></a>
# Consolidation Stubs — 2026-07-12

Plans below were removed from `docs/plans/` during the 2026-07-12 consolidation. Shipped work is captured in `LOGBOOK.md` and the current codebase; full plan text is preserved in git history. Recover any file with:

```powershell
git log --all --diff-filter=A -- <path>            # find the creating commit
git show <sha>:<path> > <path>                      # restore locally
```

| Removed file | Outcome |
|---|---|
| `docs/plans/2026-05-28-history-of-mistrust-canonical-content.md` | Shipped. Canonical slide content in `app/projects/history-of-mistrust/` and slide webps. |
| `docs/plans/2026-05-28-history-of-mistrust-carousel-slideshow-lightbox.md` | Shipped. Slideshow + lightbox in `app/projects/history-of-mistrust/SlideshowScript.tsx`. |
| `docs/plans/2026-05-28-history-of-mistrust-sync-nanoagent-plan.md` | Shipped. All targets synced 2026-05-28. |
| `docs/plans/2026-06-04-apply-color-changes-html.md` | Shipped. Palette applied across pages; tokens in `brand.css`. |
| `docs/plans/2026-06-04-color-contrast-alternates.md` | Shipped. See `docs/accessibility.md` for the final contrast contract. |
| `docs/plans/2026-06-04-hero-bubble-physics.md` | Superseded by 2026-06-30 bubble physics rework. |
| `docs/plans/2026-06-04-prelaunch-qa.md` | Shipped. QA gates checked in TODO history. |
| `docs/plans/2026-06-06-deploy-averyemberday-com.md` | Shipped. averyemberday.com deploys from `portfoliowebsite` via Netlify (LOGBOOK Entry 069). |
| `docs/plans/2026-06-06-resume-accessibility.md` | Shipped. Accessibility patterns applied to branded resume. |
| `docs/plans/2026-06-07-gallery-tag-filter-shxdowloop-dry-run.md` | Dry-run only. Actual gallery tag system tracked in TickTick mirror (still open). |
| `docs/plans/2026-06-07-move-contact-to-footer.md` | Moot. Nav trim on 2026-07-09 removed the Contact link entirely. |
| `docs/plans/2026-06-07-work-submenu.md` | Superseded / reversed by 2026-07-09 Tailwind conversion (submenu removed). |
| `docs/plans/2026-06-10-remove-self-portrait-series.md` | Shipped. Portrait/Hope/Mermaid items removed. |
| `docs/plans/2026-06-30-bubble-follow-up.md` | Shipped. Follow-up fixes applied to bubble physics. |
| `docs/plans/2026-06-30-bubble-physics-rework.md` | Shipped. DOM-based physics engine is the current `scripts/bubbles.js`. |
| `docs/plans/2026-07-01-fix-eperm-commands.md` | Resolved externally 2026-07-02 by Defender platform/signature update. See AGENTS.md. |
| `docs/plans/2026-07-01-website-architecture-remediation.md` | Shipped. Stages 0–5 committed on `shxdowloop/2026-07-01/website-architecture-remediation-2`. |
| `docs/plans/2026-07-01-website-architecture-remediation-shxdowloop.md` | Duplicate of the master plan (shxdowloop wrapper). |
| `docs/plans/2026-07-01-website-architecture-remediation-shxdowloop-dry-run.md` | Dry-run write-up of the same shipped work. |
| `docs/plans/2026-07-02-local-test-page-visibility.md` | Resolved. Root cause was `Script.js` logo-404 bug; fixed. |
| `docs/plans/2026-07-02-project-card-bubble-exclusion.md` | Shipped 2026-07-10. `.bubble-exclude` marker class in `DEFAULT_EXCLUSIONS`. |
| `docs/plans/2026-07-05-tailwind-restoration.md` | Shipped. Tailwind v4 pipeline restored. |
| `docs/plans/2026-07-09-tailwind-utility-conversion.md` | Shipped. All 5 pages authored in Tailwind utilities; nav trimmed to Work + About. |
| `docs/plans/2026-07-12-nextjs-migration.md` | Shipped. Framework decision + Next.js 15 static export live (LOGBOOK Entries 068–070). |
| `docs/plans/2026-07-12-nextjs-migration-execution.md` | Shipped. Execution complete, deploy verified. |
| `docs/color-contrast-preview.html` | One-shot palette-comparison artifact from 2026-06-04 contrast work. |

---

<a id="consolidation-stubs-2026-08-09"></a>
# Consolidation Stubs — 2026-08-09

Every plan in `docs/plans/` that had shipped as of 2026-08-09, removed at the user's direction
("check over open plan docs, archive all finished plans"). **One plan was left in place:**
`2026-08-01-copy-pass-and-gallery-descriptions.md`, whose Tracks A and C wait on the user's first
draft.

Shipped work is captured in `LOGBOOK.md` at the entries named below, and the load-bearing design
rules these plans established were promoted into [`../../AGENTS.md`](../../AGENTS.md) as they landed
(the hover contract, square-images-rounded-frames, the gallery expand geometry rules, the
picture-is-the-wall bubble rule, the Mistrust one-screen cap, and the shared content geometry). Those
sections, not these plans, are the current source of truth. Full plan text is preserved in git
history. Recover any file with:

```powershell
git log --all --diff-filter=A -- <path>            # find the creating commit
git show <sha>:<path> > <path>                      # restore locally
```

| Removed file | Outcome |
|---|---|
| `docs/plans/2026-08-06-prelaunch-audit-nanoagent-plan.md` | Complete. Four read-only nano-agent tracks plus a main-agent runtime probe against the production export: 40 page loads clean, focus-visible rule added, 82 `target="_blank"` links given `rel`, three copy defects and five stale doc claims fixed. Entry 123. Its three raised-not-decided items went to `TODO.md`; the role descriptor was settled in `AGENTS.md` on 2026-08-06. |
| `docs/plans/2026-08-05-gallery-expand-implementation.md` | Shipped. Gallery cards expand in place, art capped at one screen, View Transitions for the reflow. Entry 118; row sizing corrected in Entries 121–122, orthogonal reflow and the picture-sized art box in the 2026-08-07/08 work. |
| `docs/plans/2026-08-01-gallery-expand-motion-concept.md` | Shipped as the concept behind the above. Its §4 entrance stagger was deliberately not built; the reason is recorded in `TODO.md`. |
| `docs/plans/2026-08-01-mistrust-set-seam-dedupe-shxdowloop.md` | Shipped. Set strips take pixels from slides and geometry from the Figma export, closing a duplicated 19px seam. Entry 114, merged `ada0210`; fresh-context validation passed in Entry 125. |
| `docs/plans/2026-08-01-mistrust-asset-reexport.md` | Shipped. Figma re-export swapped into both asset trees. Entry 113, commit `06bd820`. |
| `docs/plans/2026-07-31-mistrust-slideshow-redesign.md` | Shipped. Swipeable stage, React lightbox, set mosaics. Entry 109, merged `152cf2f`. |
| `docs/plans/2026-07-31-mistrust-slideshow-shxdowloop.md` | Process wrapper for the redesign above. Same outcome, Entry 109. |
| `docs/plans/2026-07-28-contact-polish-width-unification.md` | Shipped. Contact polish plus one content width site-wide. Entry 107. |
| `docs/plans/2026-07-27-contact-unhide-mistrust-assets.md` | Shipped. Contact unhidden in nav and footer, Mistrust assets resynced, og card regenerated. Entry 106. |
| `docs/plans/2026-07-24-gallery-tag-system.md` | Shipped. `All / Digital / Traditional / Both` filter, tag data wired, vertical rail. Entries 099–101, commit `235f254`. **Decision 3 (visible tag pills) was superseded** in Entry 101 by sr-only tags plus a visible tool list. |
| `docs/plans/2026-07-24-bubble-visual-cleanup-shxdowloop-nanoagent-plan.md` | Shipped. Bubble-test flake addressed by frame-based sampling, visual-gate defects closed (`maxDiffPixels: 500` floor, server into `globalSetup`), gallery filter rail. Entries 099–101, commit `15fe32d`. A residual ~1-in-3 flake outlived this plan and is tracked in `TODO.md`. |
| `docs/plans/2026-07-24-bubble-hero-exclusions-shxdowloop.md` | Shipped. Hero logo and blob exclusions plus the repo's first motion-enabled tests. Entry 090. |
| `docs/plans/2026-07-24-projects-heading-padding-shxdowloop.md` | Shipped. Heading padding, with all 40 baselines adjudicated numerically. Entry 089. |
| `docs/plans/2026-07-24-docs-sync-todo-consolidation.md` | Complete. Plan-doc status reconciliation. Entry 088; re-run 2026-08-01 (Entry 112), 2026-08-03 (Entry 115), and superseded by this consolidation. |
| `docs/plans/2026-07-24-cross-page-css-consistency.md` | Shipped. Home and Gallery unified on `.brand-page-title` / `.brand-title-bar`; gallery cards moved onto brand tokens. Entry 097; follow-on Entry 098. |
| `docs/plans/2026-07-24-gallery-widening.md` | Shipped. 1400px centered container, 3 columns at `xl`. Entry 095. |
| `docs/plans/2026-07-23-nav-button-restyle.md` | Shipped. Square, no-chrome-at-rest nav group; scope grew to the logo-as-home-button and the project-tab restyle. Entries 082–087, merged `098f0b1`. |
| `docs/plans/2026-07-22-visual-baseline-gate-shxdowloop.md` | Shipped. Baselines converted into a real compare-based gate. Entry 081, `833d46a` → `6ddccd2`. **Its one carried-over item, running the gate in CI, lives in [`../visual-gate.md`](../visual-gate.md#open-item--running-the-gate-in-ci)** and in `TODO.md` under *Blocked on a prerequisite*. |
| `docs/plans/2026-07-15-projects-vertical-tabs.md` | Shipped. Sticky vertical Projects rail at `lg+`. Entries 079–080. |
| `docs/plans/2026-07-14-nav-restructure.md` | Shipped. Home / Projects / Gallery / Contact restructure. Entries 075–078. |
| `docs/plans/2026-07-14-nav-restructure-wrapup-shxdowloop.md` | Process wrapper for the restructure above. Same outcome, Entries 075–078. |
| `docs/plans/2026-07-13-srcset-variants.md` | Shipped. srcset and @2x variants. Entry 073, commit `f63671d`. |
| `docs/plans/2026-07-12-motion-load-perf.md` | Shipped. Time-to-motion and TTI reductions. Entry 072. |

