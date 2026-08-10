import { test, expect } from '@playwright/test';

// Must match the `serve out` server started in tests/global-setup.js.
const BASE_URL = 'http://localhost:4322';

/**
 * Safari-only nav regression guard.
 *
 * The theme toggle rendered completely off screen on every iPhone and iPad while
 * Chromium looked perfect (reported 2026-08-09). Cause: `#theme-toggle` sized its
 * width from `aspect-ratio: 1` against a percentage height, and WebKit does not
 * fold an aspect-ratio-derived width into a flex item's intrinsic contribution.
 * `.brand-nav-actions` therefore measured 0px wide, its `margin-left: auto` shoved
 * that zero-width box flush against the right edge, and the button painted past
 * the viewport.
 *
 * This file runs under the `webkit-mobile` project only (see playwright.config.js);
 * the chromium project ignores it, because chromium cannot reproduce the bug and a
 * green chromium run is exactly what hid it for as long as it did.
 */

const VIEWPORTS = [
  { label: 'iPhone 13 portrait', width: 390, height: 844 },
  { label: 'iPhone 13 landscape', width: 844, height: 390 },
  { label: 'iPhone SE portrait', width: 320, height: 568 },
  { label: 'iPad portrait', width: 768, height: 1024 },
  { label: 'iPad Pro 11 landscape', width: 1194, height: 834 },
];

const PAGES = ['/', '/projects/', '/gallery/', '/contact/'];

test.describe('nav fits the viewport in WebKit', () => {
  for (const vp of VIEWPORTS) {
    for (const path of PAGES) {
      test(`theme toggle is fully on screen — ${vp.label} ${path}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });

        const metrics = await page.evaluate(() => {
          const toggle = document.querySelector('#theme-toggle');
          const box = toggle.getBoundingClientRect();
          return {
            viewportWidth: document.documentElement.clientWidth,
            documentScrollWidth: document.documentElement.scrollWidth,
            toggleLeft: box.left,
            toggleRight: box.right,
            toggleWidth: box.width,
            actionsWidth: document.querySelector('.brand-nav-actions').getBoundingClientRect().width,
          };
        });

        // The button must have real width of its own. A 0px-wide actions column is
        // the exact signature of the WebKit bug, so assert on it directly rather
        // than only on the symptom.
        expect(metrics.actionsWidth).toBeGreaterThan(0);
        expect(metrics.toggleWidth).toBeGreaterThanOrEqual(44);

        // Fully inside the viewport, both edges.
        expect(metrics.toggleLeft).toBeGreaterThanOrEqual(0);
        expect(metrics.toggleRight).toBeLessThanOrEqual(metrics.viewportWidth);

        // And it must not be dragging the page into horizontal scroll to get there.
        expect(metrics.documentScrollWidth).toBeLessThanOrEqual(metrics.viewportWidth);
      });
    }
  }

  test('theme toggle still toggles the theme', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await page.locator('#theme-toggle').click();
    const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));

    expect(after).not.toBe(before);
    expect(['light', 'dark']).toContain(after);
  });
});
