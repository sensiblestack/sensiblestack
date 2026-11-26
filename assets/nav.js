document.addEventListener('click', function (e) {
  var btn = e.target.closest ? e.target.closest('.drop-toggle') : null;
  document.querySelectorAll('.hasdrop.open').forEach(function (el) {
    if (!btn || el !== btn.parentElement) {
      el.classList.remove('open');
      var openBtn = el.querySelector('.drop-toggle');
      if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    }
  });
  if (!btn) return;
  var parent = btn.parentElement;
  var willOpen = !parent.classList.contains('open');
  parent.classList.toggle('open', willOpen);
  btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
});
document.addEventListener('focusin', function (e) {
  document.querySelectorAll('.hasdrop.open').forEach(function (el) {
    if (!el.contains(e.target)) {
      el.classList.remove('open');
      var openBtn = el.querySelector('.drop-toggle');
      if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    }
  });
});
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.hasdrop.open').forEach(function (el) {
    el.classList.remove('open');
    var openBtn = el.querySelector('.drop-toggle');
    if (openBtn) {
      openBtn.setAttribute('aria-expanded', 'false');
      openBtn.focus();
    }
  });
});
