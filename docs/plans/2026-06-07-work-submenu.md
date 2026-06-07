# Plan: Work Navigation Submenu (2026-06-07)

## Goal
Add a click-triggered submenu under the **Work** nav item on all pages. The submenu links to each project/section within Work: Brand Identity, A History of Mistrust, and Art Gallery.

## Approach
Keep the site vanilla (HTML/CSS/JS). Use a small CSS dropdown triggered by an `.open` class on the parent `<li>`, toggled via JavaScript. The Work link (`href="#work"`) acts as the trigger: first click opens the submenu (and prevents navigation), second click follows the link as normal.

## Files to touch
- `index.html` — nav markup (Work item becomes `.has-submenu`)
- `projects/brand-avery-ember-day.html` — nav markup (relative paths: `brand-avery-ember-day.html`, `history-of-mistrust.html`, `../gallery/gallery.html`)
- `projects/history-of-mistrust.html` — nav markup
- `projects/patriots-low-thirds.html` — nav markup
- `gallery/gallery.html` — nav markup (relative paths: `../projects/brand-avery-ember-day.html`, `../projects/history-of-mistrust.html`, `gallery.html`)
- `brand.css` — submenu styles (positioning, transitions, backdrop, tokens)
- `style.css` — any needed overrides (focus-visible, responsive)
- `Script.js` — submenu toggle logic + smooth-scroll exemption for `.submenu-trigger`

## Submenu items
1. **Brand Identity** → `projects/brand-avery-ember-day.html`
2. **A History of Mistrust** → `projects/history-of-mistrust.html`
3. **Art Gallery** → `gallery/gallery.html`

(Motion Graphics card is hidden, so it is omitted from the submenu.)

## Steps
1. **Markup** — Convert each page's Work `<li>` to:
   ```html
   <li class="has-submenu">
     <a href="#work" class="submenu-trigger">Work</a>
     <ul class="submenu">
       <li><a href="...">Brand Identity</a></li>
       <li><a href="...">A History of Mistrust</a></li>
       <li><a href="...">Art Gallery</a></li>
     </ul>
   </li>
   ```
2. **CSS** — Add to `brand.css`:
   - `.has-submenu { position: relative; }`
   - `.submenu` absolutely positioned below link, hidden by default (`opacity`, `visibility`, `translateY`), visible on `.has-submenu.open` and `:focus-within`
   - Submenu background: `var(--brand-surface-1)` with `backdrop-filter: blur(12px)` and border matching nav gradient
   - Submenu links: brand text color, hover state with `var(--brand-surface-2)`
   - Transition for smooth open/close
   - z-index stacking above page content
3. **JS** — Add to `Script.js`:
   - Click listener on `.submenu-trigger`:
     - If parent `.has-submenu` does NOT have `.open`, add `.open` and prevent default (don't scroll).
     - If it DOES have `.open`, remove `.open` and allow default (smooth scroll to #work).
   - Close open submenus on outside click (`document` listener).
   - Close on `Escape` key.
   - Ensure smooth-scroll handler skips `.submenu-trigger` when submenu is closed (or simply rely on the new listener running first if we attach it before the smooth-scroll block; easier: modify smooth-scroll block to `return` if anchor has `.submenu-trigger` and its parent lacks `.open`).
4. **Responsive** — Submenu should stay within viewport (`left: 0; min-width: 200px;`). On very small screens it may need `right: 0` auto-alignment; test and adjust.

## Verification
- Open `index.html` in browser, click Work → submenu appears.
- Click submenu items → navigate to correct pages.
- Click Work again (while open) → smooth scroll to `#work` section and submenu closes.
- Click outside submenu → submenu closes.
- Press Escape → submenu closes.
- Tab through nav with keyboard → submenu accessible via focus.
- Check all 5 pages have consistent behavior and correct relative links.
- Verify no visual regressions on mobile nav (below 768px the `.brand-nav-links` are hidden, so submenu is also hidden there; no action needed for mobile hamburger since there isn't one).

## Risks
- The existing smooth-scroll script prevents default on all `a[href^="#"]`. We must coordinate with the new toggle so Work's first click opens the menu instead of scrolling.
- On sub-pages, relative paths differ; must verify each page's submenu hrefs.
- Nav links are hidden on mobile (`<768px`). No mobile hamburger exists, so the submenu will also be hidden there — acceptable since there is no mobile nav UI to begin with.
