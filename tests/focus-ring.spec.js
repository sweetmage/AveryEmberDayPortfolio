import { test, expect } from '@playwright/test';

// Must match the `serve out` server started in tests/global-setup.js.
const BASE_URL = 'http://localhost:4322';

/**
 * Focus rings paint the accent the moment focus lands, not after a fade.
 *
 * `.icon-link`, `#return-to-top` and `.skip-link` were logged for weeks as
 * "painting the browser's ring instead of the accent" (TODO, Entry 123). They
 * never were. Tailwind v4's `transition-colors` lists `outline-color`, and
 * `transition-all` covers everything, so the 2px `--brand-accent` ring FADED IN
 * over 150ms from `currentColor` — and every probe that read the outline right
 * after focus caught it mid-fade. Measured headed with real Tab presses on
 * 2026-10-04: grey on focus, accent 500ms later, in Chromium and WebKit alike.
 *
 * The rule cannot fix it from brand.css: that file is imported into
 * `layer(components)`, and a Tailwind utility's `transition-property` outranks
 * anything there. So the three components narrow their own transition, and this
 * spec guards the general case — the next control to pick up `transition-colors`
 * fails here, not in an audit.
 *
 * Real Tab presses only. Programmatic `el.focus()` does not reliably engage
 * `:focus-visible`. WebKit's default Tab skips links (macOS "Press Tab to
 * highlight each item" is off), so it walks with Alt+Tab, which reaches them.
 * Runs on `chromium` and on `webkit-mobile` (see playwright.config.js).
 */

const PAGES = ['/', '/projects/', '/gallery/', '/contact/'];

async function tabKey(browserName) {
  return browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
}

async function accentColor(page) {
  return page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.color = 'var(--brand-accent)';
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
}

/** Describe the focused element's outline and whether any transition animates it. */
function readFocused() {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const cs = getComputedStyle(el);
  const props = cs.transitionProperty.split(',').map((s) => s.trim());
  const durations = cs.transitionDuration.split(',').map((s) => parseFloat(s) || 0);
  // CSS repeats the duration list to the length of the property list.
  const animatesOutline = props.some(
    (p, i) => (p === 'all' || p.includes('outline')) && durations[i % durations.length] > 0,
  );
  const label =
    (el.id && `#${el.id}`) ||
    `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')}` +
      ` "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30)}"`;
  return {
    label,
    focusVisible: el.matches(':focus-visible'),
    outlineStyle: cs.outlineStyle,
    outlineColor: cs.outlineColor,
    outlineWidth: cs.outlineWidth,
    animatesOutline,
  };
}

test.describe('focus rings do not fade in', () => {
  for (const path of PAGES) {
    test(`no focus stop animates its outline — ${path}`, async ({ page, browserName }) => {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
      const key = await tabKey(browserName);

      const offenders = [];
      const seen = new Set();
      let stops = 0;
      // Walk until focus wraps back to an element already seen, with a hard cap
      // so a focus trap fails loudly instead of hanging.
      for (let i = 0; i < 400; i += 1) {
        await page.keyboard.press(key);
        const f = await page.evaluate(readFocused);
        if (!f) continue;
        const id = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el.dataset.focusProbe) el.dataset.focusProbe = String(Math.random());
          return el.dataset.focusProbe;
        });
        if (seen.has(id)) break;
        seen.add(id);
        stops += 1;
        if (f.outlineStyle !== 'none' && f.animatesOutline) offenders.push(f.label);
      }

      expect(stops, 'Tab reached no focus stops at all').toBeGreaterThan(0);
      expect(offenders, 'these controls fade their focus ring in').toEqual([]);
    });
  }
});

test.describe('footer and skip-link rings are the accent on focus', () => {
  const CONTROLS = ['.skip-link', '.brand-footer-links a', '.icon-link', '#return-to-top'];

  test('each control reads the accent immediately, not after a transition', async ({ page, browserName }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    // #return-to-top only displays past 800px of scroll (ReturnToTop.tsx).
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForFunction(
      () => getComputedStyle(document.getElementById('return-to-top')).display !== 'none',
    );
    await page.evaluate(() => document.activeElement && document.activeElement.blur());

    const accent = await accentColor(page);
    const key = await tabKey(browserName);
    const found = {};

    for (let i = 0; i < 200 && Object.keys(found).length < CONTROLS.length; i += 1) {
      await page.keyboard.press(key);
      const hit = await page.evaluate((selectors) => {
        const el = document.activeElement;
        const match = selectors.find((s) => el && el.matches(s));
        if (!match) return null;
        const cs = getComputedStyle(el);
        return {
          match,
          focusVisible: el.matches(':focus-visible'),
          color: cs.outlineColor,
          width: cs.outlineWidth,
          style: cs.outlineStyle,
        };
      }, CONTROLS);
      if (hit && !found[hit.match]) found[hit.match] = hit;
    }

    for (const selector of CONTROLS) {
      const hit = found[selector];
      expect(hit, `Tab never reached ${selector}`).toBeTruthy();
      expect(hit.focusVisible, `${selector} focus-visible`).toBe(true);
      expect(hit.style, `${selector} outline-style`).toBe('solid');
      expect(hit.width, `${selector} outline-width`).toBe('2px');
      expect(hit.color, `${selector} outline-color on focus`).toBe(accent);
    }
  });
});
