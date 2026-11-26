// Cookie consent for Google Analytics (Consent Mode v2).
// Analytics stays off until the visitor chooses Accept. The choice is
// remembered in localStorage and can be changed from Cookie settings.
(function () {
  var KEY = 'ss-cookie-consent';
  var GA_ID = 'G-CH4Z3K8NZY';

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.__ssAnalytics = false;

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted'
  });

  function readChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function writeChoice(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }

  function loadGA() {
    window.__ssAnalytics = true;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    if (window.__ssGaLoaded) return;
    window.__ssGaLoaded = true;
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);
  }

  function clearGaCookies() {
    var host = location.hostname;
    document.cookie.split(';').forEach(function (part) {
      var name = part.split('=')[0].trim();
      if (name.indexOf('_ga') !== 0 && name !== '_gid') return;
      var base = name + '=; Max-Age=0; path=/';
      document.cookie = base;
      document.cookie = base + '; domain=' + host;
      document.cookie = base + '; domain=.' + host;
    });
  }

  function deny() {
    window.__ssAnalytics = false;
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied'
    });
    clearGaCookies();
  }

  function hideBanner() {
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.hidden = true;
  }

  function choose(value) {
    writeChoice(value);
    if (value === 'granted') loadGA();
    else deny();
    hideBanner();
  }

  function showBanner() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) banner = buildBanner();
    banner.hidden = false;
    banner.focus();
  }

  function buildBanner() {
    var banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'cookie-banner-title');
    banner.setAttribute('aria-describedby', 'cookie-banner-text');
    banner.tabIndex = -1;

    var title = document.createElement('h2');
    title.id = 'cookie-banner-title';
    title.textContent = 'Cookies';

    var text = document.createElement('p');
    text.id = 'cookie-banner-text';
    text.textContent = 'We use Google Analytics to see which pages and links are useful. It sets a cookie only if you accept. Rejecting changes nothing you can read.';

    var actions = document.createElement('div');
    actions.className = 'consent-actions';

    var reject = document.createElement('button');
    reject.type = 'button';
    reject.className = 'consent-choice';
    reject.textContent = 'Reject';
    reject.addEventListener('click', function () { choose('denied'); });

    var accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'consent-choice';
    accept.textContent = 'Accept';
    accept.addEventListener('click', function () { choose('granted'); });

    actions.appendChild(reject);
    actions.appendChild(accept);
    banner.appendChild(title);
    banner.appendChild(text);
    banner.appendChild(actions);
    document.body.appendChild(banner);
    return banner;
  }

  function addFooterControl() {
    if (document.getElementById('cookie-settings')) return;
    var foot = document.querySelector('footer.site');
    if (!foot) return;
    var paras = foot.querySelectorAll('p');
    var host = paras[paras.length - 1];
    if (!host) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'cookie-settings';
    btn.className = 'cookie-settings';
    btn.textContent = 'Cookie settings';
    btn.addEventListener('click', showBanner);
    var sep = document.createTextNode(' \u00b7 ');
    var br = host.querySelector('br');
    if (br) {
      host.insertBefore(sep, br);
      host.insertBefore(btn, br);
    } else {
      host.appendChild(sep);
      host.appendChild(btn);
    }
  }

  function start() {
    addFooterControl();
    var choice = readChoice();
    if (choice === 'granted') loadGA();
    else if (choice === 'denied') deny();
    else showBanner();
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
