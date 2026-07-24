import { test, expect } from '@playwright/test';

// Must match the `serve out` webServer port in playwright.config.js.
// Deliberately not 3000/3001 -- those are where `next dev` lands.
const BASE_URL = 'http://localhost:4322';

/**
 * Coverage for the bubble engine's hero exclusion zones.
 *
 * The visual-baseline suite cannot cover any of this: it captures under
 * `prefers-reduced-motion: reduce`, where the engine returns before creating a
 * single bubble (`bubbles.js`), which is exactly what makes those captures
 * deterministic. The consequence is that the entire bubble system is invisible
 * to it — a regression that put bubbles across the hero logo survived a week
 * unnoticed (LOGBOOK Entry 090). Its cause was a tag selector: the exclusion
 * list matches `img`, and the logo had been re-inlined as an `<svg>`.
 *
 * So these tests deliberately run WITH motion enabled and assert on live
 * geometry.
 */

/**
 * Wait for the idle-deferred engine, then let the physics settle.
 *
 * The settle is counted in animation frames, not milliseconds: the engine
 * integrates per frame, so under `fullyParallel` contention a fixed
 * wall-clock wait buys far fewer frames of settling than it does standalone.
 */
async function waitForEngine(page, settleFrames = 300) {
  await page.waitForFunction(() => typeof window.__bubbleEngine !== 'undefined', null, { timeout: 15000 });
  await page.waitForFunction(() => document.querySelectorAll('.brand-bubble').length > 0, null, { timeout: 15000 });
  await page.evaluate(async (frames) => {
    for (let i = 0; i < frames; i++) {
      await new Promise((r) => requestAnimationFrame(() => r()));
    }
  }, settleFrames);
}

/**
 * Largest overlap between any `.brand-bubble` and the elements matching
 * `selector`, sampled over several animation frames. Bubbles are hard-constrained
 * by `resolveZoneCollisions`, so the correct answer is zero at every instant,
 * not merely on average.
 *
 * Sampling is per ANIMATION FRAME, not per millisecond. Under `fullyParallel`
 * contention rAF is starved and bubbles travel less per wall-clock second; a
 * time-based sample then measures fewer frames of motion and can report
 * transient overlap that would have resolved in the next frame. This failed
 * exactly that way for the blob test (Entry 090).
 */
async function maxBubbleOverlap(page, selector, samples = 6, framesBetween = 60) {
  let worst = 0;
  for (let i = 0; i < samples; i++) {
    const v = await page.evaluate(({ sel, f }) => {
      const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
      const run = async () => {
        const targets = [...document.querySelectorAll(sel)];
        if (!targets.length) return -1;
        let max = 0;
        for (const t of targets) {
          const T = t.getBoundingClientRect();
          for (const el of document.querySelectorAll('.brand-bubble')) {
            const b = el.getBoundingClientRect();
            const ox = Math.max(0, Math.min(T.right, b.right) - Math.max(T.left, b.left));
            const oy = Math.max(0, Math.min(T.bottom, b.bottom) - Math.max(T.top, b.top));
            max = Math.max(max, ox * oy);
          }
        }
        for (let j = 0; j < f; j++) await nextFrame();
        return max;
      };
      return run();
    }, { sel: selector, f: framesBetween });
    if (v === -1) throw new Error(`no elements matched ${selector}`);
    worst = Math.max(worst, v);
  }
  return worst;
}

/** True when every element matching `selector` sits inside a registered zone. */
async function allRegisteredAsZones(page, selector) {
  return page.evaluate((sel) => {
    const targets = [...document.querySelectorAll(sel)];
    if (!targets.length) return false;
    const zones = window.__bubbleEngine.zones.rects;
    // A zone carries ZONE_PADDING, so the registered rect contains the element.
    return targets.every((t) => {
      const r = t.getBoundingClientRect();
      return zones.some((z) => z.left <= r.left && z.top <= r.top && z.right >= r.right && z.bottom >= r.bottom);
    });
  }, selector);
}

