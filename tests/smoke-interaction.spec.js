import { test, expect } from '@playwright/test';

test('index interactions smoke test', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // Scroll to trigger nav spy and return-to-top
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(200);

  // Click theme toggle (if present)
  const toggle = page.locator('#theme-toggle');
  if (await toggle.isVisible().catch(() => false)) {
    await toggle.click();
    await page.waitForTimeout(200);
    await toggle.click();
    await page.waitForTimeout(200);
  }

  // Click a submenu trigger (if present)
  const submenu = page.locator('.submenu-trigger').first();
  if (await submenu.isVisible().catch(() => false)) {
    await submenu.click();
    await page.waitForTimeout(200);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }

  expect(errors).toHaveLength(0);
});
