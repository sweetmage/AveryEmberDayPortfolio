# Plan — Project Card Bubble Exclusion

**Date:** 2026-07-02  
**Status:** Ready for implementation  
**Agent:** Kilo  
**Scope:** `index.html`, `scripts/bubbles.js`  

---

## Goal

Ensure project cards visually exclude physics bubbles, using the same declarative mechanism that `.textbox.about-box` currently relies on. The current hardcoded ID-section selectors in `bubbles.js` are fragile and implicit; this plan replaces them with a shared semantic class so any element can opt into bubble exclusion.

---

## Current State

In `scripts/bubbles.js`:

```js
const HOME_EXCLUSIONS = [
  '#hero .hero-name',
  '#hero .hero-sub',
  '#work h2',
  '#work .project-card',
  '#about h2',
  '#about .about-box',
  '.brand-footer-inner',
  '.brand-footer-connect'
];
```

`#work .project-card` already prevents bubbles from entering the card bounds, but the mechanism is hidden in JS and tied to the `#work` section ID. If the grid moves to a different section, the exclusion breaks. `.about-box` works the same way (`#about .about-box`), but the user wants the two to share a visible, portable contract.

---

## Approach

Introduce a single semantic class — `.bubble-exclude` — that the physics engine always treats as an exclusion zone. Apply it to both `.project-card` and `.about-box` in `index.html`. Remove the now-redundant `HOME_EXCLUSIONS` entries for those elements, leaving `HOME_EXCLUSIONS` only for hero-specific items that lack a better class.

---

## Files & Changes

### 1. `index.html` — Add marker class

**Lines 89, 97, 115** — Append `.bubble-exclude` to each visible project card:

```html
<a href="projects/brand-avery-ember-day.html" class="project-card brand-card-bubble bubble-exclude">
```

**Line 131** — Append `.bubble-exclude` to the about box:

```html
<div class="textbox about-box bubble-exclude">
```

(The hidden Patriots card on line 105 has `display: none`; it can be left alone since `getBoundingClientRect()` returns zero and produces no zone.)

### 2. `scripts/bubbles.js` — Update selector lists

**Replace** `DEFAULT_EXCLUSIONS` and `HOME_EXCLUSIONS` with:

```js
const DEFAULT_EXCLUSIONS = [
  '.brand-nav',
  '.brand-footer',
  '#return-to-top',
  '.bubble-exclude'
];
const HOME_EXCLUSIONS = [
  '#hero .hero-name',
  '#hero .hero-sub',
  '#work h2',
  '#about h2',
  '.brand-footer-inner',
  '.brand-footer-connect'
];
```

**Rationale:** `.bubble-exclude` is now global (works on any page). The removed lines (`#work .project-card`, `#about .about-box`) are covered by the class.

### 3. Sub-page audit (no edits expected)

Search all `*.html` files for `.brand-card-bubble` or `.project-card`. If any appear outside `index.html`, add `.bubble-exclude` there too. Current audit shows none on sub-pages.

### 4. CSS build

No CSS rule is needed for `.bubble-exclude`; it is a pure semantic marker. Still, rebuild `style.css` to keep the generated file in sync:

```bash
npm run build:css
```

---

## Verification

1. **Static check** — `grep` confirms `.bubble-exclude` is present on all three visible project cards and the about box.
2. **JS selector check** — `grep` confirms `.bubble-exclude` is in `DEFAULT_EXCLUSIONS`.
3. **Runtime check** — open `index.html`, scroll to Work and About sections, observe that no physics bubbles settle on top of the cards or the about box. Mouse-repulsion should also steer bubbles away from these areas.
4. **Resize check** — resize the viewport; bubbles should continue to avoid the recalculated card rects.

---

## Risks

| Risk | Mitigation |
|---|---|
| Hidden card (`display: none`) with `.bubble-exclude` might create a zero-size exclusion zone that traps bubbles | The hidden Patriots card is left without the class; if it were added, `getBoundingClientRect()` returns all zeros, which `resolveZoneCollisions` ignores because `dist > 0.1` would fail at the origin — still safe, but leaving it off is cleaner. |
| Class name collision | `.bubble-exclude` is unique to this repo and well-namespaced. |
| Sub-page content later adds cards without the class | Document the convention in `AGENTS.md` (or this plan) so future agents know to add `.bubble-exclude` to any element that must stay bubble-free. |

---

## Parallel Tracks

This is a single-track change (two files). No parallel work is possible because both edits are coupled to the same class name.

---

## Out of Scope

- Changing bubble physics constants (speed, repulsion, squish)
- Adding exclusion zones to sub-pages that don't currently need them
- Renaming `.brand-card-bubble` (the class is stylistic, not functional)
- Commit / push (requires explicit user direction per branch policy)

---

## Next Step After Implementation

Update `AGENTS.md` or `docs/NOTES.md` with the `.bubble-exclude` convention so future agents apply it consistently.
