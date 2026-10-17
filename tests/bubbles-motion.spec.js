import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// Must match the `serve out` port started in tests/global-setup.js.
const BASE_URL = 'http://localhost:4322';

/**
 * Motion quality of the bubble engine: does it move WITH the page, stay smooth while the page
 * scrolls, and run at the same speed on every display?
 *
 * Written first as a probe (shxdowloop 2026-10-16, Stage 1) and run against the previous engine
 * at 9f9f960 to record the "before" numbers in
 * docs/plans/fluid-squishy-bubbles/artifacts/baseline.json; the thresholds below come from that
 * baseline and the plan's pass marks. Set BUBBLE_PROBE_OUT to a file path to write the
 * measurements for the current engine (chromium project only).
 *
 *   measure                                   before (9f9f960)   required now
 *   lag behind a 300px scroll, engine paused        300px             <= 0.5px
 *   layout reads per scroll event                    49.5              <= 1
 *   page-space jerk p99 while scrolling              0.51px            <= 1.0px
 *   travel per simulated second, 120Hz / 60Hz        2.00              0.95 to 1.05
 *
 * Every measurement reads the DOM (`.brand-bubbles-global .brand-bubble`), not engine internals,
 * so the same probe measures both engines. Engine handles used: `running` and `rAF` (pause), and
 * `_last`, the timestamp of the engine's last frame, which the frame-rate test continues from. That
 * test replaces requestAnimationFrame with a synthetic clock, so the engine's clock must be the
 * timestamp it is handed, never performance.now().
 *
 * Why "the engine is paused" is the lag measurement: the browser scrolls the page on its
 * compositor thread before the main thread runs the next animation frame. Whatever the screen
 * shows in that gap is exactly what the DOM shows with the engine paused. A bubble that does not
 * move with the page while paused is a bubble that visibly lags and then snaps on every scroll.
 */

const probe = {};
test.afterAll(({}, testInfo) => {
  const out = process.env.BUBBLE_PROBE_OUT;
  if (!out || testInfo.project.name !== 'chromium') return;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(probe, null, 2) + '\n');
});

test.describe.configure({ mode: 'serial' });

/** Seeded Math.random, so trajectories are reproducible across runs and frame rates. */
const SEED_RANDOM = `(() => {
  let s = 0x9e3779b9;
  Math.random = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
})();`;

async function waitForEngine(page, settleFrames = 120) {
  await page.waitForFunction(() => typeof window.__bubbleEngine !== 'undefined', null, { timeout: 15000 });
  await page.waitForFunction(() => document.querySelectorAll('.brand-bubbles-global .brand-bubble').length > 0, null, { timeout: 15000 });
  await page.evaluate(async (frames) => {
    for (let i = 0; i < frames; i++) await new Promise((r) => requestAnimationFrame(() => r()));
  }, settleFrames);
}

/* Runs in BOTH projects: on webkit-mobile (iPhone 13) as well, because the page-space layer is a
   layout change and AGENTS.md is explicit that a WebKit layout bug does not reproduce in Chromium. */
