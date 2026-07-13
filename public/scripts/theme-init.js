/**
 * Theme initialization — runs before page render to prevent FOUC.
 * Must be loaded with `beforeInteractive` strategy.
 */
(function () {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);

  // Swap logo sources to match the resolved theme before first paint,
  // mirroring the legacy Script.js applyTheme() logo swap.
  const heroLogo = document.querySelector('.hero-logo');
  if (heroLogo) {
    heroLogo.src =
      theme === 'light'
        ? '/images/icons/BubbleLogo/bubbleLogo-black.svg'
        : '/images/icons/BubbleLogo/bubbleLogo-white.svg';
  }
  const navLogo = document.querySelector('.brand-nav-logo img');
  if (navLogo) {
    navLogo.src =
      theme === 'light'
        ? '/images/icons/BubbleLogo/bubbleLogo-black-notxt.svg'
        : '/images/icons/BubbleLogo/bubbleLogo-white-notxt.svg';
  }
})();
