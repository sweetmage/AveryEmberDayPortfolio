# Plan: Move Contact Section into Footer (2026-06-07)

## Goal
Move the entire contact content — Email, LinkedIn, and GitHub icon links plus the email address — out of the standalone `#contact` section and into the `.brand-footer` on every page.

## Files to touch
- `brand.css` — replace `.brand-footer-contact` text-only styles with icon-link-compatible styles; add `.brand-footer-icons` wrapper
- `index.html` — remove the `#contact` `<section>`; update the `<footer>` to include icon links + email; remove or redirect the Contact nav link
- `gallery/gallery.html` — update footer to include icon links + email
- `projects/brand-avery-ember-day.html` — update footer to include icon links + email
- `projects/history-of-mistrust.html` — update footer to include icon links + email
- `projects/patriots-low-thirds.html` — update footer to include icon links + email

## Approach
1. **brand.css**
   - Replace the existing `.brand-footer-contact` flat-text row with a vertically-stacked layout:
     - `.brand-footer-icons` — flex row of `.icon-link` circles (same markup/classes as the current contact section so `.icon` and `.icon-link` styles from `style.css` continue to work)
     - `.brand-footer-email` — plain text email below the icons, using muted color
   - Keep existing `.brand-footer-inner` unchanged.
   - Add a `.brand-footer-connect` wrapper for the new contact block inside the footer container, centered, with top margin.

2. **HTML pages**
   - On `index.html`: delete the whole `<section id="contact">` block (lines 136–162). In the nav, either remove the "Contact" link or keep it as an in-page anchor to the footer. Decision: keep it as `#contact` anchor to the footer (add `id="contact"` to the footer or a wrapper). Since footer already exists, add `id="contact"` to the `<footer>` tag.
   - On all sub-pages: no `#contact` section exists, so only the footer changes.
   - In every footer, replace the current `.brand-footer-contact` text row with:
     ```html
     <div class="brand-footer-connect">
       <div class="brand-footer-icons">
         <a href="mailto:averyemberday@gmail.com" class="icon-link" aria-label="Email">…svg…</a>
         <a href="https://www.linkedin.com/in/averyemberday/" target="_blank" class="icon-link" aria-label="LinkedIn">…svg…</a>
         <a href="https://github.com/sweetmage" target="_blank" class="icon-link" aria-label="GitHub">…svg…</a>
       </div>
       <p class="brand-footer-email">averyemberday@gmail.com</p>
     </div>
     ```
   - Add `id="contact"` to every `<footer class="brand-footer">` so existing nav links still work.

3. **Verification**
   - Open `index.html` in a browser (or at least run a link-check script if available) to confirm:
     - No broken `#contact` anchor
     - Icons render in footer
     - Email visible below icons
   - Check sub-page footers have identical contact block.

## Risks
- `style.css` `.icon-link` has a fixed 52px circle size and `background: var(--brand-surface-2)`. In the dark footer background (`var(--brand-surface)`), the circle may need subtle adjustment. Mitigation: the footer background and `--brand-surface-2` are close enough in the token system that it should look fine; if not, override `.brand-footer-icons .icon-link` background to `transparent` or `var(--brand-surface-2)`.
- Removing the `#contact` section from `index.html` drops a heading and vertical space. The page will be shorter, which is intended.
- Existing `.brand-footer-contact` CSS and markup from the previous edit must be fully overwritten.

## Reuse
- SVG paths and `aria-label`s are copied verbatim from the current contact section.
- `.icon`, `.icon-link`, and `.icon-link:hover` styles in `style.css` are reused unchanged.
