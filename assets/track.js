// Sensible Stack click tracking.
// Fires a GA4 event named "affiliate_click" whenever a visitor clicks a
// link into a /go/<tool> redirect, with or without a trailing slash,
// carrying the tool slug, the page the click happened on, and where on
// the page the link sat (data-cta, or "inline" when that attribute is
// absent). Fires "email_signup_click" for the checklist email CTA.
// Both events fire only after cookie consent turns analytics on.
// Mark "affiliate_click" as a key event in GA4.
document.addEventListener('click', function (e) {
  var link = e.target.closest ? e.target.closest('a') : null;
  if (!link) return;
  if (!(window.__ssAnalytics && typeof gtag === 'function')) return;
  var href = link.getAttribute('href') || '';
  if (href.indexOf('/go/') !== -1) {
    var match = href.match(/\/go\/([a-z0-9-]+)\/?(?:[?#]|$)/);
    gtag('event', 'affiliate_click', {
      tool: match ? match[1] : 'unknown',
      page_path: window.location.pathname,
      cta_position: link.getAttribute('data-cta') || 'inline'
    });
  }
  if (link.hasAttribute('data-email-cta') || href.indexOf('join.sensiblestack.io/checklist') !== -1) {
    gtag('event', 'email_signup_click', {
      page_path: window.location.pathname
    });
  }
});
