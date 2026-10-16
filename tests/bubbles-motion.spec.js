import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// Must match the `serve out` port started in tests/global-setup.js.
const BASE_URL = 'http://localhost:4322';

/**
 * Motion quality of the bubble engine: does it move WITH the page, stay smooth while the page
 * scrolls, and run at the same speed on every display?
 *
 * Written first as a probe (shxdowloop 2026-10-16, Stage 1) and run against the unchanged engine
 * at 9f9f960 to record the "before" numbers in
 * docs/plans/fluid-squishy-bubbles/artifacts/baseline.json. Set BUBBLE_PROBE_OUT to a file path to
 * write the measurements for the current engine.
 *
 * Every measurement reads the DOM (`.brand-bubbles-global .brand-bubble`), not engine internals,
 * so the same probe measures both engines. The only engine handles used are the ones the old and
 * new engines share: `running`, `rAF`, and `destroy()`.
 *
 * Why "the engine is paused" is the lag measurement: the browser scrolls the page on its
 * compositor thread before the main thread runs the next animation frame. Whatever the screen
 * shows in that gap is exactly what the DOM shows with the engine paused. A bubble that does not
 * move with the page while paused is a bubble that visibly lags and then snaps on every scroll.
 */

const probe = {};
test.afterAll(() => {
  const out = process.env.BUBBLE_PROBE_OUT;
  if (!out) return;
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

test('global bubbles move with the page before the engine runs a frame', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });
  await waitForEngine(page);

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
});

test('layout reads caused by scroll events', async ({ page }) => {
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
});

test('content-relative smoothness while the page scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });
  await waitForEngine(page);

  const r = await page.evaluate(async () => {
    const frame = () => new Promise((res) => requestAnimationFrame((t) => res(t)));
    const els = [...document.querySelectorAll('.brand-bubbles-global .brand-bubble')];
    const tracks = els.map(() => []);
    let long = 0;
    try {
      new PerformanceObserver((l) => { long += l.getEntries().length; }).observe({ type: 'long-animation-frame', buffered: false });
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
    // Second difference of page-space position, per frame: an abrupt change of velocity.
    const jerks = [];
    for (const tr of tracks) {
      for (let i = 2; i < tr.length; i++) {
        if (tr[i].o < 0.95 || tr[i - 1].o < 0.95 || tr[i - 2].o < 0.95) continue; // relocation fades
        const ax = tr[i].x - 2 * tr[i - 1].x + tr[i - 2].x, ay = tr[i].y - 2 * tr[i - 1].y + tr[i - 2].y;
        jerks.push(Math.hypot(ax, ay));
      }
    }
    jerks.sort((a, b) => a - b);
    const pct = (p) => jerks[Math.min(jerks.length - 1, Math.floor(p * jerks.length))] || 0;
    return { samples: jerks.length, p50: pct(0.5), p95: pct(0.95), p99: pct(0.99), max: jerks[jerks.length - 1] || 0,
             snapsOver4px: jerks.filter((j) => j > 4).length, longAnimationFrames: long };
  });
  probe.scrollSmoothness = r;
  expect(r.samples).toBeGreaterThan(100);
});

/**
 * Same seeded page, animation frames driven at 60Hz and at 120Hz with synthetic timestamps.
 * A frame-rate-independent engine covers the same ground per simulated second either way.
 */
async function travelPerSecond(browser, hz) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(SEED_RANDOM);
  await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });
  await waitForEngine(page, 30);
  const r = await page.evaluate(async (hz) => {
    const e = window.__bubbleEngine;
    e.running = false;
    if (e.rAF) cancelAnimationFrame(e.rAF);
    await new Promise((res) => setTimeout(res, 50));
    // Take over the frame clock: queued callbacks run only when we tick.
    let queue = [];
    window.requestAnimationFrame = (cb) => { queue.push(cb); return queue.length; };
    window.cancelAnimationFrame = () => {};
    let t = performance.now();
    const tick = () => { t += 1000 / hz; const q = queue; queue = []; for (const cb of q) cb(t); };
    e.running = true;
    e._loop(t);
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

test('the same simulated second covers the same ground at 60Hz and 120Hz', async ({ browser }) => {
  const at60 = await travelPerSecond(browser, 60);
  const at120 = await travelPerSecond(browser, 120);
  probe.frameRate = { pxPerSecondAt60: at60, pxPerSecondAt120: at120, ratio120to60: at120 / at60 };
  expect(at60).toBeGreaterThan(0);
});
