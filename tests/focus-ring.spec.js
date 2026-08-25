import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4322';

/**
 * The site-wide contract is a 2px `--brand-accent` ring on every interactive
 * element. Four controls sit outside the `nav a` / `.brand-btn` selectors and
 * are grouped into one declaration block in `brand.css`: the footer nav links,
 * the footer icon links, `#return-to-top`, and the skip link.
 *
 * Three of those were reported broken on 2026-08-06 (Entry 123) and stayed on
 * the board until 2026-08-25 (Entry 134), when the report turned out to be a
 * MEASUREMENT ARTIFACT rather than a defect. Tailwind v4's `transition-colors`
 * lists `outline-color` among the properties it transitions, so reading
 * `getComputedStyle().outlineColor` at the moment focus lands returns the
 * transition's START value — the initial `currentColor`, which is the footer's
 * grey and the skip link's white. The ring was always resolving to the accent
 * 150ms later. That is why an `!important` rule with the identical selector
 * changed nothing: nothing was outranking the declaration.
 *
 * These tests are written to fail the way the bug was reported. They read the
 * ring at focus time with no settle delay, so a transition creeping back onto
 * `outline-color` goes red here instead of costing another audit.
 */

const RING_CONTROLS = [
  { name: 'skip link', selector: '.skip-link' },
  { name: 'footer icon link', selector: '.icon-link' },
  { name: 'return to top', selector: '#return-to-top' },
  { name: 'footer nav link', selector: '.brand-footer-links a' },
];

/**
 * Tab until `selector` holds focus. Real key presses, not `el.focus()` —
 * programmatic focus does not reliably engage `:focus-visible`.
 */
async function tabTo(page, selector) {
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press('Tab');
    const onTarget = await page.evaluate(
      (sel) => !!document.activeElement?.matches(sel),
      selector,
    );
    if (onTarget) return true;
  }
  return false;
}

/** `#CC44FF` -> `rgb(204, 68, 255)`, which is the shape computed styles report. */
function hexToRgb(hex) {
  const clean = hex.trim().replace('#', '');
  const n = parseInt(clean, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

test.describe('focus ring', () => {
  for (const { name, selector } of RING_CONTROLS) {
    test(`${name} paints the accent ring at the instant focus lands`, async ({ page }) => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      // #return-to-top is `hidden` until the page is scrolled, so it is not in
      // the tab order at scroll 0.
      if (selector === '#return-to-top') {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await expect(page.locator('#return-to-top')).toBeVisible();
      }

      expect(await tabTo(page, selector), `never reached ${selector} by Tab`).toBe(true);

      const measured = await page.evaluate(() => {
        const el = document.activeElement;
        const cs = getComputedStyle(el);
        return {
          focusVisible: el.matches(':focus-visible'),
          width: cs.outlineWidth,
          style: cs.outlineStyle,
          color: cs.outlineColor,
          transitions: cs.transitionProperty,
          accent: getComputedStyle(document.documentElement)
            .getPropertyValue('--brand-accent'),
        };
      });

      expect(measured.focusVisible).toBe(true);
      expect(measured.width).toBe('2px');
      expect(measured.style).toBe('solid');
      expect(measured.color).toBe(hexToRgb(measured.accent));
    });

    test(`${name} does not transition its outline colour`, async ({ page }) => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      const transitions = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el).transitionProperty : null;
      }, selector);

      expect(transitions, `${selector} is not in the DOM`).not.toBeNull();
      // `all` would sweep outline-color back in, which is the original trap.
      expect(transitions).not.toMatch(/\ball\b/);
      expect(transitions).not.toMatch(/\boutline-color\b/);
    });
  }
});
