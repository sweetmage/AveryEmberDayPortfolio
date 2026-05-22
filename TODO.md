# TODO

## Current Task: Style h2 headings with brand blue

**Goal:** Color the Work, About Me, and Contact h2s and their underline borders with brand blue `#7eb8ff`.

**Approach:** Add CSS rules targeting `#work h2`, `#about h2`, `#contact h2` in `style.css` to override `color` and `border-bottom-color`.

**Steps:**
1. Add section-scoped h2 rules in `style.css` after the global `h2` block
2. Each rule sets `color: #7eb8ff` and `border-bottom-color: #7eb8ff`

---

## Previous: Layout updates per directions screenshot

**Goal:** Update index.html layout — thinner sticky nav below hero, edge-hugging nav content, remove duplicate pill badge.

### Approach

The hero section currently acts as a full-viewport landing. The nav is `position: fixed` at the very top, overlapping the hero. User wants:
1. Nav thinner and **below the hero** (so hero is unobstructed), sticky when scrolled past
2. Logo and nav controls at the very edges of the screen
3. Remove the `.brand-pill-ir` "Multi-Media Designer" badge (the hero subtitle already says this)

### Steps

1. **`index.html`**
   - Delete `<span class="brand-pill-ir">Multi-Media Designer</span>` from the hero content
   - Move the entire `<nav class="brand-nav">` block from before the hero to inside `<main>`, after `</section>` (the hero closing tag)

2. **`brand.css`**
   - `.brand-nav`: change from `position: fixed` to `position: sticky; top: 0`
   - Reduce nav height for thinner appearance
   - Override `.brand-container` padding inside `.brand-nav-inner` so content hugs screen edges (use `padding: 0` or minimal)

3. **`style.css`**
   - Adjust `#hero` top padding (no longer need the `120px` gutter for fixed nav; reduce to something smaller like `60px` or `80px`)

### Testing
- Open `index.html` in browser — hero should be full viewport with no overlapping nav
- Scroll down — nav should appear below hero and stick to top
- Nav items should be near the screen edges
- No "Multi-Media Designer" pill badge should appear in the hero
