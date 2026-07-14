import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3001';

const PAGES = [
  { name: 'index', url: '/' },
  { name: 'projects', url: '/projects/' },
  { name: 'projects-mistrust', url: '/projects/#history-of-mistrust' },
  { name: 'gallery', url: '/gallery/' },
  { name: 'contact', url: '/contact/' },
];

const BREAKPOINTS = [360, 768, 1024, 1440];
const THEMES = ['light', 'dark'];

const BASELINE_DIR = path.join(process.cwd(), 'tests', 'baselines');

if (!fs.existsSync(BASELINE_DIR)) {
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
}

for (const page of PAGES) {
  for (const width of BREAKPOINTS) {
    for (const theme of THEMES) {
      test.describe(`${page.name} @ ${width}px — ${theme}`, () => {
        test.beforeEach(async ({ context }) => {
          await context.addInitScript((t) => {
            localStorage.setItem('theme', t);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const resolved = t || (prefersDark ? 'dark' : 'light');
            document.documentElement.setAttribute('data-theme', resolved);
          }, theme);
        });

        test('visual baseline', async ({ page: p }) => {
          await p.setViewportSize({ width, height: 900 });
          await p.goto(`${BASE_URL}${page.url}`, { waitUntil: 'networkidle' });

          // Wait for bubble physics and fonts to settle
          await p.waitForTimeout(1500);

          // For mistrust tab deep-link, ensure the tab is active before capture
          if (page.name === 'projects-mistrust') {
            const mistrustTab = p.locator('button[aria-controls="panel-history-of-mistrust"]');
            if (await mistrustTab.count()) {
              await mistrustTab.click();
              await p.waitForTimeout(300);
            }
          }

          // loading="lazy" images below the viewport never fetch during a
          // fullPage capture, so force them eager and wait for completion.
          // Only in-layout images count (hidden lightbox imgs never load);
          // the wait is bounded so a stalled request can't hang the test.
          await p.evaluate(async () => {
            const inLayout = [...document.images].filter(
              (img) => img.src && img.getClientRects().length > 0
            );
            for (const img of inLayout) img.loading = 'eager';
            await Promise.race([
              Promise.all(
                inLayout.map((img) =>
                  img.complete ? null : new Promise((r) => (img.onload = img.onerror = r))
                )
              ),
              new Promise((r) => setTimeout(r, 8000)),
            ]);
            // decoding="async" images outside the viewport stay undecoded
            // during captureBeyondViewport and screenshot as blanks — force
            // the decode explicitly.
            await Promise.allSettled(inLayout.map((img) => (img.decode ? img.decode() : null)));
          });
          await p.waitForTimeout(300);

          const screenshotPath = path.join(
            BASELINE_DIR,
            `${page.name}_${width}_${theme}.png`
          );

          await p.screenshot({
            path: screenshotPath,
            fullPage: true,
          });

          // Verify file was written
          expect(fs.existsSync(screenshotPath)).toBe(true);
          const stats = fs.statSync(screenshotPath);
          expect(stats.size).toBeGreaterThan(1024);
        });
      });
    }
  }
}
