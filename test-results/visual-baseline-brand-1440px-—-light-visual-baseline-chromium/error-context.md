# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual-baseline.spec.js >> brand @ 1440px — light >> visual baseline
- Location: tests\visual-baseline.spec.js:37:13

# Error details

```
Error: UNKNOWN: unknown error, open 'D:\My Stuff\Git\CometGit\portfoliowebsite\tests\baselines\brand_1440_light.png'
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - navigation "Primary navigation" [ref=e3]:
    - generic [ref=e4]:
      - link "Avery Ember Day" [ref=e5] [cursor=pointer]:
        - /url: ../index.html
      - list [ref=e6]:
        - listitem [ref=e7]:
          - link "Work" [ref=e8] [cursor=pointer]:
            - /url: ../index.html#work
        - listitem [ref=e9]:
          - link "About" [ref=e10] [cursor=pointer]:
            - /url: ../index.html#about
      - button "Toggle light/dark mode" [ref=e12] [cursor=pointer]:
        - img [ref=e13]
        - img [ref=e15]
  - main [ref=e17]:
    - generic [ref=e18]:
      - link "Back to Work" [ref=e19] [cursor=pointer]:
        - /url: ../index.html#work
        - img [ref=e20]
        - text: Back to Work
      - heading "Avery Ember Day Brand" [level=1] [ref=e22]
      - paragraph [ref=e23]: Complete personal brand identity system logos, color, type, and applications. Built to work across dark and light contexts with a consistent voice.
    - generic [ref=e24]:
      - heading "Logo Variants" [level=2] [ref=e25]
      - generic [ref=e26]:
        - generic [ref=e27]:
          - img "Blue logo with text" [ref=e29]
          - generic [ref=e30]:
            - strong [ref=e31]: Primary — Blue
            - text: "Dark backgrounds · #9acdff"
        - generic [ref=e32]:
          - img "Black logo with text" [ref=e34]
          - generic [ref=e35]:
            - strong [ref=e36]: Primary — Black
            - text: "Light backgrounds · #000000"
        - generic [ref=e37]:
          - img "White logo with text" [ref=e39]
          - generic [ref=e40]:
            - strong [ref=e41]: Primary — White
            - text: "Dark backgrounds · #ffffff"
        - generic [ref=e42]:
          - img "Blue icon mark" [ref=e44]
          - generic [ref=e45]:
            - strong [ref=e46]: Icon Mark — Blue
            - text: Favicon · App icon · Small use
        - generic [ref=e47]:
          - img "Black icon mark" [ref=e49]
          - generic [ref=e50]:
            - strong [ref=e51]: Icon Mark — Black
            - text: Light backgrounds · small use
        - generic [ref=e52]:
          - img "White icon mark" [ref=e54]
          - generic [ref=e55]:
            - strong [ref=e56]: Icon Mark — White
            - text: Dark backgrounds · small use
    - generic [ref=e57]:
      - heading "Brand Palette" [level=2] [ref=e58]
      - generic [ref=e59]:
        - generic [ref=e60]:
          - generic [ref=e62]: Brand Blue
          - generic [ref=e63]: "#9acdff"
        - generic [ref=e64]:
          - generic [ref=e66]: Accent
          - generic [ref=e67]: "#CC44FF"
        - generic [ref=e68]:
          - generic [ref=e70]: Neon
          - generic [ref=e71]: "#00FFFF"
        - generic [ref=e72]:
          - generic [ref=e74]: Gold
          - generic [ref=e75]: "#f5b96a"
        - generic [ref=e76]:
          - generic [ref=e78]: Dark BG
          - generic [ref=e79]: "#0A0A0A"
        - generic [ref=e80]:
          - generic [ref=e82]: Light BG
          - generic [ref=e83]: "#F2F0EC"
    - generic [ref=e84]:
      - heading "Type System" [level=2] [ref=e85]
      - generic [ref=e86]:
        - generic [ref=e87]:
          - generic [ref=e88]: Display — Sriracha
          - generic [ref=e89]: Avery Ember Day
        - generic [ref=e90]:
          - generic [ref=e91]: Heading — Outfit 600
          - generic [ref=e92]: Brand Identity System
        - generic [ref=e93]:
          - generic [ref=e94]: Body — Inter 400
          - generic [ref=e95]: Multi-Media Designer based in Las Vegas. Illustration, brand identity, and motion graphics. Design with a focus on character, mood, and accessibility.
  - contentinfo [ref=e96]:
    - generic [ref=e97]:
      - generic [ref=e98]:
        - generic [ref=e99]: © 2026 Avery Ember Day
        - list [ref=e100]:
          - listitem [ref=e101]:
            - link "Work" [ref=e102] [cursor=pointer]:
              - /url: ../index.html#work
          - listitem [ref=e103]:
            - link "About" [ref=e104] [cursor=pointer]:
              - /url: ../index.html#about
      - generic [ref=e105]:
        - generic [ref=e106]:
          - link "Email" [ref=e107] [cursor=pointer]:
            - /url: mailto:averyemberday@gmail.com
            - img [ref=e108]
          - link "LinkedIn" [ref=e111] [cursor=pointer]:
            - /url: https://www.linkedin.com/in/averyemberday/
            - img [ref=e112]
          - link "GitHub" [ref=e115] [cursor=pointer]:
            - /url: https://github.com/sweetmage
            - img [ref=e116]
        - paragraph [ref=e118]: averyemberday@gmail.com
  - button "Return to top" [ref=e119] [cursor=pointer]:
    - img [ref=e120]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import * as fs from 'fs';
  3  | import * as path from 'path';
  4  | 
  5  | const BASE_URL = 'http://localhost:3000';
  6  | 
  7  | const PAGES = [
  8  |   { name: 'index', url: '/' },
  9  |   { name: 'brand', url: '/projects/brand-avery-ember-day.html' },
  10 |   { name: 'mistrust', url: '/projects/history-of-mistrust.html' },
  11 |   { name: 'patriots', url: '/projects/patriots-low-thirds.html' },
  12 |   { name: 'gallery', url: '/gallery/gallery.html' },
  13 | ];
  14 | 
  15 | const BREAKPOINTS = [360, 768, 1024, 1440];
  16 | const THEMES = ['light', 'dark'];
  17 | 
  18 | const BASELINE_DIR = path.join(process.cwd(), 'tests', 'baselines');
  19 | 
  20 | if (!fs.existsSync(BASELINE_DIR)) {
  21 |   fs.mkdirSync(BASELINE_DIR, { recursive: true });
  22 | }
  23 | 
  24 | for (const page of PAGES) {
  25 |   for (const width of BREAKPOINTS) {
  26 |     for (const theme of THEMES) {
  27 |       test.describe(`${page.name} @ ${width}px — ${theme}`, () => {
  28 |         test.beforeEach(async ({ context }) => {
  29 |           await context.addInitScript((t) => {
  30 |             localStorage.setItem('theme', t);
  31 |             const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  32 |             const resolved = t || (prefersDark ? 'dark' : 'light');
  33 |             document.documentElement.setAttribute('data-theme', resolved);
  34 |           }, theme);
  35 |         });
  36 | 
  37 |         test('visual baseline', async ({ page: p }) => {
  38 |           await p.setViewportSize({ width, height: 900 });
  39 |           await p.goto(`${BASE_URL}${page.url}`, { waitUntil: 'networkidle' });
  40 | 
  41 |           // Wait for bubble physics and fonts to settle
  42 |           await p.waitForTimeout(1500);
  43 | 
  44 |           const screenshotPath = path.join(
  45 |             BASELINE_DIR,
  46 |             `${page.name}_${width}_${theme}.png`
  47 |           );
  48 | 
> 49 |           await p.screenshot({
     |           ^ Error: UNKNOWN: unknown error, open 'D:\My Stuff\Git\CometGit\portfoliowebsite\tests\baselines\brand_1440_light.png'
  50 |             path: screenshotPath,
  51 |             fullPage: true,
  52 |           });
  53 | 
  54 |           // Verify file was written
  55 |           expect(fs.existsSync(screenshotPath)).toBe(true);
  56 |           const stats = fs.statSync(screenshotPath);
  57 |           expect(stats.size).toBeGreaterThan(1024);
  58 |         });
  59 |       });
  60 |     }
  61 |   }
  62 | }
  63 | 
```