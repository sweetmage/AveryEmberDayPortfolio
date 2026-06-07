const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  // Test 1: click Work → open, click Work again → scroll to #work
  await page.goto('http://localhost:8080/index.html');
  await page.locator('text=Work').first().click();
  await page.waitForTimeout(300);
  const open1 = await page.evaluate(() => document.querySelector('.has-submenu').classList.contains('open'));
  console.log('Submenu open after first click:', open1);
  await page.locator('text=Work').first().click();
  await page.waitForTimeout(300);
  const open2 = await page.evaluate(() => document.querySelector('.has-submenu').classList.contains('open'));
  const hash = await page.evaluate(() => location.hash);
  console.log('Submenu open after second click:', open2, 'Hash:', hash);

  // Test 2: open submenu, press Escape → close
  await page.locator('text=Work').first().click();
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const open3 = await page.evaluate(() => document.querySelector('.has-submenu').classList.contains('open'));
  console.log('Submenu open after Escape:', open3);

  // Test 3: sub-page submenu opens
  await page.goto('http://localhost:8080/projects/history-of-mistrust.html');
  await page.locator('text=Work').first().click();
  await page.waitForTimeout(300);
  const open4 = await page.evaluate(() => document.querySelector('.has-submenu').classList.contains('open'));
  console.log('Submenu open on sub-page:', open4);

  await browser.close();
})();
