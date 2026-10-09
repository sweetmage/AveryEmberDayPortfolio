import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

// Must match the `serve out` webServer port started in global-setup.js.
const BASE_URL = 'http://localhost:4322';
// Playwright transpiles specs to CJS, so `__dirname` is available and `import.meta` is not.
const ROOT = path.join(__dirname, '..');

/**
 * Coverage for the print mockup shown in an expanded gallery card.
 *
 * The mockup is the one thing in the expanded card that must not exist while the
 * card is collapsed: a collapsed card has to lay out exactly as it did before
 * mockups, because the visual gate cannot see an expanded card and only ever
 * grades the collapsed grid against its own past self.
 *
 * Plan: docs/plans/2026-10-09-print-mockups-shxdowloop.md (Track C).
 */

// Serial like gallery-expand.spec.js: the motion-enabled case below drives a real
// view transition, and the rest share one built server.
test.describe.configure({ mode: 'serial' });

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'images/mockups/mockups.json'), 'utf8'));

/* Declared mockup size per slug, read out of gallery-data.ts itself so the file
   check below tests what the page will actually request. */
const dataSource = fs.readFileSync(path.join(ROOT, 'app/portfolio/gallery-data.ts'), 'utf8');
const declared = [...dataSource.matchAll(
  /src: '(\/images\/myart\/Mockups\/([^']+?)-(canvas|framed|poster|skateboard)\.webp)',\s*width: (\d+),\s*height: (\d+),/g,
)].map(([, src, slug, kind, width, height]) => ({ src, slug, kind, width: Number(width), height: Number(height) }));

const CAPTIONS = [
  'In Danger', 'Chill', 'Gross', 'Emergence', 'Faces', 'Lollipop',
  'Overflow', 'Stairs', 'Beheaded', 'Shadow', 'Texas Lake Landscape', 'Moonlight',
];

/* Collapsed card (<figure>) heights in px, measured at base commit 20860ef (the
   last commit before any mockup code) under reduced motion, viewport height 900,
   2026-10-09. From 768px up the grid stretches every card to one row height, so
   one number per width; at 360px each card hugs its own artwork. */
const BASE_COLLAPSED_HEIGHTS = {
  360: {
    'In Danger': 462.09, Chill: 547.81, Gross: 434.53, Emergence: 462.09,
    Faces: 451.91, Lollipop: 452.59, Overflow: 472.06, Stairs: 563.47,
    Beheaded: 455.38, Shadow: 425.03, 'Texas Lake Landscape': 345.23, Moonlight: 276.77,
  },
  768: 625.64,
  1024: 626.64,
  1440: 629.91,
};

const toggle = (page, caption) =>
  page.getByRole('button', { name: new RegExp(`^(Expand|Collapse) ${caption}$`) });

const card = (page, caption) =>
  page.locator('.gallery-item').filter({ has: page.getByRole('heading', { name: caption, exact: true }) });

