import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

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
    await expect(page.locator('button[aria-selected="true"]')).toContainText('Brand');

    // Switch to mistrust tab
    await page.click('button[aria-controls="panel-history-of-mistrust"]');
    await expect(page.locator('button[aria-selected="true"]')).toContainText('History of Mistrust');

    // Lightbox should be hidden initially
    const lightbox = page.locator('#lightbox');
    await expect(lightbox).toHaveAttribute('hidden', '');

    // Switch back to brand tab
    await page.click('button[aria-controls="panel-brand"]');
    await expect(page.locator('button[aria-selected="true"]')).toContainText('Brand');
  });

  test('gallery page loads without errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Art Gallery');
  });

  test('contact page loads with form', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact/`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Contact');
    await expect(page.locator('form[name="contact"]')).toBeVisible();
    await expect(page.locator('input[name="form-name"]')).toHaveValue('contact');
  });
});
