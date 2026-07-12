const btn = document.getElementById('return-to-top');

window.addEventListener('scroll', function () {
  if (!btn) return;
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  btn.style.display = scrollY > 800 ? 'block' : 'none';
}, { passive: true });

if (btn) {
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── Theme toggle ───────────────────────────────────────────────────
(function () {
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  // Resolve image paths against this script's own location (site root),
  // not the current page's location — subpages load Script.js via "../Script.js"
  // but a page-relative "images/..." string would resolve under the subpage's folder.
  var assetBase = document.currentScript
    ? document.currentScript.src.replace(/Script\.js(\?.*)?$/, '')
    : '';

  function getTheme() {
    var stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Swap logo sources for light/dark mode
    var heroLogo = document.querySelector('.hero-logo');
    if (heroLogo) {
      heroLogo.src = theme === 'light'
        ? assetBase + 'images/icons/BubbleLogo/bubbleLogo-black.svg'
        : assetBase + 'images/icons/BubbleLogo/bubbleLogo-white.svg';
    }
    var navLogo = document.querySelector('.brand-nav-logo img');
    if (navLogo) {
      navLogo.src = theme === 'light'
        ? assetBase + 'images/icons/BubbleLogo/bubbleLogo-black-notxt.svg'
        : assetBase + 'images/icons/BubbleLogo/bubbleLogo-white-notxt.svg';
    }
  }

  applyTheme(getTheme());

  toggle.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'light' ? 'dark' : 'light');
  });
})();

// ── Nav scroll-spy ─────────────────────────────────────────────────
(function () {
  const nav = document.getElementById('brandNav');
  if (!nav) return;

  function onScroll() {
    nav.setAttribute('data-scrolled', window.scrollY > 20 ? 'true' : 'false');
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── Smooth scroll for anchor links ────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Active page indicator ─────────────────────────────────────────
(function () {
  const path = window.location.pathname;
  // Normalise: strip trailing slash, lower-case
  const normPath = path.replace(/\/$/, '').toLowerCase() || '/';

  document.querySelectorAll('.brand-nav-links a').forEach(function (a) {
    const href = a.getAttribute('href') || '';
    // Resolve relative href to an absolute path for comparison
    const resolved = new URL(href, window.location.href).pathname
      .replace(/\/$/, '').toLowerCase() || '/';

    if (resolved === normPath) {
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'page');
    }
  });
})();
