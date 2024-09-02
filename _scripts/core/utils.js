/**
 * _.compact from lodash
 * Remove empty/false items from array
 * Source: https://github.com/lodash/lodash/blob/master/compact.js
 *
 * @param {array} array
 */
export function compact(array) {
  let index = -1;
  let resIndex = 0;
  const length = array == null ? 0 : array.length;
  const result = [];

  while (++index < length) {
    const value = array[index];
    if (value) {
      result[resIndex++] = value;
    }
  }
  return result;
}

/**
 * Constructs an object of key / value pairs out of the parameters of the query string
 *
 * @return {Object}
 */
export function getQueryParams() {
  const queryParams = {}
  const params = new URLSearchParams(window.location.search)

  for (const [key, value] of params.entries()) {
    queryParams[key] = value || true
  }

  return queryParams
}

/**
 * Check if we're running the theme inside the theme editor
 *
 * @return {bool}
 */
export function isThemeEditor() {
  return window.Shopify && window.Shopify.designMode;
}

/**
 * Adds user agent classes to the document to target specific browsers
 *
 */
export function userAgentBodyClass() {
  const ua = navigator.userAgent;
  const d = document.documentElement;
  let classes = d.className;
  let matches;

  // Detect iOS (needed to disable zoom on form elements)
  // http://stackoverflow.com/questions/9038625/detect-if-device-is-ios/9039885#9039885
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
    classes += ' ua-ios';

    // Add class for version of iOS
    matches = ua.match(/((\d+_?){2,3})\slike\sMac\sOS\sX/);
    if (matches) {
      classes += ' ua-ios-' + matches[1];// e.g. ua-ios-7_0_2
    }

    // Add class for Twitter app
    if (/Twitter/.test(ua)) {
      classes += ' ua-ios-twitter';
    }

    // Add class for Chrome browser
    if (/CriOS/.test(ua)) {
      classes += ' ua-ios-chrome';
    }
  }

  // Detect Android (needed to disable print links on old devices)
  // http://www.ainixon.me/how-to-detect-android-version-using-js/
  if (/Android/.test(ua)) {
    matches = ua.match(/Android\s([0-9]*)/);
    classes += matches ? ' ua-aos ua-aos-' + matches[1].replace(/\./g, '_') : ' ua-aos';
  }

  // Detect webOS (needed to disable optimizeLegibility)
  if (/webOS|hpwOS/.test(ua)) {
    classes += ' ua-webos';
  }

  // Detect Samsung Internet browser
  if (/SamsungBrowser/.test(ua)) {
    classes += ' ua-samsung';
  }

  if (ua.toLowerCase().indexOf('safari') != -1) { 
    if (ua.toLowerCase().indexOf('chrome') > -1) {
      // Chrome
    }
    else {
      classes += ' ua-safari';
    }
  }


  d.className = classes;
}

/**
 * Generates a 32 bit integer from a string
 * Useful for hashing content into a some-what unique identifier to use for cookies.
 * Reference - https://stackoverflow.com/a/7616484
 *
 * @param {string}
 * @return {int}
 */
export function hashFromString(string) {
  let hash = 0;
  let i;
  let chr;

  if (string.length === 0) return hash;

  for (i = 0; i < string.length; i++) {
    chr   = string.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;  // eslint-disable-line no-bitwise
    // Convert to 32bit integer
    hash |= 0; // eslint-disable-line no-bitwise
  }

  return hash;
}

/**
 * Browser cookies are required to use the cart. This function checks if
 * cookies are enabled in the browser.
 */
export function cookiesEnabled() {
  if (navigator.cookieEnabled) {
    return true
  }

  document.cookie = 'testcookie=1; SameSite=Strict; Secure'
  const cookieEnabled = document.cookie.includes('testcookie')

  // Remove after checking
  document.cookie = 'testcookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure'

  return cookieEnabled
}

/**
 * Pluralizes the unit for the nuber passed in.
 * Usage mirrors the Shopify 'pluralize' string filter
 *
 * @param {Number} num
 * @param {String} singular
 * @param {String} plural
 * @return {String}
 */
export function pluralize(num, singular, plural)  {
  let output = '';

  const number = parseInt(num);

  if (number === 1) {
    output = singular;
  }
  else {
    output = plural;
    if (typeof plural === 'undefined') {
      output = `${singular}s`; // last resort, turn singular into a plural
    }
  }
  return output;
}

/**
 * Performs a post request by way of a form submit
 * Pulled from Shopify's shopify_common.js
 *
 * @param {String} t - url
 * @return {Object} e - parameters
 */
export function postLink(t, e) {
  const n = (e = e || {}).method || 'post';
  const i = e.parameters || {};
  const o = document.createElement('form');

  /* eslint-disable */
  for (const r in o.setAttribute('method', n), o.setAttribute('action', t), i) {
    const l = document.createElement('input');
    l.setAttribute('type', 'hidden');
    l.setAttribute('name', r);
    l.setAttribute('value', i[r]);
    o.appendChild(l);
  }

  document.body.appendChild(o);
  o.submit();
  document.body.removeChild(o);
  /* eslint-enable */
}


/**
 * Returns a string with all HTML entities decoded
 * See: https://stackoverflow.com/questions/1147359/how-to-decode-html-entities-using-jquery#answer-1395954
 *
 * @param {String} encodedString
 * @return {String}
 */
export function decodeEntities(encodedString) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = encodedString;
  return textArea.value;
}

/**
 * Checks if a url is an external link or not
 *
 * @param {String} url
 * @return {Bool}
 */
export function isExternal(url) {
  /* eslint-disable */
  const match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
  if (typeof match[1] === 'string' && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) return true;
  if (typeof match[2] === 'string' && match[2].length > 0 && match[2].replace(new RegExp(":("+{"http:":80,"https:":443}[location.protocol]+")?$"), "") !== location.host) return true;
  return false;
  /* eslint-enable */
}

export function isTouch() {
  if ('ontouchstart' in window) {
    return true
  }
  
  return false
}

export function random(min = 0, max = 1) {
  return Math.floor(Math.random() * (max - min + 1) + min);     
}

/**
 * Pads a number with leading character (z) up to the specified width
 *
 * @param {Number} n
 * @param {Number} width
 * @param {Number} z - pad value
 * @return {Number}
 */
export function pad(n, width, z) {
  z = z || '0';
  n += '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export function clamp(num, a, b) {
  return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
}

export function getScrollY() {
  return window.scrollY || window.pageYOffset;
}

export function credits() {
  if (window && window.location && window.location.hostname !== 'localhost') {
    // eslint-disable-next-line no-console, max-len
    console.log('%cdesign + development courtesy of...', 'font-family: Helvetica; font-size: 11px;');
  }
}

export function targetBlankExternalLinks() {
  for(var c = document.getElementsByTagName("a"), a = 0;a < c.length;a++) {
    var b = c[a];

    if (b.getAttribute("href") && b.hostname !== location.hostname) {
      b.target = "_blank"

      // This is for a11y
      b.setAttribute('aria-label', 'Link opens in a new window')
    }
  }
}
