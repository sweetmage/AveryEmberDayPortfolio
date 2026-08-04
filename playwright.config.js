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
  webServer: {
    // Legacy static site only. The Next.js export server (port 4322) is
    // started inside globalSetup AFTER the build completes, because
    // Playwright 1.61.1 starts webServers before globalSetup runs. When
    // the build then deletes and recreates `out/`, the already-running
    // `serve` process loses its directory and returns ECONNRESET.
    //
    // Deliberately NOT on 3000: `next dev` defaults to that port, and with
    // reuseExistingServer the suite would silently adopt a running dev server.
    command: 'npx serve . -l 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
