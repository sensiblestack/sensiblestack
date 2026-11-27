// Cookie consent for Google Analytics (Consent Mode v2).
// Visitors in the EU, EEA, UK and Switzerland see a banner, and analytics
// stays off until they choose Accept. Everyone else gets analytics on by
// default, unless their browser sends Global Privacy Control, and can turn
// it off from Cookie settings in the footer. A saved choice always wins
// and is remembered in localStorage.
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
    text.textContent = 'We use Google Analytics, which sets an analytics cookie, to see which pages and links are useful. Reject turns it off and changes nothing you can read.';

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

  // Opt-in is required for visitors in the EU, EEA, UK and Switzerland.
  // GitHub Pages gives no server-side location, so the region is read from
  // the browser's time zone. Any Europe/* zone, plus EU and EEA territories
  // outside it, counts as opt-in. An unknown zone also counts as opt-in, so
  // the check fails safe.
  var OPT_IN_ZONES = {
    'Atlantic/Azores': 1, 'Atlantic/Madeira': 1, 'Atlantic/Canary': 1,
    'Atlantic/Faroe': 1, 'Atlantic/Reykjavik': 1, 'Arctic/Longyearbyen': 1,
    'Africa/Ceuta': 1, 'Asia/Nicosia': 1, 'Asia/Famagusta': 1,
    'America/Guadeloupe': 1, 'America/Martinique': 1, 'America/Cayenne': 1,
    'America/St_Barthelemy': 1, 'America/Marigot': 1,
    'Indian/Reunion': 1, 'Indian/Mayotte': 1
  };

  function needsOptIn() {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (!tz) return true;
    return tz.indexOf('Europe/') === 0 || !!OPT_IN_ZONES[tz];
  }

  // Global Privacy Control is an opt-out signal some US states require
  // sites to honor, so a browser sending it starts with analytics off.
  function gpcOn() {
    return navigator.globalPrivacyControl === true;
  }

  function start() {
    addFooterControl();
    var choice = readChoice();
    if (choice === 'granted') loadGA();
    else if (choice === 'denied') deny();
    else if (needsOptIn()) showBanner();
    else if (gpcOn()) deny();
    else loadGA();
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