test('global bubbles move with the page before the engine runs a frame', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'chromium') await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });
  /* Playwright's WebKit on Windows renders this page at ~4fps with EITHER engine (measured
     2026-10-16: 4fps for 9f9f960 and for this engine, 62fps with reduced motion, so it is the
     software renderer, not the physics). A 120-frame settle would take 30s there; this test pauses
     the engine before measuring, so a few frames are enough. */
  await waitForEngine(page, testInfo.project.name === 'chromium' ? 120 : 3);

  const r = await page.evaluate(() => {
    const e = window.__bubbleEngine;
    e.running = false;
    if (e.rAF) cancelAnimationFrame(e.rAF);
    const els = [...document.querySelectorAll('.brand-bubbles-global .brand-bubble')];
    const before = els.map((el) => el.getBoundingClientRect().top);
    const y0 = window.scrollY;
    window.scrollTo({ top: y0 + 300, behavior: 'instant' }); // html is scroll-behavior: smooth
    const dy = window.scrollY - y0;
    const after = els.map((el) => el.getBoundingClientRect().top);
    // Lag = how far each bubble's on-screen position is from where the page carried it.
    const lag = els.map((_, i) => Math.abs((after[i] - before[i]) + dy));
    return { scrolled: dy, meanLagPx: lag.reduce((a, b) => a + b, 0) / lag.length, maxLagPx: Math.max(...lag) };
  });
  probe.scrollLockstep = r;
  expect(r.scrolled).toBeGreaterThan(250);
  expect(r.meanLagPx, 'bubbles stayed put on screen while the page scrolled under them').toBeLessThanOrEqual(0.5);
  // The layer must not stretch the page it lives on.
  const stretch = await page.evaluate(() => {
    const layer = document.querySelector('.brand-bubbles-global');
    return { layer: parseFloat(layer.style.height), doc: document.documentElement.scrollHeight };
  });
  expect(stretch.layer).toBeLessThanOrEqual(stretch.doc + 1);
});

test('layout reads caused by scroll events', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'engine-cost measurement, chromium only');
  await page.addInitScript(() => {
    const orig = Element.prototype.getBoundingClientRect;
    window.__gbcr = 0;
    Element.prototype.getBoundingClientRect = function () { window.__gbcr++; return orig.call(this); };
    window.__scrollEvents = 0;
    window.addEventListener('scroll', () => { window.__scrollEvents++; }, { passive: true });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });
  await waitForEngine(page);

  const r = await page.evaluate(async () => {
    const frame = () => new Promise((res) => requestAnimationFrame(() => res()));
    const FR = 90;
    // Idle segment: the engine's own periodic refreshes, the floor to subtract.
    let c0 = window.__gbcr;
    for (let i = 0; i < FR; i++) await frame();
    const idle = window.__gbcr - c0;
    // Scroll segment: one scroll step per frame, same number of frames.
    c0 = window.__gbcr; const s0 = window.__scrollEvents;
    for (let i = 0; i < FR; i++) { window.scrollBy({ top: i < FR / 2 ? 24 : -24, behavior: 'instant' }); await frame(); }
    const scrolling = window.__gbcr - c0, events = window.__scrollEvents - s0;
    return { idleReads: idle, scrollReads: scrolling, scrollEvents: events,
             readsPerScrollEvent: events ? Math.max(0, scrolling - idle) / events : 0 };
  });
  probe.layoutReads = r;
  expect(r.scrollEvents).toBeGreaterThan(30);
  expect(r.readsPerScrollEvent).toBeLessThanOrEqual(1);
});

