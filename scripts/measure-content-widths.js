#!/usr/bin/env node
/**
 * Assert the shared content geometry: every page section must share one left edge and one right
 * inset at every viewport.
 *
 * This is a real contract, not a preference. Before 2026-07-28 the Projects/Gallery titles, the
 * Contact heading and the Home About box sat on three different left edges (44 / 144 / 208 at
 * 1440px), and the gap widened with the viewport because three different max-widths and three
 * different gutter systems were in play. The visual baseline suite cannot catch that — it grades
 * each page against its own past self, so a page that has always been misaligned stays green.
 *
 * Requires the dev server. Pass the port if it is not 3000 (`next dev` will hop to 3001 if
 * something else holds 3000 — check its output, do not assume).
 *
 * Usage: node scripts/measure-content-widths.js [port]
 * Exits non-zero if any viewport has more than one distinct section edge.
 */

const { chromium } = require('playwright');

const PORT = process.argv[2] || '3000';
const WIDTHS = [768, 1024, 1440, 2560, 3440];

// `section: true` participates in the shared-edge assertion. The others are measured for
// information only — they are deliberately capped narrower INSIDE the shared container (a
// readable prose measure, a form that should not be 1352px wide), so they share the left edge
// but not the width.
const TARGETS = [
  { url: '/', label: 'About heading', sel: '#about h2', section: true },
  { url: '/', label: 'About box', sel: '.about-box' },
  { url: '/projects/', label: 'Projects title', sel: '.brand-page-title', section: true },
  { url: '/gallery/', label: 'Gallery title', sel: '.brand-page-title', section: true },
  { url: '/contact/', label: 'Contact h1', sel: 'main h1', section: true },
  { url: '/contact/', label: 'Contact form', sel: 'form[name="contact"]' },
];

(async () => {
  const browser = await chromium.launch();
  let failures = 0;

  for (const width of WIDTHS) {
    const rows = [];
    for (const t of TARGETS) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      try {
        await page.goto(`http://localhost:${PORT}${t.url}`, { waitUntil: 'networkidle', timeout: 15000 });
      } catch {
        console.error(`Could not reach localhost:${PORT}. Start the dev server: npm run dev`);
        await browser.close();
        process.exit(1);
      }
      const r = await page.evaluate((s) => {
        const el = document.querySelector(s);
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { left: Math.round(b.left), right: Math.round(b.right) };
      }, t.sel);
      await page.close();
      if (!r) {
        console.error(`  MISSING: ${t.label} (${t.sel}) on ${t.url}`);
        failures++;
        continue;
      }
      rows.push({ ...t, ...r, rightInset: width - r.right });
    }

    const sections = rows.filter((r) => r.section);
    const lefts = [...new Set(sections.map((r) => r.left))];
    const insets = [...new Set(sections.map((r) => r.rightInset))];
    const ok = lefts.length === 1 && insets.length === 1;
    if (!ok) failures++;

    console.log(`\n${ok ? 'ok  ' : 'FAIL'} ${width}px — section edge left=${lefts.join('/')} rightInset=${insets.join('/')}`);
    for (const r of rows) {
      console.log(
        `       ${r.section ? '*' : ' '} ${r.label.padEnd(16)} left=${String(r.left).padStart(5)} rightInset=${String(r.rightInset).padStart(5)}`
      );
    }
  }

  await browser.close();
  console.log(failures ? `\n${failures} problem(s)` : '\nAll viewports share one section edge');
  process.exit(failures ? 1 : 0);
})();
