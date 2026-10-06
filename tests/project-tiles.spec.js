import { test, expect } from '@playwright/test';

// Must match the `serve out` server started in tests/global-setup.js.
const BASE_URL = 'http://localhost:4322';

/**
 * Project tiles on /portfolio/ (Projects and Gallery merged, user, 2026-10-05).
 *
 * The ask was a tile that reads as "this opens another page" at rest: an outline
 * around the card, a description under the picture, and a link to the project's
 * own page instead of a tab. Plan review rejected `--brand-border-mid` for the
 * outline (about 1.3:1, effectively invisible), so the contrast is asserted, not
 * eyeballed.
 */

/** WCAG relative luminance of an `rgb(...)`/`rgba(...)` string composited on `bg`. */
function contrast(fg, bg) {
  const parse = (c) => c.match(/[\d.]+/g).map(Number);
  const [fr, fg2, fb, fa = 1] = parse(fg);
  const [br, bgG, bb] = parse(bg);
  const mix = (f, b) => f * fa + b * (1 - fa);
  const lum = ([r, g, b]) => {
    const ch = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
  };
  const L1 = lum([mix(fr, br), mix(fg2, bgG), mix(fb, bb)]);
  const L2 = lum([br, bgG, bb]);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

test.describe('portfolio project tiles', () => {
  for (const colorScheme of ['dark', 'light']) {
    test(`the outline is visible at rest (${colorScheme})`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });
      const { border, width, bg } = await page.evaluate(() => {
        const tile = document.querySelector('.project-tile');
        const cs = getComputedStyle(tile);
        const probe = document.createElement('div');
        probe.style.background = 'var(--brand-bg)';
        document.body.appendChild(probe);
        const bg = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return { border: cs.borderTopColor, width: cs.borderTopWidth, bg };
      });
      await context.close();
      expect(parseFloat(width)).toBeGreaterThanOrEqual(1);
      expect(contrast(border, bg), `outline ${border} on ${bg}`).toBeGreaterThanOrEqual(3);
    });
  }

  test('each tile is one link to its project page, with a description and a label', async ({ page }) => {
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });
    const tiles = page.locator('.project-tile');
    await expect(tiles).toHaveCount(2);
    expect(await tiles.evaluateAll((els) => els.map((e) => e.getAttribute('href')))).toEqual([
      '/portfolio/history-of-mistrust/',
      '/portfolio/brand/',
    ]);
    for (let i = 0; i < 2; i += 1) {
      const tile = tiles.nth(i);
      // One interactive element per card: nothing focusable nested in the link.
      await expect(tile.locator('a, button, [tabindex]')).toHaveCount(0);
      await expect(tile.locator('.project-tile-desc')).not.toBeEmpty();
      await expect(tile.locator('.project-tile-cta')).toContainText('View project');
      await expect(tile.locator('img')).toHaveAttribute('alt', /.+/);
    }
  });

  test('tiles sit side by side from 768px and stack below', async ({ page }) => {
    const tops = async (width) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });
      return page.locator('.project-tile').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    };
    const [a, b] = await tops(1024);
    expect(a).toBe(b);
    const [c, d] = await tops(390);
    expect(d).toBeGreaterThan(c);
  });

  test('old project hash links land on the project page', async ({ page }) => {
    await page.goto(`${BASE_URL}/portfolio/#history-of-mistrust`);
    await expect(page).toHaveURL(/\/portfolio\/history-of-mistrust\/$/);
    await page.goto(`${BASE_URL}/portfolio/#brand`);
    await expect(page).toHaveURL(/\/portfolio\/brand\/$/);
  });

  test('an old gallery filter link applies the filter and scrolls to the gallery', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/#filter=digital`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('button', { name: 'Digital' })).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
  });

  test('Portfolio stays the current nav item on a project page', async ({ page }) => {
    await page.goto(`${BASE_URL}/portfolio/brand/`, { waitUntil: 'networkidle' });
    await expect(page.locator('#brand-nav-links a[aria-current="page"]')).toHaveText('Portfolio');
  });
});
