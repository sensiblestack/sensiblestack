// Sensible Stack affiliate click tracking.
// Fires a GA4 event named "affiliate_click" whenever a visitor clicks a
// link into a /go/<tool> redirect, with or without a trailing slash,
// carrying the tool slug and the page the click happened on.
// Mark "affiliate_click" as a key event in GA4.
document.addEventListener('click', function (e) {
  var link = e.target.closest ? e.target.closest('a[href*="/go/"]') : null;
  if (!link) return;
  var href = link.getAttribute('href') || '';
  var match = href.match(/\/go\/([a-z0-9-]+)\/?(?:[?#]|$)/);
  if (window.__ssAnalytics && typeof gtag === 'function') {
    gtag('event', 'affiliate_click', {
      tool: match ? match[1] : 'unknown',
      page_path: window.location.pathname
    });
  }
});
