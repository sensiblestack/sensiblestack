// We Used It HQ click tracking.
// Fires a GA4 event named "affiliate_click" whenever a visitor clicks a
// link into a /go/<tool> redirect, with or without a trailing slash,
// carrying the tool slug, the page the click happened on, and where on
// the page the link sat (data-cta, or "inline" when that attribute is
// absent). The same value is sent as both cta and cta_position.
// The mobile bar uses data-cta="sticky", so those clicks report
// cta_position=sticky.
// Fires "email_signup_click" for the checklist email CTA.
// Both events fire only after cookie consent turns analytics on
// (window.__ssAnalytics). Mark "affiliate_click" as a key event in GA4.
document.addEventListener('click', function (e) {
  var link = e.target.closest ? e.target.closest('a') : null;
  if (!link) return;
  if (!(window.__ssAnalytics && typeof gtag === 'function')) return;
  var href = link.getAttribute('href') || '';
  if (href.indexOf('/go/') !== -1) {
    var match = href.match(/\/go\/([a-z0-9-]+)\/?(?:[?#]|$)/);
    var cta = link.getAttribute('data-cta') || 'inline';
    gtag('event', 'affiliate_click', {
      tool: match ? match[1] : 'unknown',
      page_path: window.location.pathname,
      cta: cta,
      cta_position: cta
    });
  }
  if (link.hasAttribute('data-email-cta') || href.indexOf('join.sensiblestack.io/checklist') !== -1) {
    gtag('event', 'email_signup_click', {
      page_path: window.location.pathname,
      cta: link.getAttribute('data-email-cta') || 'checklist'
    });
  }
});
