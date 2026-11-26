// Mobile sticky call to action for enrolled affiliate reviews only.
// HighLevel, Jotform, Make and Pictory. Other tools stay without a bar.
// The bar appears below 768px once the verdict has scrolled off the top,
// and stays dismissed for the rest of the browser session.
(function () {
  var ENROLLED = { highlevel: 1, jotform: 1, make: 1, pictory: 1 };
  var bar = document.querySelector('.sticky-cta');
  if (!bar) return;
  var tool = bar.getAttribute('data-tool') || '';
  if (!ENROLLED[tool]) {
    bar.remove();
    return;
  }
  var verdict = document.querySelector('.verdict');
  var dismiss = bar.querySelector('.sticky-cta-dismiss');
  var key = 'ss-sticky-cta-dismissed:' + tool;
  var mobile = window.matchMedia('(max-width: 767px)');
  var queued = false;

  function remembered() {
    try { return sessionStorage.getItem(key) === '1'; } catch (e) { return false; }
  }

  function bannerOpen() {
    var banner = document.getElementById('cookie-banner');
    return !!(banner && !banner.hidden);
  }

  function pastVerdict() {
    if (!verdict) return false;
    return verdict.getBoundingClientRect().bottom <= 0;
  }

  function pin() {
    var vv = window.visualViewport;
    if (!vv) return;
    // Stay on the visible screen even when a wide table widens the page.
    bar.style.left = vv.offsetLeft + 'px';
    bar.style.width = vv.width + 'px';
    bar.style.bottom = 'auto';
    var height = bar.offsetHeight;
    bar.style.top = (vv.offsetTop + vv.height - height) + 'px';
  }

  function unpin() {
    bar.style.left = '';
    bar.style.width = '';
    bar.style.top = '';
    bar.style.bottom = '';
  }

  function apply() {
    queued = false;
    var show = mobile.matches && !remembered() && pastVerdict() && !bannerOpen();
    if (show) {
      bar.hidden = false;
      pin();
      var space = Math.ceil(bar.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--sticky-cta-space', space + 'px');
    } else {
      bar.hidden = true;
      unpin();
      document.documentElement.style.removeProperty('--sticky-cta-space');
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(apply);
  }

  function watchBanner() {
    var banner = document.getElementById('cookie-banner');
    if (!banner || banner.__ssStickyWatch) return;
    banner.__ssStickyWatch = true;
    new MutationObserver(schedule).observe(banner, { attributes: true, attributeFilter: ['hidden'] });
  }

  if (dismiss) {
    dismiss.addEventListener('click', function () {
      try { sessionStorage.setItem(key, '1'); } catch (e) {}
      bar.hidden = true;
      document.documentElement.style.removeProperty('--sticky-cta-space');
    });
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('scroll', schedule);
    window.visualViewport.addEventListener('resize', schedule);
  }
  if (mobile.addEventListener) mobile.addEventListener('change', schedule);
  new MutationObserver(function () {
    watchBanner();
    schedule();
  }).observe(document.body, { childList: true });

  function boot() {
    watchBanner();
    schedule();
    // Fonts and the mobile viewport can settle a moment after first paint.
    window.setTimeout(schedule, 400);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
