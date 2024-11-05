/**
 * Removes '.00' if found at the end of the string
 *
 * @param  {string} value - formatted price (see above)
 * @return {string} value - formatted value
 */
export function stripTrailingZeros(string) {
  return string.replace(/\.00$/, '')
}
