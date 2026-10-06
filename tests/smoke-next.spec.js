import { test, expect } from '@playwright/test';

// Must match the `serve out` webServer port in playwright.config.js.
// Deliberately not 3000/3001 -- those are where `next dev` lands.
const BASE_URL = 'http://localhost:4322';

test.describe('Next.js app smoke', () => {
  const errors = [];
  const consoleLogs = [];

  test.beforeEach(async ({ page }) => {
    errors.length = 0;
    consoleLogs.length = 0;
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleLogs.push(msg.text());
    });
  });

  test.afterEach(async () => {
    expect(errors).toEqual([]);
    expect(consoleLogs).toEqual([]);
  });

  test('home page loads without errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Avery Ember Day');
  });

  test('portfolio page — project tiles open their pages and come back', async ({ page }) => {
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });
    const tiles = page.locator('.project-tile');
    await expect(tiles).toHaveCount(2);

    // Brand: tile -> its own page -> back link -> portfolio.
    await tiles.nth(1).click();
    await expect(page).toHaveURL(/\/portfolio\/brand\/$/);
    await expect(page.locator('h1')).toHaveText('Avery Ember Day Brand');
    await page.locator('.project-back-link').click();
    await expect(page).toHaveURL(/\/portfolio\/$/);

    // Mistrust: the viewer renders and the React-owned lightbox stays unmounted
    // until a slide is opened. Deeper coverage: tests/mistrust-slideshow.spec.js.
    await page.locator('.project-tile').first().click();
    await expect(page).toHaveURL(/\/portfolio\/history-of-mistrust\/$/);
    await expect(page.locator('.mistrust-stage')).toBeVisible();
    await expect(page.locator('.lightbox-overlay')).toHaveCount(0);
  });

  test('portfolio page shows the gallery without errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Portfolio');
    await expect(page.locator('#portfolio-gallery')).toHaveText('Gallery');
    await expect(page.locator('.gallery-item').first()).toBeVisible();
  });

  test('contact page loads with form', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact/`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Contact');
    await expect(page.locator('form[name="contact"]')).toBeVisible();
    await expect(page.locator('input[name="form-name"]')).toHaveValue('contact');
  });
});
