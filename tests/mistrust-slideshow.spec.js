import { test, expect } from '@playwright/test';
import { pinnedChromeHeight } from './pinned-chrome.js';

/**
 * Coverage for the "A History of Mistrust" slide stage, lightbox, and grid
 * (rebuilt 2026-07-31; plan archived into docs/archives/plans.md).
 *
 * Drags are driven with `page.mouse`, which emits real Pointer Events —
 * `useSwipeDeck` is pointer-based, so the same code path runs for a finger. The
 * part a mouse cannot exercise is `touch-action`, so that is asserted directly
 * as a computed style: without `pan-y` the browser never hands us the gesture,
 * and vertical page scrolling breaks.
 */

const BASE_URL = 'http://localhost:4322';
const MISTRUST = `${BASE_URL}/projects/#history-of-mistrust`;

async function gotoMistrust(page) {
  await page.goto(MISTRUST, { waitUntil: 'networkidle' });
  await expect(page.locator('.mistrust-stage')).toBeVisible();
}

/** Press, move in `steps`, release. `pauseMs` per step keeps velocity low so the
 *  flick rule stays out of distance-threshold assertions.
 *
 *  Raw `page.mouse` does NOT auto-scroll the way locator actions do, and the
 *  860px 1:1 stage is taller than the 720px default viewport — its centre sits
 *  below the fold, where dispatched events hit nothing (first run of this suite
 *  failed exactly that way: zero pointermoves seen). Scroll first, then keep the
 *  grab point inside the viewport. */
async function drag(page, locator, dx, { steps = 12, pauseMs = 12 } = {}) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  const cx = box.x + box.width / 2;
  const cy = Math.min(
    Math.max(box.y + 20, 0) + Math.min(box.height, viewport.height - Math.max(box.y, 0)) / 2,
    viewport.height - 20
  );
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  for (let s = 1; s <= steps; s++) {
    await page.mouse.move(cx + (dx * s) / steps, cy);
    if (pauseMs) await page.waitForTimeout(pauseMs);
  }
  await page.mouse.up();
}

test.describe('Mistrust slideshow', () => {
  test('renders without console errors', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await gotoMistrust(page);
    await page.locator('.mistrust-nav-next').click();
    await page.locator('.mistrust-set-tab').nth(1).click();

    expect(errors).toEqual([]);
  });

  test('stage declares touch-action: pan-y so vertical scroll survives', async ({ page }) => {
    await gotoMistrust(page);
    const touchAction = await page
      .locator('.mistrust-stage')
      .evaluate((el) => getComputedStyle(el).touchAction);
    expect(touchAction).toBe('pan-y');
  });

  test('Next / Prev step the deck and disable at the ends', async ({ page }) => {
    await gotoMistrust(page);
    const counter = page.locator('.mistrust-counter');
    const next = page.locator('.mistrust-nav-next');
    const prev = page.locator('.mistrust-nav-prev');

    await expect(counter).toHaveText('Slide 1 of 10');
    await expect(prev).toBeDisabled();

    await next.click();
    await expect(counter).toHaveText('Slide 2 of 10');
    await expect(prev).toBeEnabled();

    for (let i = 0; i < 8; i++) await next.click();
    await expect(counter).toHaveText('Slide 10 of 10');
    await expect(next).toBeDisabled();
  });

  test('a swipe past the threshold advances the deck', async ({ page }) => {
    await gotoMistrust(page);
    const stage = page.locator('.mistrust-stage');
    const width = (await stage.boundingBox()).width;

    await drag(page, stage, -width * 0.4);
    await expect(page.locator('.mistrust-counter')).toHaveText('Slide 2 of 10');

    await drag(page, stage, width * 0.4);
    await expect(page.locator('.mistrust-counter')).toHaveText('Slide 1 of 10');
  });

  test('a short slow drag snaps back instead of advancing', async ({ page }) => {
    await gotoMistrust(page);
    const stage = page.locator('.mistrust-stage');

    // ~5% of width, slow enough that the flick rule does not fire either.
    await drag(page, stage, -(await stage.boundingBox()).width * 0.05, { pauseMs: 30 });
    await expect(page.locator('.mistrust-counter')).toHaveText('Slide 1 of 10');
  });

  test('a tap opens the lightbox but a drag does not', async ({ page }) => {
    await gotoMistrust(page);
    const stage = page.locator('.mistrust-stage');
    const overlay = page.locator('.lightbox-overlay');

    // Drag first: this is the regression the old implementation shipped —
    // every swipe also fired the viewer's click handler.
    await drag(page, stage, -(await stage.boundingBox()).width * 0.4);
    await expect(overlay).toHaveCount(0);

    await stage.click();
    await expect(overlay).toBeVisible();
    await expect(page.locator('.lightbox-caption')).toContainText('Set 1');
  });

  test('lightbox closes on Escape and releases the scroll lock', async ({ page }) => {
    await gotoMistrust(page);
    await page.locator('.mistrust-stage').click();
    await expect(page.locator('.lightbox-overlay')).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(page.locator('.lightbox-overlay')).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  });

  test('switching sets resets to slide 1 and changes the artwork', async ({ page }) => {
    await gotoMistrust(page);
    const counter = page.locator('.mistrust-counter');
    const activeImg = page.locator('.mistrust-slide').first().locator('img');

    await page.locator('.mistrust-nav-next').click();
    await expect(counter).toHaveText('Slide 2 of 10');

    await expect(activeImg).toHaveAttribute('src', /slide-01/);
    await page.locator('.mistrust-set-tab').nth(1).click();
    await expect(counter).toHaveText('Slide 1 of 10');
    await expect(page.locator('.mistrust-slide').first().locator('img')).toHaveAttribute(
      'src',
      /slide-11/
    );
  });

  test('filmstrip jumps to the chosen slide', async ({ page }) => {
    await gotoMistrust(page);
    await page.locator('.mistrust-thumb').nth(6).click();
    await expect(page.locator('.mistrust-counter')).toHaveText('Slide 7 of 10');
    await expect(page.locator('.mistrust-thumb').nth(6)).toHaveClass(/is-active/);
  });

  test('keyboard drives the stage', async ({ page }) => {
    await gotoMistrust(page);
    const counter = page.locator('.mistrust-counter');
    await page.locator('.mistrust-stage').focus();

    await page.keyboard.press('ArrowRight');
    await expect(counter).toHaveText('Slide 2 of 10');
    await page.keyboard.press('End');
    await expect(counter).toHaveText('Slide 10 of 10');
    await page.keyboard.press('Home');
    await expect(counter).toHaveText('Slide 1 of 10');
    await page.keyboard.press('ArrowLeft');
    await expect(counter).toHaveText('Slide 1 of 10');
  });

  test('grid shows all 30 slides and opens the lightbox at the right one', async ({ page }) => {
    await gotoMistrust(page);
    const cells = page.locator('.mistrust-grid-cell');
    await expect(cells).toHaveCount(30);

    await cells.nth(13).click();
    await expect(page.locator('.lightbox-caption')).toHaveText('Slide 14 of 30 · Set 2');
  });

  test('alt text stays aligned with the artwork', async ({ page }) => {
    await gotoMistrust(page);

    // The active slide carries the transcribed words; the rest are aria-hidden
    // with empty alt so a screen reader does not read all ten at once.
    const active = page.locator('.mistrust-slide').first().locator('img');
    await expect(active).toHaveAttribute('alt', /Why Some Communities Struggle to Trust Doctors/);

    // Set title cards must land on 1 / 11 / 21 — the Math.ceil(n/10) set math
    // depends on it, and these twelve strings were out of order before Entry 106.
    await page.locator('.mistrust-set-tab').nth(1).click();
    await expect(page.locator('.mistrust-slide').first().locator('img')).toHaveAttribute(
      'alt',
      'AIDS Care in Marginalized Communities'
    );
    await page.locator('.mistrust-set-tab').nth(2).click();
    await expect(page.locator('.mistrust-slide').first().locator('img')).toHaveAttribute(
      'alt',
      'Rebuilding Trust Between Marginalized Communities & Healthcare Providers'
    );
  });
});

