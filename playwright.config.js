import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  globalSetup: './tests/global-setup.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
  webServer: [
    {
      // Legacy static site. Deliberately NOT on 3000: `next dev` defaults to
      // that port, and with reuseExistingServer the suite would silently adopt
      // a running dev server and test the Next app while believing it was
      // testing the legacy site.
      command: 'npx serve . -l 4321',
      url: 'http://localhost:4321',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      // The build lives in globalSetup, NOT here: reuseExistingServer skips
      // this command entirely when the port is already held, which silently
      // served a stale out/ and graded the wrong artifact.
      command: 'npx serve out -l 3001',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
