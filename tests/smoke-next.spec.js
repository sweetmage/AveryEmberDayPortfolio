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

  test('projects page — tab switch and lightbox', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects/`, { waitUntil: 'networkidle' });
    // Scope to the page-level tablist: the Mistrust panel now contains a second
    // tablist (the Set 1/2/3 switcher), so a bare aria-selected query matches two.
    const projectTabs = page.getByRole('tablist', { name: 'Projects' });
    await expect(projectTabs.locator('button[aria-selected="true"]')).toContainText('Brand');

    // Switch to mistrust tab
    await page.click('button[aria-controls="panel-history-of-mistrust"]');
    await expect(projectTabs.locator('button[aria-selected="true"]')).toContainText(
      'History of Mistrust'
    );

    // The lightbox is React-owned as of 2026-07-31: absent from the DOM until a
    // slide is opened, unmounted again on tab switch. Deeper coverage lives in
    // tests/mistrust-slideshow.spec.js.
    await expect(page.locator('.lightbox-overlay')).toHaveCount(0);
    await expect(page.locator('.mistrust-stage')).toBeVisible();

    // Switch back to brand tab
    await page.click('button[aria-controls="panel-brand"]');
    await expect(projectTabs.locator('button[aria-selected="true"]')).toContainText('Brand');
  });

  test('gallery page loads without errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Gallery');
  });

  test('contact page loads with form', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact/`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Contact');
    await expect(page.locator('form[name="contact"]')).toBeVisible();
    await expect(page.locator('input[name="form-name"]')).toHaveValue('contact');
  });
});
