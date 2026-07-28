export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function setOrRemoveAttr(el: HTMLElement, attr: string, value?: string): void {
  value !== undefined ? el.setAttribute(attr, value) : el.removeAttribute(attr)
}

const AriaFlagAttributes = ['aria-hidden', 'aria-modal', 'aria-disabled', 'aria-busy'] as const
type AriaFlagAttribute = typeof AriaFlagAttributes[number]

export function setAriaFlag(el: HTMLElement, attr: AriaFlagAttribute, value: boolean): void {
  setOrRemoveAttr(el, attr, value ? 'true' : undefined)
}

// For attributes where absent = "doesn't apply" — always sets "true" or "false"
const AriaStateAttributes = ['aria-expanded', 'aria-selected', 'aria-checked', 'aria-pressed', 'aria-invalid'] as const
type AriaStateAttribute = typeof AriaStateAttributes[number]

export function setAriaState(el: HTMLElement, attr: AriaStateAttribute, value: boolean): void {
  el.setAttribute(attr, value ? 'true' : 'false')
}

const AriaCurrentValues = ['page', 'step', 'location', 'date', 'time', 'true'] as const
type AriaCurrentValue = typeof AriaCurrentValues[number]

export function setAriaCurrent(el: HTMLElement, value?: AriaCurrentValue): void {
  setOrRemoveAttr(el, 'aria-current', value)
}

export function setLinkAriaCurrent(link: HTMLAnchorElement, currentPath: string): void {
  if (!(link instanceof HTMLAnchorElement)) {
    console.warn('Invalid link element provided.')
    return
  }

  if (typeof currentPath !== 'string') {
    console.warn('Current path must be a string.')
    return
  }

  if (!link.href) return

  setAriaCurrent(link, link.pathname === currentPath ? 'page' : undefined)
}
