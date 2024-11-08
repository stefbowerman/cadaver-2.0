import { isObject } from 'lodash-es'

export default class BaseComponent {
  static TYPE = 'base'

  static get SELECTOR() {
    return `[data-component="${this.TYPE}"]`
  }

  constructor(el) {
    this.el = el
    this.type = this.constructor.TYPE

    if (this.type === 'base') {
      console.warn('BaseComponent should not be used directly')
    }
  }

  get dataset() {
    return this.el.dataset
  }

  /**
   * Queries for the first element matching the given selector within the component's element,
   * excluding elements that belong to nested components.
   * 
   * @param {string} selector - The CSS selector to query for an element.
   * @param {Element} dom - The DOM element to query within.  Defaults to the component's element.
   * @returns {Element|undefined} The first matching Element object within the component's scope, or undefined if no match is found.
   */
  qs(selector, dom = this.el) {
    return this.qsa(selector, dom)[0]
  }

  /**
   * Queries for all elements matching the given selector within the component's element,
   * excluding elements that belong to nested components.
   * 
   * @param {string} selector - The CSS selector to query for elements
   * @param {Element} [dom=this.el] - The DOM element to query within. Defaults to the component's element
   * @returns {Element[]} An array of matching Element objects within the component's scope
   * 
   * @description
   * This method filters out elements that belong to nested components by checking if the
   * closest parent component is either the querying component itself or matches the
   * selector (which would make it a target of the query rather than a container to exclude).
   */
  qsa(selector, dom = this.el) {
    return [...dom.querySelectorAll(selector)].filter(el => {
      const closest = el.closest('[data-component]')

      return closest.isSameNode(dom) || closest.matches(selector)
    })
  }  

  _log(...args) {
    console.log(`[${this.type}]`, ...args) // eslint-disable-line no-console
  }

  destroy() {
    doComponentCleanup(this)
  }

  // Make sure we're working with 
  validateDom(dom) {
    if (!(dom instanceof Element || dom.matches(this.constructor.SELECTOR))) {
      this._log('Invalid DOM: Must be an Element matching the component selector')
      
      return false
    }

    return true
  }

  get isAriaHidden() {
    return this.el.getAttribute('aria-hidden') === 'true'
  }

  get ariaControlElements() {
    return document.querySelectorAll(`[aria-controls="${this.el.id}"]`)
  }
}

/**
 * 
 * Calls 'destroy' on any components that exists as instance variables or inside array instance variables
 * Inspiration from https://github.com/twbs/bootstrap/blob/main/js/src/base-component.js#L39
 * 
 * @param {object} instance
 */
export const doComponentCleanup = (instance) => {
  if (!isObject(instance)) {
    return
  }

  Object.values(instance).forEach(value => {
    if (value instanceof BaseComponent) {
      value.destroy() // console.log('calling destroy on', value)
    }
    else if (Array.isArray(value)) {
      value.forEach(item => { // console.log('found an array => ', value)
        if (item instanceof BaseComponent) {
          item.destroy()
        }
      })
    }
  })
}