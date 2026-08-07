import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4322';

/**
 * iOS Safari zooms the page when a form control with a computed font-size under
 * 16px receives focus, and it does not zoom back out. The nav is `position:
 * sticky`, so after that zoom the layout viewport is wider than the visible one
 * and the theme toggle at the far right sits off screen until the user pinches
 * out by hand.
 *
 * That is how it was reported on 2026-08-07 — "on mobile, the light and dark
 * menu is off screen" — while testing the contact form on a phone. The contact
 * fields were 14px.
 *
 * Chromium cannot reproduce the zoom itself, so the test asserts the CONDITION
 * that causes it, which is the durable invariant anyway: no focusable control
 * under 16px on a touch device. Emulated with `hasTouch`, which is what makes
 * `pointer: coarse` match — the same signal the CSS keys off.
 */
test.describe('mobile form zoom', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: false });

  test('the pointer-coarse media query actually matches under touch emulation', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact/`, { waitUntil: 'networkidle' });
    // If this ever stops matching, every assertion below passes vacuously.
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
  });

  test('no focusable form control is under 16px on touch', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact/`, { waitUntil: 'networkidle' });

    const tooSmall = await page.evaluate(() =>
      [...document.querySelectorAll('input, textarea, select')]
        .filter((el) => {
          // Hidden and honeypot fields cannot take focus, so cannot trigger the zoom.
          if (el.type === 'hidden') return false;
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          return el.offsetParent !== null || style.position === 'fixed';
        })
        .map((el) => ({ name: el.name || el.id, size: parseFloat(getComputedStyle(el).fontSize) }))
        .filter((f) => f.size < 16));

    expect(tooSmall, `these would zoom iOS on focus: ${JSON.stringify(tooSmall)}`).toEqual([]);
  });

  test('the theme toggle sits fully inside the viewport', async ({ page }) => {
    // The symptom, guarded directly. The nav cannot shrink — every label is
    // `white-space: nowrap` and `.brand-nav-actions` is pushed right by
    // `margin-left: auto` — so the toggle is what leaves the screen first if the
    // bar ever runs out of room.
    for (const width of [320, 360, 390, 414, 480, 640, 768]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'domcontentloaded' });

      const box = await page.locator('#theme-toggle').evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right };
      });

      expect(box.left, `toggle clipped at ${width}px`).toBeGreaterThanOrEqual(0);
      expect(box.right, `toggle off screen at ${width}px`).toBeLessThanOrEqual(width + 1);
    }
  });
});
