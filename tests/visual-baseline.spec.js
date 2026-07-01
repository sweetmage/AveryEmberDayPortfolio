import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';

const PAGES = [
  { name: 'index', url: '/' },
  { name: 'brand', url: '/projects/brand-avery-ember-day.html' },
  { name: 'mistrust', url: '/projects/history-of-mistrust.html' },
  { name: 'patriots', url: '/projects/patriots-low-thirds.html' },
  { name: 'gallery', url: '/gallery/gallery.html' },
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
