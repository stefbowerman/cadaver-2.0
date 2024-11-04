/**
 * Checks if the given object is a DOM element.
 * @param {*} object - The object to check.
 * @returns {boolean} True if the object is a DOM element, false otherwise.
 */
export const isElement = object => {
  if (!object || typeof object !== 'object') {
    return false
  }

  if (typeof object.jquery !== 'undefined') {
    object = object[0]
  }

  return object instanceof Element || object instanceof Document
}

/**
 * Checks if the given element is disabled.
 * @param {Element} element - The element to check.
 * @returns {boolean} True if the element is disabled, false otherwise.
 */
export const isDisabled = element => {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return true
  }

  if (element.classList.contains('disabled')) {
    return true
  }

  if (typeof element.disabled !== 'undefined') {
    return element.disabled
  }

  return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false'
}

/**
 * Checks if the given element is visible.
 * @param {Element} element - The element to check.
 * @returns {boolean} True if the element is visible, false otherwise.
 */
export const isVisible = element => {
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
 * @param {Element} element - The parent element to search within.
 * @returns {Element[]} An array of focusable child elements.
 */
export const getFocusableChildren = element => {
  const focusables = [
    'a[href]',
    'button',
    'input',
    'textarea',
    'select',
    'details',
    '[tabindex]:not([tabindex^="-"]',
    '[contenteditable="true"]'
  ].join(',')

  const children = Array.from(element.querySelectorAll(focusables))

  return children.filter(el => !isDisabled(el) && isVisible(el))  
}

/**
 * Wraps the given element in a wrapper element.
 * @param {Element} element - The element to wrap.
 * @param {string} wrapperSelector - The selector of the wrapper element.
 * @param {string} wrapperClass - The class to add to the wrapper element.
 */
export const wrap = (element, wrapperSelector, wrapperClass) => {
  const wrapper = document.createElement(wrapperSelector)
  wrapper.classList.add(wrapperClass)
  element.replaceWith(wrapper)
  wrapper.appendChild(element)
}

export const getDomFromString = (string) => {
  return new DOMParser().parseFromString(string, 'text/html')
}

/**
 * Fetches the DOM from the given URL.
 * @param {string} url - The URL to fetch the DOM from.
 * @returns {Document} The DOM.
 */
export const fetchDom = async (url) => {
  try {
    const response = await fetch(url)

    if (!response.ok) throw new Error('Network response was not ok')

    const responseText = await response.text()
    const dom = getDomFromString(responseText)

    return dom
  }
  catch (e) {
    console.warn('something went wrong...', e)
  }
}