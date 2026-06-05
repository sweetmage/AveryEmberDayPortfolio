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
