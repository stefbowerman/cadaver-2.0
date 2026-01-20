type DisabledElement = HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement

/**
 * Checks if the given object is a DOM element.
 * @param {*} object - The object to check.
 * @returns {boolean} True if the object is a DOM element, false otherwise.
 */
export const isElement = (object: unknown): boolean => {
  if (!object || typeof object !== 'object') {
    return false
  }

  return object instanceof Element || object instanceof Document
}

/**
 * Checks if the given element is disabled.
 * @param {Element} element - The element to check.
 * @returns {boolean} True if the element is disabled, false otherwise.
 */
export const isDisabled = (element: Element): boolean => {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return true
  }

  if (element.classList.contains('disabled')) {
    return true
  }

  if ('disabled' in element) {
    return (element as DisabledElement).disabled
  }  

  return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false'
}

/**
 * Checks if the given element is visible.
 * @param {Element} element - The element to check.
 * @returns {boolean} True if the element is visible, false otherwise.
 */
export const isVisible = (element: Element): boolean => {
  if (!isElement(element) || element.getClientRects().length === 0) {
    return false
  }

  const elementIsVisible = getComputedStyle(element).getPropertyValue('visibility') === 'visible'
  // Handle `details` element as its content may falsie appear visible when it is closed
  const closedDetails = element.closest('details:not([open])')

  if (!closedDetails) {
    return elementIsVisible
  }

  if (closedDetails !== element) {
    const summary = element.closest('summary')
    if (summary && summary.parentNode !== closedDetails) {
      return false
    }

    if (summary === null) {
      return false
    }
  }

  return elementIsVisible
}

/**
 * Gets all focusable children of a given element.
 * @param element - The parent element to search within.
 * @returns An array of focusable child elements.
 */
export const getFocusableChildren = (element: Element): HTMLElement[] => {
  const focusables = [
    'a[href]',
    'button',
    'input',
    'textarea',
    'select',
    'details',
    '[tabindex]:not([tabindex^="-"])',
    '[contenteditable="true"]'
  ].join(',')

  const children = Array.from(element.querySelectorAll(focusables)) as HTMLElement[]

  return children.filter(el => !isDisabled(el) && isVisible(el))  
}

/**
 * Wraps the given element in a wrapper element.
 * @param element - The element to wrap.
 * @param wrapperSelector - The selector of the wrapper element.
 * @param wrapperClass - The class to add to the wrapper element.
 */
export const wrap = (element: Element, wrapperSelector: string, wrapperClass: string): void => {
  const wrapper = document.createElement(wrapperSelector)
  wrapper.classList.add(wrapperClass)
  element.replaceWith(wrapper)
  wrapper.appendChild(element)
}

export const getDomFromString = (string: string): Document => {
  return new DOMParser().parseFromString(string, 'text/html')
}

/**
 * Fetches the DOM from the given URL.
 * @param url - The URL to fetch the DOM from.
 * @returns The DOM.
 */
export const fetchDom = async (url: string | URL, signal?: AbortSignal): Promise<Document | undefined> => {
  try {
    const response = await fetch(url, { signal })

    if (!response.ok) throw new Error('Network response was not ok')

    const responseText = await response.text()
    const dom = getDomFromString(responseText)

    return dom
  }
  catch (e) {
    if (e.name === 'AbortError') {
      console.log('Fetch aborted by user')
      return undefined
    }

    console.warn('something went wrong...', e)
    return undefined
  }
}