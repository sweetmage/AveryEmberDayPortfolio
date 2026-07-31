#!/usr/bin/env node
/**
 * Render the social share card (`images/og-default.png`) from the live hero.
 *
 * The card is a screenshot of the real homepage hero rather than a hand-drawn lookalike, so it
 * cannot drift from the site: re-run this after any hero change and the card follows. Written to
 * BOTH `images/` and `public/` — `public/` is what the Next export serves.
 *
 * Requires the dev server: `npm run dev` (default http://localhost:3000).
 * Usage: node scripts/generate-og-image.js [--url http://localhost:3000] [--theme dark|light]
 * Plan: docs/plans/2026-07-27-contact-unhide-mistrust-assets.md
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT = ['images/og-default.png', 'public/images/og-default.png'];

// Facebook/Discord/Twitter all render 1.91:1; 1200x630 is the universally safe size.
const WIDTH = 1200;
const HEIGHT = 630;

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const url = arg('--url', 'http://localhost:3000');
const theme = arg('--theme', 'dark');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
  });

  // Reduced motion is what makes this reproducible: the hero blobs stop mid-drift at their
  // declared positions instead of wherever the animation happened to be, so two runs of an
  // unchanged hero produce the same card.
  await page.emulateMedia({ reducedMotion: 'reduce' });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  } catch {
    console.error(`Could not reach ${url}. Start the dev server first: npm run dev`);
    await browser.close();
    process.exit(1);
  }

  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);

  // Strip the page chrome. A share card wants the hero, not the site's navigation.
  // `nextjs-portal` is the dev-tools overlay — it is a real element in the DOM and WILL be
  // captured into the card if left alone (it was, on the first run: a red "3 Issues" badge).
  await page.addStyleTag({
    content: `
      .brand-nav, .brand-footer, #return-to-top, .skip-link { display: none !important; }
      nextjs-portal, [data-nextjs-toast], #__next-build-watcher { display: none !important; }
      /* pt-20 exists to clear the fixed nav; with the nav gone it pushes the hero off-centre. */
      #hero { padding-top: 0 !important; min-height: 100vh !important; }
      /* The hero fills a tall viewport; in a 1.91:1 crop the same type reads small once
         Discord scales the card down. Nudge the content block up without touching the site. */
      .brand-hero-content { transform: scale(1.15); }
      /* Brand signature: the spectrum bar normally sits directly under the hero, so the card
         keeps it as a bottom edge rather than cropping it away. */
      #hero::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        bottom: 0;
        height: 6px;
        background: var(--brand-spectrum, linear-gradient(90deg,
          var(--brand-accent), var(--brand-neon), var(--brand-gold), var(--brand-accent)));
        z-index: 5;
      }
    `,
  });

  await page.waitForTimeout(400);

  const shot = await page.locator('#hero').screenshot({ type: 'png' });

  // Captured at 2x for crisp type, then downsampled to the declared 1200x630. A 2x PNG of a
  // gradient-heavy hero lands near 2 MB, which is a slow unfurl for no visible gain at the size
  // Discord and Twitter actually render.
  const buf = await sharp(shot)
    .resize(WIDTH, HEIGHT, { fit: 'fill' })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toBuffer();

  for (const rel of OUT) {
    const dest = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    console.log(`${rel} — ${WIDTH}x${HEIGHT}, ${Math.round(buf.length / 1024)} KB`);
  }

  await browser.close();
})();
