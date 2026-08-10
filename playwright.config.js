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
  // No `webServer` here on purpose. There used to be one serving the repo root on
  // :4321 for the legacy static site; its only consumer was
  // tests/smoke-interaction.spec.js, which was deleted 2026-08-09 (Entry 128)
  // along with this block. The app under test is the Next.js static export, and
  // that server is started on :4322 inside globalSetup AFTER the build — because
  // Playwright starts `webServer` entries BEFORE globalSetup runs, and the build
  // deletes and recreates `out/` out from under anything already serving it.
  // If you add a webServer here, it will race the build the same way.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // nav-safari.spec.js asserts a WebKit-specific layout bug that Chromium
      // cannot reproduce. Running it here would pass unconditionally and give
      // false confidence — which is how the off-screen theme toggle shipped.
      testIgnore: /nav-safari\.spec\.js/,
    },
    {
      // Mobile Safari surface. Deliberately narrow: only the specs that guard
      // WebKit-only rendering differences run here, so the suite does not double
      // in length. Needs `npx playwright install webkit` once per machine.
      name: 'webkit-mobile',
      testMatch: /nav-safari\.spec\.js/,
      use: { ...devices['iPhone 13'] },
    },
  ],
});
