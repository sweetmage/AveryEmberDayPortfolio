import { test, expect } from '@playwright/test';

// Must match the `serve out` webServer port in playwright.config.js.
// Deliberately not 3000/3001 -- those are where `next dev` lands.
const BASE_URL = 'http://localhost:4322';

const PAGES = [
  { name: 'index', url: '/' },
  { name: 'projects', url: '/projects/' },
  { name: 'projects-mistrust', url: '/projects/#history-of-mistrust' },
  { name: 'gallery', url: '/gallery/' },
  { name: 'contact', url: '/contact/' },
];

const BREAKPOINTS = [360, 768, 1024, 1440];
const THEMES = ['light', 'dark'];

/**
 * Visual regression gate.
 *
 * This suite COMPARES against committed snapshots — it does not merely capture.
 * Snapshots live in `visual-baseline.spec.js-snapshots/` (Playwright's own
 * convention) so that diffs, `--update-snapshots`, and the actual/expected/diff
 * artifacts in `test-results/` all work without custom plumbing.
 *
 * To accept intentional visual changes:
 *
 *     npm test -- --update-snapshots
 *
 * Review the regenerated PNGs before committing them. An unreviewed
 * `--update-snapshots` defeats the entire point of the gate.
 *
 * Determinism: reduced motion makes captures reproducible without masking
 * anything. The bubble engine returns before creating a single bubble under
 * that media query (`public/scripts/bubbles.js:13`), and `brand.css` already
 * zeroes its own animations there. That costs coverage of the purely
 * decorative bubble layer — which was never meaningfully comparable, since the
 * bubbles are randomly seeded and continuously in motion — and keeps full
 * pixel coverage of every element that actually matters.
 *
 * NOTE: reduced motion is applied via `page.emulateMedia()`, NOT via
 * `test.use({ reducedMotion })`. On Playwright 1.61.1 the declarative option
 * is silently ignored for `reducedMotion` specifically — verified by probe:
 * `colorScheme` and `viewport` from the same `test.use` call both applied
 * while `matchMedia('(prefers-reduced-motion: reduce)')` still reported
 * false, leaving the bubble engine running and captures unstable. The runtime
 * API works. Do not "simplify" this back into `test.use`.
 */
for (const page of PAGES) {
  for (const width of BREAKPOINTS) {
    for (const theme of THEMES) {
      test.describe(`${page.name} @ ${width}px — ${theme}`, () => {
        test.beforeEach(async ({ context }) => {
          // localStorage ONLY. This used to also call
          // `document.documentElement.setAttribute('data-theme', t)`, which
          // silently threw on every one of these tests: init scripts run before
          // the document exists, so `document.documentElement` is null there
          // (verified by probe). Nothing listened for pageerror here, so 40
          // exceptions per run went unnoticed while the line did nothing.
          //
          // Theming has always actually come from the site's own inline head
          // script reading this value — which is the real code path anyway, so
          // it is the better thing to exercise. The assertion below turns that
          // previously-silent dependency into a checked one.
          await context.addInitScript((t) => {
            localStorage.setItem('theme', t);
          }, theme);
        });

        test('visual baseline', async ({ page: p }) => {
          await p.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
          await p.setViewportSize({ width, height: 900 });
          await p.goto(`${BASE_URL}${page.url}`, { waitUntil: 'networkidle' });

          // Never capture a baseline in the wrong theme: if the head script
          // stops honouring localStorage, fail loudly instead of quietly
          // re-baselining every snapshot against the default theme.
          await expect(p.locator('html')).toHaveAttribute('data-theme', theme);

          // For the mistrust tab deep-link, ensure the tab is active before capture.
          if (page.name === 'projects-mistrust') {
            const mistrustTab = p.locator('button[aria-controls="panel-history-of-mistrust"]');
            if (await mistrustTab.count()) {
              await mistrustTab.click();
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
            // Decode completion does not guarantee paint completion. A short
            // wait lets the browser composite before capture, preventing the
            // partial-paint baseline defect (gallery images half-rendered).
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
          });

          /* Webfonts shift metrics on late swap; wait for them explicitly
             rather than sleeping and hoping.

             `document.fonts.ready` ALONE IS NOT ENOUGH, and this cost four
             baselines in one run on 2026-08-10. The faces arrive through a
             remote `@import` of Google Fonts (app/globals.css), so until that
             stylesheet lands there are no `@font-face` rules registered at all
             — and `fonts.ready` against an empty set resolves immediately,
             because every one of zero fonts has loaded. The capture then
             renders in the fallback, and since only `--brand-font-display`
             text is affected in the nav the whole diff is a couple of thousand
             glyph pixels: it reads as noise rather than as "the fonts were
             missing". It surfaced as three consecutive runs failing three
             DIFFERENT pages (index @1440 both themes and projects, then
             contact @768 dark), all of which passed on immediate re-run.

             So wait for the faces to exist AND report loaded. The three below
             are the ones the site actually requests, confirmed by reading
             `document.fonts` on a loaded page — do not add `600 Outfit`, which
             is declared in the import URL but never used, so `check()` returns
             false for it forever and this would hang until timeout. */
          await p.waitForFunction(
            () =>
              document.fonts.status === 'loaded' &&
              ['400 1rem Sriracha', '500 1rem Outfit', '400 1rem Inter'].every((f) =>
                document.fonts.check(f)
              ),
            null,
            { timeout: 15000 }
          );
          // One composited frame after the last possible metric change.
          await p.evaluate(
            () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
          );

          await expect(p).toHaveScreenshot(`${page.name}_${width}_${theme}.png`, {
            fullPage: true,
            animations: 'disabled',
            caret: 'hide',
            // `threshold` is the per-pixel colour sensitivity and is the knob
            // that actually matters. Playwright's default of 0.2 is far too
            // loose for this site: an 8-point shift in --brand-text-soft
            // (#d7d7d1 -> #cfcfc9) across the whole dark theme registered ZERO
            // differing pixels and the suite passed. Verified empirically —
            // do not relax this without re-running the injected-regression
            // check in the plan's Stage 3.
            threshold: 0.02,
            // `maxDiffPixelRatio` scales with page height, so small changes on
            // tall pages pass silently. A 2px tab divider (~520 px) passed on
            // a 1440×2559 page because the ratio allowed ~3685 pixels. An
            // absolute floor catches furniture changes regardless of page
            // height without re-grading existing baselines.
            maxDiffPixels: 500,
          });
        });
      });
    }
  }
}
