var btn = document.getElementById('return-to-top');

window.addEventListener('scroll', function () {
  if (!btn) return;
  var scrollY = window.scrollY || document.documentElement.scrollTop;
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

  function getTheme() {
    return localStorage.getItem('theme') || 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Swap logo sources for light/dark mode
    var heroLogo = document.querySelector('.hero-logo');
    if (heroLogo) {
      heroLogo.src = theme === 'light'
        ? 'images/icons/BubbleLogo/bubbleLogo-black.svg'
        : 'images/icons/BubbleLogo/bubbleLogo-white.svg';
    }
    var navLogo = document.querySelector('.brand-nav-logo img');
    if (navLogo) {
      navLogo.src = theme === 'light'
        ? 'images/icons/BubbleLogo/bubbleLogo-black-notxt.svg'
        : 'images/icons/BubbleLogo/bubbleLogo-white-notxt.svg';
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
  var nav = document.getElementById('brandNav');
  if (!nav) return;

  function onScroll() {
    nav.setAttribute('data-scrolled', window.scrollY > 20 ? 'true' : 'false');
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── Submenu toggle ────────────────────────────────────────────────
(function () {
  var triggers = document.querySelectorAll('.submenu-trigger');
  if (!triggers.length) return;

  function closeAllSubmenus() {
    document.querySelectorAll('.has-submenu.open').forEach(function (el) {
      el.classList.remove('open');
    });
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      var li = trigger.closest('.has-submenu');
      if (!li) return;
      var isOpen = li.classList.contains('open');
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
    var li = anchor.closest('.has-submenu');
    if (li && !li.classList.contains('open')) return;
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
