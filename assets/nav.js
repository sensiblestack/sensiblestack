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

// Mobile menu: inject a toggle button so the header works on narrow screens
// without editing every page. CSS only collapses the nav when .has-burger is set.
(function () {
  var header = document.querySelector('header.site');
  var nav = header && header.querySelector('nav.main');
  if (!nav || header.querySelector('.nav-burger')) return;
  if (!nav.id) nav.id = 'site-nav';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-burger';
  btn.setAttribute('aria-controls', nav.id);
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'Menu');
  btn.innerHTML = '<span class="bars" aria-hidden="true"></span><span class="label">Menu</span>';
  header.insertBefore(btn, nav);
  header.classList.add('has-burger');
  function setOpen(open) {
    header.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  btn.addEventListener('click', function () { setOpen(!header.classList.contains('nav-open')); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('nav-open') && !nav.querySelector('.hasdrop.open')) {
      setOpen(false);
      btn.focus();
    }
  });
})();
