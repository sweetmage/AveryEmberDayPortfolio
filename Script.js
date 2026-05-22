var btn = document.getElementById('return-to-top');

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.onscroll = function () {
  var scrollY = window.scrollY || document.documentElement.scrollTop;
  btn.style.display = scrollY > 800 ? 'block' : 'none';
};

// ── Theme toggle ───────────────────────────────────────────────────
(function () {
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function getTheme() {
    return localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
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

// ── Smooth scroll for anchor links ────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
