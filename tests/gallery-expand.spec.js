import { test, expect } from '@playwright/test';
import { pinnedChromeHeight } from './pinned-chrome.js';

// Must match the `serve out` webServer port started in global-setup.js.
const BASE_URL = 'http://localhost:4322';

/**
 * Coverage for the gallery expand-on-click interaction.
 *
 * The visual-baseline suite cannot see any of this. It captures under
 * `prefers-reduced-motion: reduce`, where every animation in this feature is
 * disabled by design, and it only ever captures the collapsed grid — so the
 * entire interaction is invisible to it. That is the same blind spot that let a
 * bubble regression survive a week (LOGBOOK Entry 090), and it is why this file
 * exists.
 *
 * Concept: 2026-08-01-gallery-expand-motion-concept
 * Implementation plan: 2026-08-05-gallery-expand-implementation
 * (both archived — docs/archives/plans.md; the current rules live in AGENTS.md)
 */

/*
 * Serial, for the same reason `bubbles-exclusion.spec.js` is: the bubble-zone
 * case below runs the physics engine with motion enabled, and that engine
 * integrates a fixed velocity PER FRAME rather than scaling by elapsed time.
 * Anything else holding a worker starves rAF and the assertion reads exactly
 * like a real regression.
 *
 * NOT given its own Playwright project. That was tried for the bubble spec on
 * 2026-08-03 and reverted the same day (Entry 115): contention was never the
 * real cause there, the isolation bought nothing, and two green runs had been
 * noise. In-file serial is the part that earned its keep.
 */
test.describe.configure({ mode: 'serial' });

/** Instruments `document.startViewTransition` so tests can prove which path ran. */
async function countViewTransitions(page) {
  await page.addInitScript(() => {
    window.__vtCalls = 0;
    const original = document.startViewTransition;
    if (typeof original === 'function') {
      document.startViewTransition = function (callback) {
        window.__vtCalls += 1;
        return original.call(this, callback);
      };
    }
  });
}

/** Wait for the idle-deferred bubble engine, then let the physics settle. */
async function waitForEngine(page, settleFrames = 300) {
  await page.waitForFunction(() => typeof window.__bubbleEngine !== 'undefined', null, { timeout: 15000 });
  await page.waitForFunction(() => document.querySelectorAll('.brand-bubble').length > 0, null, { timeout: 15000 });
  await page.evaluate(async (frames) => {
    for (let i = 0; i < frames; i++) {
      await new Promise((r) => requestAnimationFrame(() => r()));
    }
  }, settleFrames);
}

const toggle = (page, caption) =>
  page.getByRole('button', { name: new RegExp(`^(Expand|Collapse) ${caption}$`) });

const card = (page, caption) =>
  page.locator('.gallery-item').filter({ has: page.getByRole('heading', { name: caption, exact: true }) });