test('content-relative smoothness while the page scrolls', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'engine-cost measurement, chromium only');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });
  await waitForEngine(page);

  const r = await page.evaluate(async () => {
    const frame = () => new Promise((res) => requestAnimationFrame((t) => res(t)));
    const els = [...document.querySelectorAll('.brand-bubbles-global .brand-bubble')];
    const tracks = els.map(() => []);
    /* Long animation frames CAUSED BY THE ENGINE: frames over 50ms in which the engine's own script
       ran for 50ms or more itself: a real long task. A bare count also picks up frames starved by
       whatever else the machine is doing (a --repeat-each run under full load logged one with the
       engine idle in it), which is not what the pass mark is about. */
    let long = 0;
    try {
      new PerformanceObserver((l) => {
        for (const entry of l.getEntries()) {
          const mine = (entry.scripts || []).filter((s) => (s.sourceURL || '').includes('bubbles.js'))
            .reduce((sum, s) => sum + s.duration, 0);
          if (mine >= 50) long++;
        }
      }).observe({ type: 'long-animation-frame', buffered: false });
    } catch { /* not supported: reported as -1 below */ long = -1; }
    const N = 180;
    for (let i = 0; i < N; i++) {
      // A smooth back-and-forth scroll driven one step per frame.
      window.scrollBy({ top: Math.round(18 * Math.sin((i / N) * Math.PI * 4)), behavior: 'instant' });
      const t = await frame();
      els.forEach((el, k) => {
        const b = el.getBoundingClientRect();
        tracks[k].push({ t, x: b.left + b.width / 2, y: b.top + b.height / 2 + window.scrollY, o: parseFloat(getComputedStyle(el).opacity) });
      });
    }
    /* Change of page-space velocity between consecutive frames, using the real frame timestamps,
       expressed in px/frame^2 at 60fps: |v2 - v1| / 60 with v in px/s. At a steady 60fps this is
       exactly the plain second difference of position. It has to be time-based: under load frames
       arrive unevenly, and a bubble that correctly travels further in a longer frame is not a
       jerk (the first full-suite run of the per-frame version read 2.06 for that reason). */
    const jerks = [];
    for (const tr of tracks) {
      for (let i = 2; i < tr.length; i++) {
        if (tr[i].o < 0.95 || tr[i - 1].o < 0.95 || tr[i - 2].o < 0.95) continue; // relocation fades
        const d1 = (tr[i - 1].t - tr[i - 2].t) / 1000, d2 = (tr[i].t - tr[i - 1].t) / 1000;
        if (!(d1 > 0 && d2 > 0)) continue;
        const ax = (tr[i].x - tr[i - 1].x) / d2 - (tr[i - 1].x - tr[i - 2].x) / d1;
        const ay = (tr[i].y - tr[i - 1].y) / d2 - (tr[i - 1].y - tr[i - 2].y) / d1;
        jerks.push(Math.hypot(ax, ay) / 60);
      }
    }
    jerks.sort((a, b) => a - b);
    const pct = (p) => jerks[Math.min(jerks.length - 1, Math.floor(p * jerks.length))] || 0;
    return { samples: jerks.length, p50: pct(0.5), p95: pct(0.95), p99: pct(0.99), max: jerks[jerks.length - 1] || 0,
             snapsOver4px: jerks.filter((j) => j > 4).length, longAnimationFrames: long };
  });
  probe.scrollSmoothness = r;
  expect(r.samples).toBeGreaterThan(100);
  expect(r.p99).toBeLessThanOrEqual(1.0);
  if (r.longAnimationFrames >= 0) expect(r.longAnimationFrames).toBe(0);
});

/**
 * Same seeded page, animation frames driven at 60Hz and at 120Hz with synthetic timestamps.
 * A frame-rate-independent engine covers the same ground per simulated second either way.
 *
 * The synthetic clock is installed BEFORE the page loads, so the engine never sees a real frame and
 * both runs start from the same seeded state. (Taking the clock over after a few real frames made
 * the two runs start from different states under load: 0.93 and 1.08 in a --repeat-each run.)
 * The engine's first frame comes from its constructor; every later frame comes from `tick()`.
 */
const SYNTHETIC_RAF = `(() => {
  let queue = [];
  window.requestAnimationFrame = (cb) => { queue.push(cb); return queue.length; };
  window.cancelAnimationFrame = () => {};
  window.__tickFrame = (t) => { const q = queue; queue = []; for (const cb of q) cb(t); };
})();`;

