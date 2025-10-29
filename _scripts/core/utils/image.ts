/**
 * Image Helper Functions
 * -----------------------------------------------------------------------------
 * A collection of functions that help with basic image operations.
 *
 */

/**
 * Loads and caches an image in the browsers cache.
 * @param {string} path - An image url
 */
export function loadImage(path: string): void {
  new Image().src = path;
}

export function removeProtocol(path: string): string {
  return path.replace(/http(s)?:/, '');
}

/**
 * Find the Shopify image attribute size
 *
 * @param {string} src
 * @returns {null}
 */
export function imageSize(src: string): string | null {
  const match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);

  if (match) {
    return match[1];
  }

  return null;
}

/**
 * Adds a Shopify size attribute to a URL
 *
 * @param src
 * @param size
 * @returns {*}
 */
export function getSizedImageUrl(src: string, size: string | null): string | null {
  if (size === null || src === null) {
    return src;
  }

  if (size === 'master') {
    return removeProtocol(src);
  }

  const match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif|webp)(\?v=\d+)?$/i);
  let url = null;

  if (match) {
    const prefix = src.split(match[0]);
    const suffix = match[0];
    url = removeProtocol(prefix[0] + '_' + size + suffix);
  }

  return url;
}

/**
 * Preloads an image in memory and uses the browsers cache to store it until needed.
 *
 * @param {string | string[]} images - A list of image urls
 * @param {string | null} size - A shopify image size attribute
 */
export function preload(images: string | string[], size: string | null): void {
  if (typeof images === 'string') {
    images = [images];
  }

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    loadImage(getSizedImageUrl(image, size));
  }
}
