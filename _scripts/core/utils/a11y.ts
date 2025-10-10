/**
 * Returns whether the use prefers reduced motion or not
 *
 * @return {Boolean}
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Sets the ARIA current attribute on a link element based on the current path.
 *
 * @param {HTMLAnchorElement} link - The link element to set the ARIA attribute on.
 * @param {string} currentPath - The current path to compare against the link's pathname.
 * @return {void} 
 */
export function setAriaCurrent(link: HTMLAnchorElement, currentPath: string): void {
  if (!(link instanceof HTMLAnchorElement)) {
    console.warn('Invalid link element provided.')
    return
  }

  if (typeof currentPath !== 'string') {
    console.warn('Current path must be a string.')
    return
  }

  if (!link.href) return

  const isExactMatch = link.pathname === currentPath

  if (isExactMatch) {
    link.setAttribute('aria-current', 'page')
  }
  else {
    link.removeAttribute('aria-current')
  }  
}

/**
 * Converts a boolean value to its string representation ('true' or 'false').
 * Used for ARIA attributes that require string values of 'true' or 'false'
 * rather than boolean values (e.g., aria-expanded, aria-hidden, aria-selected).
 * 
 * @param {boolean} value - The boolean value to convert
 * @returns {string} The string representation ('true' or 'false') for use in ARIA attributes
 * @example
 * element.setAttribute('aria-expanded', booleanAsString(isExpanded));
 */
export function toAriaBoolean(value: boolean): string {
  return value ? 'true' : 'false'
}