/* The stage follows the same one-screen rule as the gallery art (user call,
   2026-08-07). It is a 1:1 `flex: 1` box, so its height IS the row width minus
   the nav bars — which is why the cap is expressed on the row's max-width. A
   `max-height` on the stage would fight its own aspect-ratio and strand the
   bars beside a narrower frame. */
test.describe('mistrust stage height budget', () => {
  for (const vp of [
    { width: 2560, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1440, height: 620 },
    { width: 900, height: 700 },
    { width: 390, height: 844 },
    { width: 360, height: 640 },
  ]) {
    test(`stage fits the screen under the nav @ ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await gotoMistrust(page);

      // Measured pinned chrome, not the nav's height — see tests/pinned-chrome.js.
      const navHeight = await pinnedChromeHeight(page);
      const stageHeight = await page.locator('.mistrust-stage')
        .evaluate((el) => el.getBoundingClientRect().height);

      expect(stageHeight).toBeGreaterThan(0);
      expect(stageHeight).toBeLessThanOrEqual(vp.height - navHeight + 1);
    });
  }

  test('the cap does not shrink the stage on a tall screen', async ({ page }) => {
    // Below the cap nothing may change: 964px - 104px of bars = an 860px stage.
    await page.setViewportSize({ width: 1440, height: 1200 });
    await gotoMistrust(page);

    const stageWidth = await page.locator('.mistrust-stage')
      .evaluate((el) => el.getBoundingClientRect().width);
    expect(Math.round(stageWidth)).toBe(860);
  });
});

/* Mistrust leads the Projects page, and the whole viewer fits one screen.
   User calls, 2026-08-07. */
test.describe('mistrust leads the projects page', () => {
  test('it is the first tab and the default panel', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/projects/`, { waitUntil: 'networkidle' });

    const firstTab = await page.locator('.project-tab').first().textContent();
    expect(firstTab.trim()).toBe('A History of Mistrust');

    // Landing on /projects/ with no hash must open it, not merely list it first.
    await expect(page.locator('#panel-history-of-mistrust')).toBeVisible();
    await expect(page.locator('.mistrust-stage')).toBeVisible();

    /* DOM order has to follow the tab order too. A tabpanel that precedes its
       own tab in the document reverses the reading and tab-through order for
       anyone not using a mouse, while looking perfectly correct on screen. */
    const panelsInOrder = await page.$$eval('[role="tabpanel"]', (els) => els.map((e) => e.id));
    expect(panelsInOrder[0]).toBe('panel-history-of-mistrust');
  });

  /* The STAGE is not the whole viewer. Capping only the stage still left the
     block at 1015px against an 824px budget, because the set tabs, filmstrip
     and swipe hint add ~191px on top — hence `--stage-chrome`. */
  for (const vp of [
    { width: 2560, height: 1440 },
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1440, height: 620 },
    { width: 390, height: 844 },
  ]) {
    test(`the whole slideshow fits one screen @ ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await gotoMistrust(page);

      const nav = await pinnedChromeHeight(page);
      const block = await page.evaluate(
        () => document.querySelector('.mistrust-slideshow').getBoundingClientRect().height
      );

      expect(block).toBeGreaterThan(0);
      expect(block, `slideshow ${Math.round(block)}px vs ${Math.round(vp.height - nav)}px budget`)
        .toBeLessThanOrEqual(vp.height - nav + 1);
    });
  }
});
