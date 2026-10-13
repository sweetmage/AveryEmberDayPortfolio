(function () {
  var b = document.getElementById('mk-theme');
  if (!b) return;
  b.addEventListener('click', function () {
    var r = document.documentElement;
    r.dataset.theme = r.dataset.theme === 'light' ? 'dark' : 'light';
    b.textContent = 'Theme: ' + r.dataset.theme;
  });
})();