test.describe('bubble exclusion zones', () => {
  for (const width of [768, 1440]) {
    test(`physics bubbles never cover the hero logo @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await waitForEngine(page);

      expect(await maxBubbleOverlap(page, '#hero .hero-logo')).toBe(0);
    });
  }

  // The Projects rail went the same way as the hero logo, for the same reason.
  // The tabs were `.brand-btn` + `.brand-btn-primary`/`-secondary` -- all
  // excluded -- until they were restyled to `.project-tab` (Entry 085), which
  // dropped them out of the list. Measured before the fix: bubbles crossed the
  // rail in 30 of 30 sampled frames at 1440px. Continuously, not transiently.
  for (const width of [768, 1440]) {
    test(`physics bubbles never cover the Projects tabs @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${BASE_URL}/projects/`, { waitUntil: 'networkidle' });
      await waitForEngine(page);

      expect(await allRegisteredAsZones(page, '.project-tab')).toBe(true);
      expect(await maxBubbleOverlap(page, '.project-tab')).toBe(0);
    });
  }

  // Gallery filter bar uses .bubble-exclude (already in DEFAULT_EXCLUSIONS) to
  // avoid bubbles crossing the interactive filter buttons.
  for (const width of [768, 1440]) {
    test(`physics bubbles never cover the Gallery filter bar @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });
      await waitForEngine(page);

      expect(await allRegisteredAsZones(page, '.gallery-filter-bar')).toBe(true);
      expect(await maxBubbleOverlap(page, '.gallery-filter-bar')).toBe(0);
    });
  }

  test('the hero logo is a registered exclusion zone', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await waitForEngine(page);

    // Guards the specific failure mode: the logo is matched by class, so
    // re-inlining or re-tagging the element cannot silently drop it again.
    const covered = await page.evaluate(() => {
      const logo = document.querySelector('#hero .hero-logo');
      const L = logo.getBoundingClientRect();
      // A zone carries ZONE_PADDING, so the registered rect contains the logo.
      return window.__bubbleEngine.zones.rects.some(
        (z) => z.left <= L.left && z.top <= L.top && z.right >= L.right && z.bottom >= L.bottom
      );
    });
    expect(covered).toBe(true);
  });

  test('hero blobs are not parked on the hero copy', async ({ page }) => {
    // Frame-based sampling (below) makes the wall-clock duration depend on the
    // frame rate this worker actually gets, so the default 30s is not enough
    // under full-suite contention.
    //
    // This timeout is also the backstop for a rarer case: the engine cancels
    // its rAF loop on `visibilitychange` -> hidden (bubbles.js), so a
    // backgrounded page would leave the frame waits below stalled rather than
    // failing. Bounded here rather than hanging.
    test.setTimeout(120000);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await waitForEngine(page);

    // Blobs are the ambient wash: steered by a soft force (BLOB_ZONE_PUSH),
    // never hard-clamped. So the property under test is "not parked on the
    // copy" -- an instantaneous-maximum assertion would instead measure
    // transient pass-through and flake.
    //
    // Measured over 60 samples after the fix: the overlap is exactly zero in
    // 90% of samples at 1440px and 97% at 768px, median 0 at both, with
    // occasional transients to ~2,000px2 as a blob is steered back out.
    // Before the fix a blob sat on the copy continuously, so the zero-fraction
    // would have been ~0. The 0.6 bar below therefore has wide margin against
    // normal behaviour while still failing loudly on a real regression.
    //
    // Sampling is per ANIMATION FRAME, not per millisecond, and that is
    // load-bearing. The blob physics integrates a fixed velocity per frame
    // rather than scaling by elapsed time, so under `fullyParallel` contention
    // -- 45+ browser contexts competing -- rAF is starved and the blobs
    // genuinely travel less per wall-clock second. A time-based sample then
    // measures fewer frames of motion and reports a lower zero-fraction, which
    // looks like a regression and is not one. This failed exactly that way when
    // the full suite first ran (passing 3/3 standalone), so the instrument, not
    // the threshold, was wrong.
    //
    // Ink, not element box: .hero-name is a full-width block with centred
    // text (1104px box vs 290px of glyphs at 1440), so its box would report
    // meaningless overlap.
    const { zeroFraction, samples } = await page.evaluate(async () => {
      const ink = (el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        return r.getBoundingClientRect();
      };
      const targets = ['#hero .hero-name', '#hero .hero-sub']
        .map((s) => document.querySelector(s))
        .filter(Boolean)
        .map(ink);

      const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

      let zero = 0;
      const total = 40;
      const framesBetweenSamples = 10; // ~400 frames of physics overall
      for (let i = 0; i < total; i++) {
        let worst = 0;
        for (const t of targets) {
          for (const el of document.querySelectorAll('.brand-hero-blob')) {
            const b = el.getBoundingClientRect();
            const ox = Math.max(0, Math.min(t.right, b.right) - Math.max(t.left, b.left));
            const oy = Math.max(0, Math.min(t.bottom, b.bottom) - Math.max(t.top, b.top));
            worst = Math.max(worst, ox * oy);
          }
        }
        if (worst === 0) zero++;
        for (let f = 0; f < framesBetweenSamples; f++) await nextFrame();
      }
      return { zeroFraction: zero / total, samples: total };
    });

    expect(samples).toBe(40);
    expect(zeroFraction).toBeGreaterThanOrEqual(0.6);
  });
});
