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

const AriaFlagAttributes = ['aria-hidden', 'aria-modal', 'aria-disabled', 'aria-busy'] as const
type AriaFlagAttribute = typeof AriaFlagAttributes[number]
                                                               
export function setAriaFlag(el: HTMLElement, attr: AriaFlagAttribute, value: boolean): void {
  value ? el.setAttribute(attr, 'true') : el.removeAttribute(attr)
}                                                                          

// For attributes where absent = "doesn't apply" — always sets "true" or "false"                                    
const AriaStateAttributes = ['aria-expanded', 'aria-selected', 'aria-checked', 'aria-pressed', 'aria-invalid'] as const
type AriaStateAttribute = typeof AriaStateAttributes[number]

export function setAriaState(el: HTMLElement, attr: AriaStateAttribute, value: boolean): void {
  el.setAttribute(attr, value ? 'true' : 'false')
}
