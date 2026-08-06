import { test, expect } from '@playwright/test';

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
 * Concept: docs/plans/2026-08-01-gallery-expand-motion-concept.md
 * Implementation plan: docs/plans/2026-08-05-gallery-expand-implementation.md
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
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

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
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

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
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

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
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

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
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

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
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

    // The negative test above passes just as well if the API is never called at
    // all, so pair it with the positive case or the whole path can rot unnoticed.
    await toggle(page, 'In Danger').click();
    await expect(toggle(page, 'In Danger')).toHaveAttribute('aria-expanded', 'true');
    expect(await page.evaluate(() => window.__vtCalls)).toBe(1);
  });

  test('filtering collapses an open card that no longer matches', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

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
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

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
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

    await toggle(page, 'In Danger').click();
    await expect(toggle(page, 'In Danger')).toHaveAttribute('aria-expanded', 'true');

    const art = card(page, 'In Danger').locator('.gallery-item-art');
    await expect.poll(async () => Math.round((await art.boundingBox()).height)).toBeGreaterThan(0);

    const navHeight = await page.locator('.brand-nav').first().evaluate((el) => el.getBoundingClientRect().height);
    const artHeight = (await art.boundingBox()).height;

    // The nav is sticky and overlays the page, so "one screen" has to mean the
    // viewport minus the nav or the top of every tall piece sits underneath it.
    expect(artHeight).toBeLessThanOrEqual(720 - navHeight + 1);
  });

  test('expanding a card already in view does not scroll the page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

    // The first row sits comfortably below the nav, so there is nothing to
    // correct. `scrollIntoView({ block: 'nearest' })` failed exactly here: once
    // expanded the card is taller than the viewport, and 'nearest' on an
    // oversized element jumps to an edge, cutting the card's head off above the
    // nav and dumping the user in the middle of the artwork.
    const before = await page.evaluate(() => window.scrollY);
    await toggle(page, 'In Danger').click();
    await expect(toggle(page, 'In Danger')).toHaveAttribute('aria-expanded', 'true');
    await page.waitForTimeout(600); // let a smooth scroll happen if one is going to

    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });

  test('expanding a card low on the page brings it back into view', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

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

    const { cardTop, navHeight, viewportHeight } = await page.evaluate(() => {
      const card = [...document.querySelectorAll('.gallery-item')]
        .find((el) => el.getAttribute('data-expanded') === 'true');
      return {
        cardTop: card.getBoundingClientRect().top,
        navHeight: document.querySelector('.brand-nav').getBoundingClientRect().height,
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
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

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
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

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
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

    const names = await page.$$eval('.gallery-item', (cards) =>
      cards.map((el) => el.style.viewTransitionName));

    expect(names.length).toBeGreaterThan(0);
    expect(names.every(Boolean)).toBe(true);
    // Duplicates break the transition silently — no error, no visual signal.
    expect(new Set(names).size).toBe(names.length);
  });

  test('each card contains exactly one interactive element', async ({ page }) => {
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

    // The overlay button covers the whole card, so any control added inside the
    // card would be nested inside a button: invalid, and broken for assistive
    // tech. This fails the moment someone adds a link to the caption.
    const counts = await page.$$eval('.gallery-item', (cards) =>
      cards.map((el) => el.querySelectorAll('a, button, input, select, textarea, [tabindex]').length));

    expect(counts.length).toBeGreaterThan(0);
    expect(counts.every((n) => n === 1)).toBe(true);
  });

  test('the focus ring is inset so the frame cannot clip it', async ({ page }) => {
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });

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

  test('the gallery card is still a registered bubble exclusion zone', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/gallery/`, { waitUntil: 'networkidle' });
    await waitForEngine(page);

    // `.gallery-item` is matched by selector in DEFAULT_EXCLUSIONS, so retagging
    // or renaming the card drops it out of the physics zones with no error and
    // nothing red anywhere else. Restructuring the card for expansion is exactly
    // the shape of change that has caused this three times in this repo.
    const registered = await page.evaluate(() => {
      const targets = [...document.querySelectorAll('.gallery-item')];
      if (!targets.length) return false;
      const zones = window.__bubbleEngine.zones.rects;
      return targets.every((t) => {
        const r = t.getBoundingClientRect();
        return zones.some((z) => z.left <= r.left && z.top <= r.top && z.right >= r.right && z.bottom >= r.bottom);
      });
    });

    expect(registered).toBe(true);
  });
});
