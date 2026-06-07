const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:8080/index.html');
  await page.locator('text=Work').first().click();
  await page.waitForTimeout(300);
  await Promise.all([
    page.waitForNavigation(),
    page.locator('.submenu a:text("Brand Identity")').click()
  ]);
  console.log('URL:', page.url());
  await browser.close();
})();
