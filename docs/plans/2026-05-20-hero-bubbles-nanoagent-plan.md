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