async function travelPerSecond(browser, hz) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(SEED_RANDOM);
  await page.addInitScript(SYNTHETIC_RAF);
  await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });
  // Polled on a timer: the page's own requestAnimationFrame is the synthetic one now.
  await page.waitForFunction(() => typeof window.__bubbleEngine !== 'undefined', null, { timeout: 15000, polling: 100 });
  const r = await page.evaluate(async (hz) => {
    const e = window.__bubbleEngine;
    let t = e._last;
    const tick = () => { t += 1000 / hz; window.__tickFrame(t); };
    const els = [...document.querySelectorAll('.brand-bubbles-global .brand-bubble')];
    const pos = () => els.map((el) => { const b = el.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
    let p = pos(), dist = 0;
    const SECONDS = 3;
    for (let i = 0; i < SECONDS * hz; i++) {
      tick();
      const q = pos();
      for (let k = 0; k < q.length; k++) dist += Math.hypot(q[k][0] - p[k][0], q[k][1] - p[k][1]);
      p = q;
    }
    return dist / els.length / SECONDS;
  }, hz);
  await ctx.close();
  return r;
}

test('the same simulated second covers the same ground at 60Hz and 120Hz', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'engine-cost measurement, chromium only');
  const at60 = await travelPerSecond(browser, 60);
  const at120 = await travelPerSecond(browser, 120);
  probe.frameRate = { pxPerSecondAt60: at60, pxPerSecondAt120: at120, ratio120to60: at120 / at60 };
  expect(at60).toBeGreaterThan(0);
  expect(at120 / at60).toBeGreaterThanOrEqual(0.95);
  expect(at120 / at60).toBeLessThanOrEqual(1.05);
});

/* Responsiveness, which the approved feel depends on (feel lab, 2026-10-16): a flick of the pointer
   carries a bubble along and deforms it, a lifted finger stops pushing (the old tracker kept the
   last touch point repelling forever), and the hero blobs still move and render through the
   deformation matrix. */
test('a pointer flick carries and squishes a bubble; a lifted finger stops pushing', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'synthetic pointer sweep, chromium only');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await waitForEngine(page, 60);

  const r = await page.evaluate(async () => {
    const e = window.__bubbleEngine;
    const frame = () => new Promise((res) => requestAnimationFrame(() => res()));
    const b = e.globalLayer.bubbles.filter((x) => !x._parked).sort((p, q) => q.radius - p.radius)[0];
    const speed0 = Math.hypot(b.vx, b.vy);
    let peakAlong = -Infinity, peakDeform = 0;
    // Sweep left to right through the bubble's centre at ~1200px/s (20px per frame at 60fps).
    for (let i = 0; i < 14; i++) {
      const cx = b.x - 140 + i * 20, cy = b.y - window.scrollY;
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: cx, clientY: cy, pointerType: 'mouse' }));
      await frame();
      peakAlong = Math.max(peakAlong, b.vx);
      peakDeform = Math.max(peakDeform, Math.hypot(b.a, b.b));
    }
    const activeDuring = e.pointer.active;
    window.dispatchEvent(new TouchEvent('touchstart', { touches: [new Touch({ identifier: 1, target: document.body, clientX: 10, clientY: 10 })] }));
    const activeOnTouch = e.pointer.active;
    window.dispatchEvent(new TouchEvent('touchend', { touches: [] }));

    // Hero blobs: still moving, rendered through the deformation matrix.
    const blobs = e.heroBlobLayer.blobs;
    const before = blobs.map((x) => [x.x, x.y]);
    for (let i = 0; i < 60; i++) await frame();
    const moved = blobs.filter((x, k) => Math.hypot(x.x - before[k][0], x.y - before[k][1]) > 1).length;
    return {
      speed0, peakAlong, peakDeform, activeDuring, activeOnTouch, activeAfterLift: e.pointer.active,
      blobs: blobs.length, blobsMoved: moved, blobMatrix: blobs.every((x) => x.el.style.transform.includes('matrix(')),
    };
  });

  expect(r.activeDuring).toBe(true);
  expect(r.peakAlong, 'the flick did not carry the bubble along').toBeGreaterThan(150);
  expect(r.peakDeform, 'the bubble did not deform under the flick').toBeGreaterThan(0.03);
  expect(r.activeOnTouch).toBe(true);
  expect(r.activeAfterLift, 'a lifted finger kept pushing').toBe(false);
  expect(r.blobs).toBeGreaterThan(0);
  expect(r.blobsMoved).toBeGreaterThan(0);
  expect(r.blobMatrix).toBe(true);
});
