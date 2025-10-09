/**
 * Converts the first character of string to upper case.
 * @param {string} str - The string to convert
 * @returns {string} The converted string
 */
export function upperFirst(str) {
  if (!str || typeof str !== 'string') return str || '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts string to camel case.
 * @param {string} str - The string to convert
 * @returns {string} The camel cased string
 */
export function camelCase(str) {
  if (!str || typeof str !== 'string') return '';
  
  // Split on spaces, dashes, underscores, and handle mixed case
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, chr => chr.toLowerCase())
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/_+(.)/g, (_, chr) => chr.toUpperCase());
}

/**
 * Converts string to start case (each word capitalized with spaces).
 * @param {string} str - The string to convert
 * @returns {string} The start cased string
 */
export function startCase(str) {
  if (!str || typeof str !== 'string') return '';
  
  return str
    // Insert space before uppercase letters in camelCase
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Replace non-alphanumeric characters with spaces
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    // Split into words and capitalize each
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}