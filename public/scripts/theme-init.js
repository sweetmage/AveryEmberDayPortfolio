/**
 * Theme initialization — runs before page render to prevent FOUC.
 * Must be loaded with `beforeInteractive` strategy.
 */
(function () {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  // Logos are inline SVG using currentColor — they paint correctly from the
  // first frame off this attribute alone, so no pre-paint src swap is needed.
})();
