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

// ── Submenu toggle ────────────────────────────────────────────────
(function () {
  const triggers = document.querySelectorAll('.submenu-trigger');
  if (!triggers.length) return;

  function closeAllSubmenus() {
    document.querySelectorAll('.has-submenu.open').forEach(function (el) {
      el.classList.remove('open');
    });
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      const li = trigger.closest('.has-submenu');
      if (!li) return;
      const isOpen = li.classList.contains('open');
      if (!isOpen) {
        e.preventDefault();
        closeAllSubmenus();
        li.classList.add('open');
      } else {
        li.classList.remove('open');
        // allow default smooth-scroll behavior
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-submenu')) {
      closeAllSubmenus();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllSubmenus();
    }
  });
})();

// ── Smooth scroll for anchor links ────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    const li = anchor.closest('.has-submenu');
    if (li && !li.classList.contains('open')) return;
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Hamburger mobile menu ─────────────────────────────────────────
(function () {
  const hamburger = document.querySelector('.brand-nav-hamburger');
  const navLinks = document.querySelector('.brand-nav-links');
  if (!hamburger || !navLinks) return;

  function openMenu() {
    navLinks.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navLinks.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    const isOpen = navLinks.classList.contains('is-open');
    if (isOpen) { closeMenu(); } else { openMenu(); }
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  // Close when clicking outside the nav on mobile
  document.addEventListener('click', function (e) {
    if (navLinks.classList.contains('is-open') &&
        !e.target.closest('.brand-nav')) {
      closeMenu();
    }
  });

  // Close mobile menu when a nav link is clicked (navigation happening)
  navLinks.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link) return;
    // Don't close for submenu triggers on mobile — let submenu logic handle it
    if (link.classList.contains('submenu-trigger')) return;
    closeMenu();
  });

  // Close mobile menu on resize to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768 && navLinks.classList.contains('is-open')) {
      closeMenu();
    }
  }, { passive: true });
})();

// ── Active page indicator ─────────────────────────────────────────
(function () {
  const path = window.location.pathname;
  // Normalise: strip trailing slash, lower-case
  const normPath = path.replace(/\/$/, '').toLowerCase() || '/';

  document.querySelectorAll('.brand-nav-links a').forEach(function (a) {
    // Skip submenu triggers — they use JS open logic, not direct navigation
    if (a.classList.contains('submenu-trigger')) return;

    const href = a.getAttribute('href') || '';
    // Resolve relative href to an absolute path for comparison
    const resolved = new URL(href, window.location.href).pathname
      .replace(/\/$/, '').toLowerCase() || '/';

    if (resolved === normPath) {
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'page');

      // If this link is inside a submenu, also mark the parent li as active
      const submenuParent = a.closest('.has-submenu');
      if (submenuParent) {
        submenuParent.classList.add('is-active');
      }
    }
  });
})();
