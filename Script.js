var btn = document.getElementById('return-to-top');

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.onscroll = function () {
  var scrollY = window.scrollY || document.documentElement.scrollTop;
  btn.style.display = scrollY > 800 ? 'block' : 'none';
};