test.describe('gallery expand-on-click', () => {
  test('aria-expanded flips and the card grows in both axes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    const target = card(page, 'In Danger');
    const button = toggle(page, 'In Danger');

    await expect(button).toHaveAttribute('aria-expanded', 'false');
    const before = await target.boundingBox();

    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    // The view transition animates a snapshot overlay; wait for the real box to
    // settle rather than measuring mid-tween.
    await expect.poll(async () => (await target.boundingBox()).width).toBeGreaterThan(before.width);
    const after = await target.boundingBox();

    // Both axes. At xl the card spans 2 of 3 columns and 2 row tracks, so a
    // width-only growth would mean the row-span rule silently stopped applying.
    expect(after.width).toBeGreaterThan(before.width);
    expect(after.height).toBeGreaterThan(before.height);
  });

  test('opening a second card collapses the first', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    const first = toggle(page, 'In Danger');
    const second = toggle(page, 'Chill');

    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'true');

    await second.click();
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    // Multiple open cards turn the grid into a ragged column and destroy the
    // scan-ability the gallery exists for.
    await expect(first).toHaveAttribute('aria-expanded', 'false');
  });

  test('Escape collapses the open card from anywhere on the page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    const button = toggle(page, 'In Danger');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    // Move focus off the trigger first. A button-scoped handler would pass a
    // naive version of this test and fail the real case, which is a user who
    // clicked the card and then moved the mouse.
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('Escape');

    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  test('focus stays on the trigger through expand and collapse', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    const button = toggle(page, 'In Danger');

    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(button).toBeFocused();

    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
  });

  test('reduced motion changes state without starting a view transition', async ({ page }) => {
    await countViewTransitions(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    const button = toggle(page, 'In Danger');
    await button.click();

    // The feature must remain fully functional under reduced motion...
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    // ...and must have bypassed the API entirely rather than starting a
    // transition and hoping CSS disabled it. A view transition animates by
    // default, so honouring the preference is opt-OUT.
    expect(await page.evaluate(() => window.__vtCalls)).toBe(0);
  });

  test('with motion enabled the expand does go through a view transition', async ({ page }) => {
    await countViewTransitions(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    // The negative test above passes just as well if the API is never called at
    // all, so pair it with the positive case or the whole path can rot unnoticed.
    await toggle(page, 'In Danger').click();
    await expect(toggle(page, 'In Danger')).toHaveAttribute('aria-expanded', 'true');
    expect(await page.evaluate(() => window.__vtCalls)).toBe(1);
  });

  test('filtering collapses an open card that no longer matches', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    // "In Danger" is Digital-only, so the Traditional filter removes it.
    const button = toggle(page, 'In Danger');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    await page.getByRole('button', { name: 'Traditional', exact: true }).click();
    await expect(card(page, 'In Danger')).toHaveCount(0);

    // Back to All: it returns collapsed, not still-expanded.
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(toggle(page, 'In Danger')).toHaveAttribute('aria-expanded', 'false');
  });

  test('filtering leaves an open card that still matches open', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    // "Chill" is tagged Traditional AND Digital, so it survives the Digital filter.
    const button = toggle(page, 'Chill');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    await page.getByRole('button', { name: 'Digital', exact: true }).click();
    await expect(card(page, 'Chill')).toHaveCount(1);
    // Collapsing a card that survived its filter would be a pointless dismissal.
    await expect(toggle(page, 'Chill')).toHaveAttribute('aria-expanded', 'true');
  });

  test('expanded art never exceeds one screen under the nav', async ({ page }) => {
    // Short viewport: this is where a `vh`/`dvh` or missing-nav-subtraction
    // mistake actually shows up. At 900px tall the cap rarely binds.
    await page.setViewportSize({ width: 1440, height: 720 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    await toggle(page, 'In Danger').click();
    await expect(toggle(page, 'In Danger')).toHaveAttribute('aria-expanded', 'true');

    const art = card(page, 'In Danger').locator('.gallery-item-art');
    await expect.poll(async () => Math.round((await art.boundingBox()).height)).toBeGreaterThan(0);

    const overlay = await pinnedChromeHeight(page);
    const artHeight = (await art.boundingBox()).height;

    // Pinned chrome overlays the page, so "one screen" has to mean the viewport
    // minus whatever is actually pinned, or the top of every tall piece sits
    // underneath it. Measured rather than assumed: below 768px nothing is
    // pinned and the art may legitimately use the full height.
    expect(artHeight).toBeLessThanOrEqual(720 - overlay + 1);
  });

  /* One screen, at every screen. The single 1440x720 case above proves the
     `dvh`/nav arithmetic; this proves the cap actually binds across the range,
     including the phone widths where `dvh` differs from `vh` and the short
     desktop where the cap does the most work. */
  for (const vp of [
    { width: 2560, height: 1080 },
    { width: 1440, height: 620 },
    { width: 900, height: 700 },
    { width: 390, height: 844 },
    { width: 360, height: 640 },
  ]) {
    test(`expanded art fits the screen under the nav @ ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

      await page.locator('.gallery-item-toggle').first().click();
      await page.waitForTimeout(500);

      const overlay = await pinnedChromeHeight(page);
      const artHeight = await page.locator('.gallery-item[data-expanded="true"] .gallery-item-art')
        .evaluate((el) => el.getBoundingClientRect().height);

      expect(artHeight).toBeGreaterThan(0);
      expect(artHeight).toBeLessThanOrEqual(vp.height - overlay + 1);
    });
  }

  test('the art box matches the artwork ratio, collapsed and expanded', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    /* This is the structural guarantee against the shrink-then-grow, and it is
       worth more than measuring the animation itself.

       A view transition snapshots the element BOX. While the box was the whole
       art area with the picture letterboxed inside it by `object-contain`, the
       two states letterboxed by different amounts — so at the first frame the
       picture appeared at ~90% of the size it had just been and grew out of it
       (measured 2026-08-07). When the box equals the picture in both states,
       the tween is a uniform scale and cannot shrink first.

       So: assert the box carries the artwork's own ratio. If someone reinstates
       `w-full`/`flex-1` on the image, this fails. */
    const ratios = async () => page.$$eval('.gallery-item-art', (imgs) =>
      imgs.map((el) => {
        const r = el.getBoundingClientRect();
        // width/height attributes are the artwork's true dimensions.
        const declared = Number(el.getAttribute('width')) / Number(el.getAttribute('height'));
        return { box: r.width / r.height, declared };
      }));

    for (const { box, declared } of await ratios()) {
      expect(Math.abs(box - declared)).toBeLessThan(0.01);
    }

    await page.locator('.gallery-item-toggle').first().click();
    await page.waitForTimeout(600);

    const expanded = await page.$eval('.gallery-item[data-expanded="true"] .gallery-item-art', (el) => {
      const r = el.getBoundingClientRect();
      return {
        box: r.width / r.height,
        declared: Number(el.getAttribute('width')) / Number(el.getAttribute('height')),
      };
    });
    expect(Math.abs(expanded.box - expanded.declared)).toBeLessThan(0.01);
  });

  test('expanding a card already in view does not scroll the page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    // Since 2026-10-05 the gallery sits below the project tiles on /portfolio/,
    // so bring its first row into view first, comfortably below the nav. From
    // there the first row needs no correction. `scrollIntoView({ block: 'nearest' })` failed exactly here: once
    // expanded the card is taller than the viewport, and 'nearest' on an
    // oversized element jumps to an edge, cutting the card's head off above the
    // nav and dumping the user in the middle of the artwork.
    await page.evaluate(() => {
      const html = document.documentElement;
      html.style.scrollBehavior = 'auto';
      const card = document.querySelector('.gallery-item');
      window.scrollTo(0, card.getBoundingClientRect().top + window.scrollY - 200);
    });
    const before = await page.evaluate(() => window.scrollY);
    await toggle(page, 'In Danger').click();
    await expect(toggle(page, 'In Danger')).toHaveAttribute('aria-expanded', 'true');
    await page.waitForTimeout(600); // let a smooth scroll happen if one is going to

    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });

  test('expanding a card low on the page brings it back into view', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    /* Park the target near the bottom of the viewport first, which is the case
       the scroll correction exists for. Deliberately NOT the last item: the page
       cannot scroll past its own end, so the bottom card's top can never reach
       the nav and the assertion would be measuring the document height rather
       than the behaviour. */
    await page.evaluate(() => {
      const card = [...document.querySelectorAll('.gallery-item')]
        .find((el) => el.querySelector('h3')?.textContent === 'Overflow');
      window.scrollBy({ top: card.getBoundingClientRect().top - window.innerHeight * 0.8, behavior: 'instant' });
    });

    const button = toggle(page, 'Overflow');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await page.waitForTimeout(900);

    const navHeight = await pinnedChromeHeight(page);
    const { cardTop, viewportHeight } = await page.evaluate(() => {
      const card = [...document.querySelectorAll('.gallery-item')]
        .find((el) => el.getAttribute('data-expanded') === 'true');
      return {
        cardTop: card.getBoundingClientRect().top,
        viewportHeight: window.innerHeight,
      };
    });

    /* The band, not an exact landing point. Aiming the card's top AT the nav
       would be asserting the document is tall enough to get it there: expanding
       this card makes it the effective last row, so the scroll clamps at the end
       of the page and the top settles partway. That is correct behaviour — the
       requirement is that the card is no longer shoved into the bottom of the
       screen and its head is not under the nav. */
    expect(cardTop).toBeGreaterThanOrEqual(navHeight - 1);
    expect(cardTop).toBeLessThanOrEqual(viewportHeight * 0.5);
  });

  test('the companion tile does not stretch to match an expanded card', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    const companion = card(page, 'Chill');
    const before = (await companion.boundingBox()).height;

    await toggle(page, 'In Danger').click();
    await expect(toggle(page, 'In Danger')).toHaveAttribute('aria-expanded', 'true');
    await page.waitForTimeout(600);

    const expanded = (await card(page, 'In Danger').boundingBox()).height;
    const after = (await companion.boundingBox()).height;

    /* The whole reason the grid switches to content-sized tracks and
       `align-items: start` while a card is open. If the neighbour stretched to
       the open card's height, the expand would read as "everything got huge" —
       the exact failure the row-span design existed to prevent, and which a
       naive `auto-rows: auto` alone would reintroduce. */
    expect(expanded).toBeGreaterThan(after + 100);
    expect(after).toBeLessThanOrEqual(before + 1);
  });

  test('the grid reserves no empty track under an expanded card', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    await toggle(page, 'In Danger').click();
    await expect(toggle(page, 'In Danger')).toHaveAttribute('aria-expanded', 'true');
    await page.waitForTimeout(600);

    /* The open card must be exactly as tall as its own row, not shorter than a
       multi-track reservation. Before 2026-08-06 the card spanned two `1fr`
       tracks and needed about one and a half, leaving whitespace below it. */
    const { cardHeight, rowHeight } = await page.evaluate(() => {
      const el = document.querySelector('.gallery-item[data-expanded="true"]');
      const grid = document.querySelector('.gallery-grid');
      const rows = getComputedStyle(grid).gridTemplateRows.split(' ').map(parseFloat);
      return { cardHeight: el.getBoundingClientRect().height, rowHeight: rows[0] };
    });

    expect(Math.abs(cardHeight - rowHeight)).toBeLessThanOrEqual(2);
  });

  test('every card carries a unique view-transition-name', async ({ page }) => {
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    const names = await page.$$eval('.gallery-item', (cards) =>
      cards.map((el) => el.style.viewTransitionName));

    expect(names.length).toBeGreaterThan(0);
    expect(names.every(Boolean)).toBe(true);
    // Duplicates break the transition silently — no error, no visual signal.
    expect(new Set(names).size).toBe(names.length);
  });

  /*
   * The row rule: an expanded card stays on the row it was clicked on, and the
   * card it displaces slides down to lead the next row.
   *
   * These read geometry rather than DOM indices on purpose — the implementation
   * reorders the array, so an index-based assertion would pass by describing the
   * reorder back to itself instead of checking what the user sees.
   */
  async function rowTops(page) {
    return page.$$eval('.gallery-item', (cards) =>
      cards.map((el) => {
        const rect = el.getBoundingClientRect();
        return { top: Math.round(rect.top + window.scrollY), expanded: el.dataset.expanded === 'true' };
      }));
  }

  test('expanding the LAST card in a row keeps it on that row', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    // 1440px is the 3-column layout; the third card is last in row one.
    const before = await rowTops(page);
    const firstRowTop = before[0].top;
    expect(before[1].top).toBe(firstRowTop);
    expect(before[2].top).toBe(firstRowTop);

    await page.locator('.gallery-item-toggle').nth(2).click();
    await page.waitForTimeout(600);

    const after = await rowTops(page);
    const expanded = after.find((c) => c.expanded);

    // The card that was clicked is still on the top row, not wrapped below it.
    expect(expanded.top).toBe(firstRowTop);

    // Exactly two cards remain on that row: the expanded one (spanning two
    // columns) and one neighbour. The third has been pushed off.
    const onFirstRow = after.filter((c) => c.top === firstRowTop);
    expect(onFirstRow.length).toBe(2);
  });

  test('the displaced card slides down rather than vanishing', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    const count = await page.locator('.gallery-item').count();

    await page.locator('.gallery-item-toggle').nth(2).click();
    await page.waitForTimeout(600);

    // Nothing is removed or hidden by the reflow — the pushed card is still
    // rendered, just on a later row.
    expect(await page.locator('.gallery-item').count()).toBe(count);
    expect(await page.locator('.gallery-item:visible').count()).toBe(count);

    const after = await rowTops(page);
    const firstRowTop = Math.min(...after.map((c) => c.top));
    const displaced = after.filter((c) => c.top > firstRowTop);
    expect(displaced.length).toBe(count - 2);
  });

  test('expanding a NON-last card leaves its row start alone', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    const before = await rowTops(page);
    const firstRowTop = before[0].top;

    // The first card in a row grows rightwards; no rotation is needed and the
    // row must not be reshuffled behind the user's back.
    await page.locator('.gallery-item-toggle').nth(0).click();
    await page.waitForTimeout(600);

    const after = await rowTops(page);
    const expanded = after.find((c) => c.expanded);
    expect(expanded.top).toBe(firstRowTop);

    const onFirstRow = after.filter((c) => c.top === firstRowTop);
    expect(onFirstRow.length).toBe(2);
  });

  test('the row rule holds at the 2-column breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    const before = await rowTops(page);
    const firstRowTop = before[0].top;
    expect(before[1].top).toBe(firstRowTop);

    // Second card is last in a 2-column row: it takes the full row and the
    // first card is pushed down.
    await page.locator('.gallery-item-toggle').nth(1).click();
    await page.waitForTimeout(600);

    const after = await rowTops(page);
    const expanded = after.find((c) => c.expanded);
    expect(expanded.top).toBe(firstRowTop);
    expect(after.filter((c) => c.top === firstRowTop).length).toBe(1);
  });

  /* No diagonals: every card that moves does so along ONE axis, by one space.
     The failure this guards is auto-placement's wrap — a card at the end of a
     row jumping to the START of the next one, which sweeps it diagonally across
     the whole grid. */
  /* Top-LEFT, not centre. While a card is open the grid stops stretching cards
     to a uniform height (`align-items: start`), so a card can change height
     without moving — which shifts its centre and would read as a phantom
     diagonal. The corner is the card's actual grid position. */
  async function corners(page) {
    return page.$$eval('.gallery-item', (cards) =>
      Object.fromEntries(cards.map((el) => {
        const r = el.getBoundingClientRect();
        const src = el.querySelector('.gallery-item-art').getAttribute('src');
        return [src, { x: r.left, y: r.top + window.scrollY, expanded: el.dataset.expanded === 'true' }];
      })));
  }

  for (const index of [0, 1, 2]) {
    test(`cards move on one axis only, expanding card ${index} of a row of 3`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

      const before = await corners(page);
      const keys = Object.keys(before);
      // Column pitch, measured rather than assumed.
      const pitch = before[keys[1]].x - before[keys[0]].x;

      await page.locator('.gallery-item-toggle').nth(index).click();
      await page.waitForTimeout(700);

      const after = await corners(page);

      for (const src of keys) {
        // The expanded card GROWS; it is not travelling, so it is not judged here.
        if (after[src].expanded) continue;

        const dx = after[src].x - before[src].x;
        const dy = after[src].y - before[src].y;

        if (Math.abs(dx) > 2) {
          // Horizontal movers must be purely horizontal, and exactly one column.
          expect(Math.abs(dy), `${src} moved diagonally (dx=${dx.toFixed(0)}, dy=${dy.toFixed(0)})`).toBeLessThan(3);
          expect(Math.abs(Math.abs(dx) - Math.abs(pitch)),
            `${src} moved ${Math.abs(dx).toFixed(0)}px, not one column (${Math.abs(pitch).toFixed(0)}px)`).toBeLessThan(3);
        }
      }
    });
  }

  test('every artwork carries its own name, distinct from the cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    // The art is captured separately from its card so it tweens as its own
    // element instead of being flattened into the card snapshot. That only
    // holds while every name in the document is unique — a card and its own
    // artwork colliding would drop both out of the transition with no error.
    const { cards, art } = await page.evaluate(() => ({
      cards: [...document.querySelectorAll('.gallery-item')].map((el) => el.style.viewTransitionName),
      art: [...document.querySelectorAll('.gallery-item-art')].map((el) => el.style.viewTransitionName),
    }));

    expect(art.length).toBe(cards.length);
    expect(art.every(Boolean)).toBe(true);

    const all = [...cards, ...art];
    expect(new Set(all).size).toBe(all.length);
  });

  test('filter entrants alone receive the entrance stagger and clear it at rest', async ({ page }) => {
    await page.addInitScript(() => {
      const original = document.startViewTransition;
      window.__filterTransitionState = null;
      if (typeof original !== 'function') return;
      document.startViewTransition = function (callback) {
        return original.call(this, () => {
          callback();
          window.__filterTransitionState = [...document.querySelectorAll('.gallery-item')].map((card) => ({
            caption: card.querySelector('h3')?.textContent,
            viewTransitionClass: getComputedStyle(card).viewTransitionClass,
            cardName: card.style.viewTransitionName,
            artName: card.querySelector('.gallery-item-art')?.style.viewTransitionName,
            top: card.getBoundingClientRect().top,
            left: card.getBoundingClientRect().left,
          }));
        });
      };
    });
    await page.goto(`${BASE_URL}/portfolio/#filter=digital`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('button', { name: 'Digital' })).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: 'All' }).click();
    await page.waitForFunction(() => window.__filterTransitionState !== null);

    const during = await page.evaluate(() => window.__filterTransitionState);
    const entering = during.filter((card) => card.viewTransitionClass.includes('gallery-enter'));
    const staying = during.filter((card) => !card.viewTransitionClass.includes('gallery-enter'));
    expect(entering.length).toBeGreaterThan(0);
    expect(staying.length).toBeGreaterThan(0);
    expect(entering.every((card) => !card.artName)).toBe(true);
    expect(staying.every((card) => Boolean(card.artName))).toBe(true);

    const expectedPseudos = entering.map((card) => `::view-transition-new(${card.cardName})`);
    const animations = () => page.evaluate((pseudos) => document.getAnimations()
      // The slide (transform) carries the stagger; its paired fade starts with it.
      .filter((animation) => pseudos.includes(animation.effect?.pseudoElement)
        && animation.effect.getKeyframes().some((frame) => frame.transform))
      .map((animation) => ({ pseudo: animation.effect.pseudoElement, delay: animation.effect.getTiming().delay })), expectedPseudos);
    await expect.poll(async () => (await animations()).length).toBe(entering.length);
    const stagger = await animations();
    expect(stagger.sort((a, b) => expectedPseudos.indexOf(a.pseudo) - expectedPseudos.indexOf(b.pseudo))
      .map((animation) => animation.delay)).toEqual(expectedPseudos.map((_, rank) => rank * 25));

    await page.waitForFunction(() => document.querySelectorAll('.gallery-item').length > 0
      && [...document.querySelectorAll('.gallery-item')].every((card) =>
        !getComputedStyle(card).viewTransitionClass.includes('gallery-enter')
        && Boolean(card.querySelector('.gallery-item-art').style.viewTransitionName)));
  });

  /* Filtering follows the same no-diagonals rule as expanding (user, 2026-08-07
     and 2026-10-05). The browser tweens each group in a straight line, so the
     component adds a corner keyframe: horizontal first, then vertical. */
  for (const [from, to] of [['Digital', 'All'], ['All', 'Traditional']]) {
    test(`filtering ${from} → ${to} moves no card on a diagonal`, async ({ page }) => {
      await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });
      if (from !== 'All') {
        await page.getByRole('button', { name: from }).click();
        await page.waitForTimeout(900);
      }

      const paths = await page.evaluate(async (target) => {
        [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === target).click();
        await new Promise((resolve) => setTimeout(resolve, 60));
        const xy = (t) => {
          const m = /matrix\(([^)]+)\)/.exec(t || '');
          if (!m) return null;
          const v = m[1].split(',').map(Number);
          return [v[4], v[5]];
        };
        return document.getAnimations()
          .filter((a) => a.effect?.pseudoElement?.startsWith('::view-transition-group(vt-gal-'))
          .map((a) => ({ pseudo: a.effect.pseudoElement, points: a.effect.getKeyframes().map((k) => xy(k.transform)) }))
          .filter((p) => p.points.every(Boolean));
      }, to);

      const moving = paths.filter(({ points }) => {
        const [a, z] = [points[0], points[points.length - 1]];
        return Math.abs(a[0] - z[0]) >= 1 || Math.abs(a[1] - z[1]) >= 1;
      });
      expect(moving.length, 'some card should move on this filter change').toBeGreaterThan(0);
      for (const { pseudo, points } of moving) {
        for (let i = 1; i < points.length; i += 1) {
          const dx = Math.abs(points[i][0] - points[i - 1][0]);
          const dy = Math.abs(points[i][1] - points[i - 1][1]);
          expect(dx < 1 || dy < 1, `${pseudo} leg ${i} is diagonal: ${JSON.stringify(points)}`).toBe(true);
        }
      }
    });
  }

  test('cards a filter removes slide one space out instead of fading in place', async ({ page }) => {
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });
    const result = await page.evaluate(async () => {
      const before = [...document.querySelectorAll('.gallery-item')].length;
      [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Traditional').click();
      await new Promise((resolve) => setTimeout(resolve, 60));
      const old = document.getAnimations().filter((a) => /^::view-transition-old\(vt-gal-\d+\)$/.test(a.effect?.pseudoElement || ''));
      const slides = old.filter((a) => a.effect.getKeyframes().some((k) => /translateX/.test(k.transform || '')));
      // Only the leaving cards' own pseudos: a staying card's old snapshot keeps
      // the browser's cross-fade into its new one, which is unchanged.
      const leavingPseudos = new Set(slides.map((a) => a.effect.pseudoElement));
      const uaFades = old.filter((a) => a.animationName && leavingPseudos.has(a.effect.pseudoElement));
      const after = await new Promise((resolve) => setTimeout(() => resolve(document.querySelectorAll('.gallery-item').length), 1200));
      return { removed: before - after, slides: slides.length, uaFades: uaFades.length,
        distances: slides.map((a) => a.effect.getKeyframes().at(-1).transform) };
    });
    expect(result.removed).toBeGreaterThan(0);
    expect(result.slides).toBe(result.removed);
    expect(result.uaFades, 'the browser fade-out should be replaced, not stacked').toBe(0);
    for (const t of result.distances) expect(t).toMatch(/^translateX\(-?\d+(\.\d+)?px\)$/);
  });

  /* A click that lands while a filter transition is still running skips that
     transition, which REJECTS its `ready`. Uncaught, that is a page error in
     both engines ("Transition was skipped" / AbortError), measured 2026-10-04.
     The entering state must also land on the newest filter, not a stale one. */
  test('rapid filter changes raise no page error and settle with no entering state', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    /* One task, three clicks: the first two transitions are skipped by the third.
       Playwright's own click() cannot do this — it waits for the view-transition
       overlay to stop intercepting the pointer, so it serialises the clicks. */
    await page.evaluate(() => {
      const button = (name) => [...document.querySelectorAll('button')]
        .find((b) => b.textContent.trim() === name);
      button('Digital').click();
      button('Traditional').click();
      button('All').click();
    });

    await expect(page.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(async () => {
      const text = await page.locator('[aria-live="polite"]').filter({ hasText: /^Showing / }).textContent();
      const [, shown, total] = text.match(/Showing (\d+) of (\d+) works/);
      return shown === total;
    }).toBe(true);
    await page.waitForFunction(() => [...document.querySelectorAll('.gallery-item')].every((card) =>
      !getComputedStyle(card).viewTransitionClass.includes('gallery-enter')
      && Boolean(card.querySelector('.gallery-item-art').style.viewTransitionName)));
    // Let any rejected promise from the skipped transitions surface.
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('reduced motion skips the gallery entrance state', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${BASE_URL}/portfolio/#filter=digital`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'All' }).click();
    await expect.poll(() => page.$$eval('.gallery-item', (cards) => cards.some((card) =>
      getComputedStyle(card).viewTransitionClass.includes('gallery-enter')))).toBe(false);
  });

  test('the artwork does not cross-fade during the transition', async ({ page }) => {
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    // Cross-fading two copies of the same picture at different scales is the
    // soft double-image that capturing it separately exists to remove. The
    // styling hook is a class because ::view-transition-* takes no partial
    // wildcard; if it stops being applied, the fade silently comes back.
    const hasClass = await page.$eval(
      '.gallery-item-art',
      (el) => getComputedStyle(el).viewTransitionClass,
    );

    expect(hasClass).toContain('gallery-art');
  });

  test('each card contains exactly one interactive element', async ({ page }) => {
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    // The overlay button covers the whole card, so any control added inside the
    // card would be nested inside a button: invalid, and broken for assistive
    // tech. This fails the moment someone adds a link to the caption.
    const counts = await page.$$eval('.gallery-item', (cards) =>
      cards.map((el) => el.querySelectorAll('a, button, input, select, textarea, [tabindex]').length));

    expect(counts.length).toBeGreaterThan(0);
    expect(counts.every((n) => n === 1)).toBe(true);
  });

  test('the focus ring is inset so the frame cannot clip it', async ({ page }) => {
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });

    // Asserted against the stylesheet rather than a focused element because the
    // invariant IS the rule: `.brand-frame` clips with `overflow: hidden`, so a
    // ring at any positive offset is painted outside the card and clipped away
    // entirely, leaving the only control on the page with no visible focus
    // state. A negative offset draws it just inside the frame.
    const offset = await page.evaluate(() => {
      const walk = (rules) => {
        for (const rule of rules) {
          if (rule.selectorText === '.gallery-item-toggle:focus-visible') return rule.style.outlineOffset;
          if (rule.cssRules) {
            const found = walk(rule.cssRules);
            if (found) return found;
          }
        }
        return null;
      };
      for (const sheet of document.styleSheets) {
        let rules;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        const found = walk(rules);
        if (found) return found;
      }
      return null;
    });

    expect(offset).toBeTruthy();
    expect(parseFloat(offset)).toBeLessThan(0);
  });

  test('the gallery ARTWORK is still a registered bubble zone', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'networkidle' });
    await waitForEngine(page);

    /* This used to assert `.gallery-item`. The card stopped being a zone on
       2026-08-08 — deliberately, so bubbles can cross the frame and bounce off
       the picture instead — so the same guard now points at the artwork.
       The trap it exists for is unchanged and has fired three times in this
       repo: the exclusion list is matched by SELECTOR, so retagging or
       restructuring an element drops it out of the physics with no error and
       nothing red anywhere else. Restructuring the card for expansion is
       exactly that shape of change. */
    const registered = await page.evaluate(() => {
      const targets = [...document.querySelectorAll('.gallery-item-art')];
      if (!targets.length) return false;
      const zones = window.__bubbleEngine.zones.rects;
      // A frame zone is the element's exact rect, so this is an equality check
      // within a pixel rather than the containment used for padded zones.
      return targets.every((t) => {
        const r = t.getBoundingClientRect();
        return zones.some((z) => Math.abs(z.left - r.left) < 1.5 && Math.abs(z.top - r.top) < 1.5
          && Math.abs(z.right - r.right) < 1.5 && Math.abs(z.bottom - r.bottom) < 1.5);
      });
    });

    expect(registered).toBe(true);
  });
});
