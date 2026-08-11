import { test, expect } from '@playwright/test';

// Must match the `serve out` webServer port started in global-setup.js.
const BASE_URL = 'http://localhost:4322';

/**
 * The one-column rule (2026-08-10).
 *
 * If the user can see more than one column, the nav and the current selection
 * both stay on screen; if they cannot, nothing is pinned and the page scrolls
 * as one piece. 768px is the threshold, because that is where the gallery grid
 * stops being one column.
 *
 * This file exists because the visual gate structurally cannot see any of it:
 * it captures `fullPage` at scroll 0, where a rail that sticks and a rail that
 * does not are the same picture. A `position: sticky` declaration with zero
 * travel shipped unnoticed from Entry 079 until it was measured on 2026-08-10.
 * Every assertion here is therefore taken AFTER a scroll.
 *
 * Plan: docs/plans/2026-08-10-sticky-rail-one-column-rule.md
 */

const PAGES = [
  /* `[aria-label="Projects"]`, not just `[role="tablist"]` — the Mistrust
     slideshow renders its own set tablist further down the same page. */
  { name: 'projects', url: '/projects/', rail: '[role="tablist"][aria-label="Projects"]' },
  { name: 'gallery', url: '/gallery/', rail: '.gallery-filter-bar' },
];

/* The rail's own wrapper is the sticky element, so measure the wrapper. */
const wrapperOf = (page, railSelector) =>
  page.locator(railSelector).locator('xpath=..');

/* `src/css/site.css` sets `scroll-behavior: smooth`, so `scrollTo` ANIMATES and
   anything measured before it lands reads as a layout bug rather than a timing
   one (observed: "the page barely scrolled", and a rail 121px below the nav).
   Polling for a stable scrollY is not enough either — the animation has not
   necessarily started on the first poll, so two equal samples prove nothing.
   Turn the animation off for the duration instead: these are static-layout
   assertions and the easing is not under test. */
async function scrollDown(page, y = 1000) {
  await page.evaluate((to) => {
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, to);
    html.style.scrollBehavior = previous;
  }, y);
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  );
}

for (const p of PAGES) {
  test.describe(p.name, () => {
    test('below one column, nothing is pinned @ 360px', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'networkidle' });
      await scrollDown(page);

      const { navTop, navPosition, railTop, scrollY } = await page.evaluate((sel) => {
        const nav = document.querySelector('.brand-nav');
        const rail = document.querySelector(sel);
        return {
          navTop: nav.getBoundingClientRect().top,
          navPosition: getComputedStyle(nav).position,
          railTop: rail.getBoundingClientRect().top,
          scrollY: window.scrollY,
        };
      }, p.rail);

      // Guard: a page too short to scroll would pass everything below vacuously.
      expect(scrollY).toBeGreaterThan(200);

      /* `relative`, not `static`: the nav's spectrum bar is absolutely
         positioned inside it and needs the nav as its containing block. Under
         `static` the bar detached and painted a gradient rule across the middle
         of the page — measured 2026-08-10, invisible to the visual gate. */
      expect(navPosition).toBe('relative');
      expect(navTop).toBeLessThan(0);
      expect(railTop).toBeLessThan(0);
    });

    test('the nav keeps its spectrum bar when it scrolls away @ 360px', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'networkidle' });
      await scrollDown(page);

      const { navBottom, barTop } = await page.evaluate(() => {
        const nav = document.querySelector('.brand-nav');
        const bar = nav.querySelector('.brand-spectrum-bar');
        return {
          navBottom: nav.getBoundingClientRect().bottom,
          barTop: bar.getBoundingClientRect().top,
        };
      });

      // The bar travels with the nav's bottom edge rather than parking itself
      // one viewport down the page.
      expect(Math.abs(barTop - (navBottom - 2))).toBeLessThan(2);
    });

    for (const width of [768, 1024, 1440, 2560]) {
      test(`nav and selection stay pinned @ ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'networkidle' });
        await scrollDown(page);

        const navHeight = await page
          .locator('.brand-nav')
          .evaluate((el) => el.getBoundingClientRect().height);
        const navTop = await page
          .locator('.brand-nav')
          .evaluate((el) => el.getBoundingClientRect().top);
        const wrapperTop = await wrapperOf(page, p.rail).evaluate(
          (el) => el.getBoundingClientRect().top
        );

        expect(navTop).toBe(0);

        /* The rail sits exactly under the nav — not at a hardcoded 64px, which
           is what `lg:top-16` was. `--brand-nav-height` is
           `clamp(62px, 6vw, 76px)` and measures 76px from 1267px up, so that
           constant buried the rail's first 12px at 1440 and wider. */
        expect(Math.abs(wrapperTop - navHeight)).toBeLessThan(1.5);
      });
    }

    test('the rail column has room to travel', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'networkidle' });

      /* The failure this catches is silent: `position: sticky` on a box exactly
         as tall as its containing block computes as sticky and behaves as
         static. Travel budget, not the declaration, is what makes it work. */
      const travel = await wrapperOf(page, p.rail).evaluate((el) => {
        const parent = el.parentElement.getBoundingClientRect().height;
        return parent - el.getBoundingClientRect().height;
      });

      expect(travel).toBeGreaterThan(200);
    });
  });
}

/* The overlay token is declared on `:root, :root[data-theme="dark"]`, so an
   override written against a plain `:root` loses to the dark selector's higher
   specificity and applies in light only. That shipped for an afternoon and
   showed up as a Mistrust stage 76px taller in dark than light at the same
   viewport. Assert the two themes agree rather than trusting the cascade. */
for (const width of [360, 768, 1440]) {
  test(`pinned-chrome overlay is theme-independent @ ${width}px`, async ({ browser }) => {
    const read = async (colorScheme) => {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        colorScheme,
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/projects/`, { waitUntil: 'networkidle' });
      const value = await page.evaluate(() => {
        // Resolve `--brand-top-overlay` (a calc of two tokens) to real pixels.
        const probe = document.createElement('div');
        probe.style.height = 'var(--brand-top-overlay)';
        document.body.appendChild(probe);
        const px = probe.getBoundingClientRect().height;
        probe.remove();
        return { px, docHeight: document.documentElement.scrollHeight };
      });
      await context.close();
      return value;
    };

    const dark = await read('dark');
    const light = await read('light');

    expect(dark.px).toBe(light.px);
    expect(dark.px).toBe(width < 768 ? 0 : dark.px);
    expect(Math.abs(dark.docHeight - light.docHeight)).toBeLessThan(2);
  });
}

test('the pinned strip is only opaque where content passes under it', async ({ page }) => {
  const bg = async (width) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });
    return page
      .locator('.gallery-filter-bar')
      .locator('xpath=..')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
  };

  const transparent = 'rgba(0, 0, 0, 0)';

  // 768–1023: a full-width strip with the grid scrolling beneath it.
  expect(await bg(768)).not.toBe(transparent);
  // lg+: a rail beside the grid. An opaque box here paints a lighter rectangle
  // over the page gradient and covers the bubble layer.
  expect(await bg(1440)).toBe(transparent);
});
