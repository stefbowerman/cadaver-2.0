/**
 * Removes '.00' if found at the end of the string
 *
 * @param  {string} string - formatted price
 * @return {string} formatted value
 */
export function stripTrailingZeros(string: string): string {
  return string.replace(/\.00$/, '')
}