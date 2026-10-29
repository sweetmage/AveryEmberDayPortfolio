#!/usr/bin/env node
/**
 * Print the brand identity guide to PDF and per-page PNGs.
 *
 * Loads docs/brand-guide/guide.html in Chromium, waits for fonts and images, then prints
 * every `.page` section as a Letter page. Output goes to docs/brand-guide/out/:
 *   Avery Ember Day Brand Identity Guide.pdf
 *   pages/page-NN.png (review copies, gitignored)
 *
 * Usage: node scripts/build-brand-guide.mjs
 * Plan: docs/plans/2026-10-28-bubble-brand-guide-pdf.md
 */

import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const GUIDE = path.join(ROOT, 'docs/brand-guide/guide.html');
const OUT = path.join(ROOT, 'docs/brand-guide/out');
const PAGES = path.join(OUT, 'pages');
const PDF_NAME = 'Avery Ember Day Brand Identity Guide.pdf';
const EXPECTED_PAGES = 20;
const FONT_FAMILIES = ['Sriracha', 'Outfit', 'Inter'];

await rm(PAGES, { recursive: true, force: true });
await mkdir(PAGES, { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(GUIDE).href, { waitUntil: 'load' });
  await page.addStyleTag({ content: 'html, body { margin: 0 !important; padding: 0 !important; } .page { margin: 0 !important; box-shadow: none !important; }' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() =>
    Promise.all([...document.images].map((img) => (img.complete ? null : img.decode().catch(() => null)))),
  );

  // A failed Google Fonts request resolves fonts.ready with fallback fonts, so check the families loaded.
  const loaded = await page.evaluate(() =>
    [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')),
  );
  const missing = FONT_FAMILIES.filter((family) => !loaded.includes(family));
  if (missing.length) throw new Error(`Fonts not loaded: ${missing.join(', ')}`);

  const pages = page.locator('section.page');
  const count = await pages.count();
  if (count !== EXPECTED_PAGES) throw new Error(`Expected ${EXPECTED_PAGES} pages, found ${count}`);
  for (let i = 0; i < count; i++) {
    const shot = path.join(PAGES, `page-${String(i + 1).padStart(2, '0')}.png`);
    const box = await pages.nth(i).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height };
    });
    await page.screenshot({ path: shot, fullPage: true, clip: box });
  }

  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: path.join(OUT, PDF_NAME),
    format: 'Letter',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true,
    tagged: true,
    outline: true,
  });
  console.log(`Wrote ${count} pages to ${path.relative(ROOT, OUT)}/`);
} finally {
  await browser.close();
}