test.describe('gallery print mockups', () => {
  test('declared mockups mirror the manifest', () => {
    expect(manifest.items).toHaveLength(24);
    expect(declared).toHaveLength(24);
    for (const item of manifest.items) {
      const entry = declared.find((d) => d.slug === item.slug && d.kind === item.kind);
      expect(entry, `gallery-data.ts has the ${item.kind} mockup for ${item.slug}`).toBeTruthy();
      const size = item.kind === 'skateboard' ? manifest.output.skateboard : manifest.output.wall;
      expect([entry.width, entry.height]).toEqual([size.width, size.height]);
    }
  });

  test('every piece has two mockups, each a different kind in a different scene', () => {
    const bySlug = {};
    for (const item of manifest.items) (bySlug[item.slug] ||= []).push(item);
    expect(Object.keys(bySlug)).toHaveLength(12);
    for (const [slug, rows] of Object.entries(bySlug)) {
      expect(rows, slug).toHaveLength(2);
      expect(rows[0].kind, slug).not.toBe(rows[1].kind);
      expect(rows[0].scene, slug).not.toBe(rows[1].scene);
    }
  });

  test('every mockup file and its -480w / -900w variants exist at the declared size', async () => {
    for (const entry of declared) {
      const base = path.join(ROOT, 'public', entry.src);
      const full = await sharp(base).metadata();
      expect([full.width, full.height], entry.src).toEqual([entry.width, entry.height]);

      for (const w of [480, 900]) {
        const variant = base.replace(/\.webp$/, `-${w}w.webp`);
        const meta = await sharp(variant).metadata();
        expect(meta.width, path.basename(variant)).toBe(w);
        // Same ratio as the full-size file, to within rounding.
        expect(Math.abs(meta.height - Math.round((entry.height * w) / entry.width))).toBeLessThanOrEqual(1);
      }
    }
  });

  for (const width of [360, 768, 1024, 1440]) {
    test(`collapsed cards are the same height as before mockups at ${width}px`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

      // No mockup node, and no wrapper, may exist in a collapsed card.
      await expect(page.locator('.gallery-mockup')).toHaveCount(0);
      await expect(page.locator('.gallery-mockups')).toHaveCount(0);

      const expected = BASE_COLLAPSED_HEIGHTS[width];
      for (const caption of CAPTIONS) {
        const box = await card(page, caption).boundingBox();
        const want = typeof expected === 'number' ? expected : expected[caption];
        expect(Math.abs(box.height - want), `${caption} at ${width}px`).toBeLessThan(0.5);
      }
    });
  }

  test('no card shows a mockup while collapsed; expanding shows exactly two', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    for (const caption of CAPTIONS) {
      await expect(card(page, caption).locator('.gallery-mockup')).toHaveCount(0);
      await expect(card(page, caption).locator('.gallery-mockups')).toHaveCount(0);
    }

    for (const caption of CAPTIONS) {
      const button = toggle(page, caption);
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'true');

      const mockups = card(page, caption).locator('.gallery-mockup');
      await expect(mockups).toHaveCount(2);
      await expect(page.locator('.gallery-mockup')).toHaveCount(2);
      for (const mockup of await mockups.all()) {
        expect((await mockup.getAttribute('alt')).trim().length).toBeGreaterThan(0);
        // It must stay a bare <img>: `img` is a bubble exclusion selector by tag.
        expect(await mockup.evaluate((el) => el.tagName)).toBe('IMG');
        await expect
          .poll(() => mockup.evaluate((el) => el.complete && el.naturalWidth), { timeout: 10000 })
          .toBeGreaterThan(0);
      }

      // aria-controls points at a real element that holds the mockup.
      const controls = await button.getAttribute('aria-controls');
      expect(controls).toBeTruthy();
      const panel = page.locator(`[id="${controls}"]`);
      await expect(panel).toHaveCount(1);
      await expect(panel.locator('.gallery-mockup')).toHaveCount(2);

      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('.gallery-mockup')).toHaveCount(0);
    }
  });

  test("one of Gross's mockups is the skateboard", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    await toggle(page, 'Gross').click();
    const mockups = card(page, 'Gross').locator('.gallery-mockup');
    await expect(mockups).toHaveCount(2);
    const srcs = await mockups.evaluateAll((els) => els.map((el) => el.getAttribute('src')));
    expect(srcs.some((src) => src.includes('gross-skateboard'))).toBe(true);
  });

  test('expanding with motion on leaves the mockup decoded when the transition ends', async ({ page }) => {
    // Chromium's default is motion enabled; stated here because the whole point
    // is the view-transition path that reduced motion skips.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      window.__vtFinished = null;
      const original = document.startViewTransition;
      if (typeof original === 'function') {
        document.startViewTransition = function (callback) {
          const transition = original.call(this, callback);
          window.__vtFinished = transition.finished;
          return transition;
        };
      }
    });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    const button = toggle(page, 'Gross');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    const state = await page.evaluate(async () => {
      if (window.__vtFinished) await window.__vtFinished.catch(() => {});
      const imgs = [...document.querySelectorAll('.gallery-mockup')];
      if (imgs.length === 0) return null;
      await Promise.all(imgs.map((img) => img.decode().catch(() => {})));
      return {
        count: imgs.length,
        complete: imgs.every((img) => img.complete),
        naturalWidth: Math.min(...imgs.map((img) => img.naturalWidth)),
        ranTransition: window.__vtFinished !== null,
      };
    });

    expect(state, 'mockup is mounted after the transition').not.toBeNull();
    expect(state.count).toBe(2);
    expect(state.ranTransition).toBe(true);
    expect(state.complete).toBe(true);
    expect(state.naturalWidth).toBeGreaterThan(0);
  });
});
