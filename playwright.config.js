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
  // The bubble spec runs the physics engine with motion enabled, and the engine
  // integrates a fixed velocity PER FRAME. Anything else holding a worker starves rAF,
  // so bubbles get fewer frames to be pushed out of their exclusion zones and the
  // assertion reads exactly like a real regression. In-file `mode: 'serial'` closed the
  // within-file case on 2026-07-28 but not the cross-file one: a full run on 2026-08-03
  // failed "Projects tabs @ 768px" at 195px² overlap, and the same file passed 10/10
  // standalone minutes later. A dedicated project that runs AFTER everything else is the
  // only arrangement where nothing else can hold a worker.
  //
  // Order matters: `bubbles` depends on `chromium`, not the reverse. A dependency
  // failure skips its dependents, and the visual gate is the deploy-blocking signal —
  // it must never be skipped because a physics test wobbled.
  projects: [
    {
      name: 'chromium',
      testIgnore: /bubbles-exclusion\.spec\.js/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'bubbles',
      testMatch: /bubbles-exclusion\.spec\.js/,
      dependencies: ['chromium'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
