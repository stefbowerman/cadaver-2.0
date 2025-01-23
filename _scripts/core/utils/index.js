import { upperFirst, camelCase } from 'lodash-es'

/**
 * Check if we're running the theme inside the theme editor
 *
 * @return {bool}
 */
export function isThemeEditor() {
  return window.Shopify && window.Shopify.designMode
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


export function credits() {
  if (window && window.location && window.location.hostname !== 'localhost') {
    // eslint-disable-next-line no-console, max-len
    console.log('%cdesign + development courtesy of...', 'font-family: Helvetica; font-size: 11px;');
  }
}

export function targetBlankExternalLinks() {
  for(var c = document.getElementsByTagName('a'), a = 0;a < c.length;a++) {
    var b = c[a];

    if (b.getAttribute('href') && b.hostname !== location.hostname) {
      b.target = '_blank'
      b.setAttribute('aria-describedby', 'a11y-new-window-message')
    }
  }
}

/**
 * Ensure we are working with a valid number
 *
 * @param {int|string} qty
 * @param {int} defaultQty
 * @return {int} - Integer quantity.
 */
export function validateQty(qty, defaultQty = 1) {
  return (parseFloat(qty) === parseInt(qty)) && !Number.isNaN(qty) ? parseInt(qty) : defaultQty;
}

/**
 * Returns an index in the array by wrapping around if the specified index does not exist in arr.length - 1
 *
 * @param {Array} arr
 * @param {int} index
 * @return {int} - index
 */
export function getWrappedIndex(arr, index) {
  const len = arr.length

  return ((index % len) + len) % len
}

/**
 * Generates a pseudo-random number based on a seed.
 *
 * @param {number} [seed=0.1] - The seed used to generate the pseudo-random number. Defaults to 0.1 if not provided.
 * @returns {number} A pseudo-random number between 0 and 1.
 */
export const randomFromSeed = (seed = 0.1) => {
  const x = Math.sin(seed) * 1000

  return x - Math.floor(x)
}

/**
 * Generates a unique identifier (UUID) based on the current timestamp.
 *
 * @param {number} [length=9] - The length of the UUID to be generated. Defaults to 9 characters.
 * @returns {string} A unique identifier (UUID) of the specified length.
 */
export function getUUID(length = 9) {
  return randomFromSeed(Date.now()).toString(36).slice(2, length + 2)
}

/**
 * Converts a string to a handle, e.g. "Product Name" becomes "product-name"
 *
 * @param {string} str - The string to be converted to a handle.
 * @returns {string} A valid Shopify handle.
 */
export function toHandle(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '');
}

/**
 * Converts a string to a PascalCase string, e.g. "Product Name" becomes "ProductName"
 *
 * @param {string} str - The string to be converted to PascalCase.
 * @returns {string} A PascalCase string.
 */
export function toPascalCase(str) {
  return upperFirst(camelCase(str))
}

/**
 * Checks if the given value is a valid number.
 *
 * @param {*} value - The value to be checked.
 * @returns {boolean} True if the value is a number and not NaN, false otherwise.
 */
export function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Detects if the current device supports touch events.
 * 
 * @function
 * @returns {boolean} Returns true if the device supports touch events, false otherwise.
 */
export const isTouch = () => {
  if (typeof window === 'undefined') {
    return false
  }

  return 'ontouchstart' in window ||
         navigator.maxTouchPoints > 0 ||
         navigator.msMaxTouchPoints > 0
}

/**
 * Detects if the current device supports WebGL.
 * 
 * @function
 * @returns {boolean} Returns true if the device supports WebGL, false otherwise.
 */
export const hasWebGLSupport = () => {
  if (typeof window === 'undefined') return false

  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

  return gl && gl instanceof WebGLRenderingContext
}