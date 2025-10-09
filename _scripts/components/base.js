import BreakpointsController from '../core/breakpointsController'
import CartAPI from '../core/cartAPI'
import { isObject } from '../core/utils'

export default class BaseComponent {
  #settings;

  static TYPE = 'base'

  static get SELECTOR() {
    return `[data-component="${this.TYPE}"]`
  }

  constructor(el, options = {}) {
    this.#settings = {
      watchResize: false,
      watchBreakpoint: false,
      watchScroll: false,
      watchCartUpdate: false,
      ...options
    }
    
    this.el = el
    this.type = this.constructor.TYPE

    this.validateDom(this.el)

    if (this.type === 'base') {
      console.warn('BaseComponent should not be used directly')
    }

    this.resizeObserver = null
    this.onResize = this.onResize.bind(this)
    this.onBreakpointChange = this.onBreakpointChange.bind(this)
    this.onScroll = this.onScroll.bind(this)
    this.onCartUpdate = this.onCartUpdate.bind(this)

    if (this.#settings.watchResize) {
      this.resizeObserver = new ResizeObserver((entries) => this.onResize(entries))
      this.resizeObserver.observe(this.el)
    }

    if (this.#settings.watchBreakpoint) {
      window.addEventListener(BreakpointsController.EVENTS.CHANGE, this.onBreakpointChange)
    }

    if (this.#settings.watchScroll) {
      window.addEventListener('scroll', this.onScroll)
    }

    if (this.#settings.watchCartUpdate) {
      window.addEventListener(CartAPI.EVENTS.UPDATE, this.onCartUpdate)
    }
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    if (this.#settings.watchBreakpoint) {
      window.removeEventListener(BreakpointsController.EVENTS.CHANGE, this.onBreakpointChange)
    }

    if (this.#settings.watchScroll) {
      window.removeEventListener('scroll', this.onScroll)
    }

    if (this.#settings.watchCartUpdate) {
      window.removeEventListener(CartAPI.EVENTS.UPDATE, this.onCartUpdate)
    }

    doComponentCleanup(this)
  }

  get dataset() {
    return this.el.dataset
  }

  get isAriaHidden() {
    return this.el.getAttribute('aria-hidden') === 'true'
  }

  get ariaControlElements() {
    return [...document.querySelectorAll(`[aria-controls="${this.el.id}"]`)]
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

      return closest.isSameNode(this.el) || closest.matches(selector)
    })
  }

  // Make sure we're working with a DOM element that matches the component selector
  validateDom(dom) {
    if (!(dom instanceof Element || dom.matches(this.constructor.SELECTOR))) {
      console.warn(`[${this.type}] Invalid DOM: Must be an Element matching the component selector`)
      
      return false
    }

    return true
  }

  // eslint-disable-next-line no-unused-vars
  onResize(entries) {
    // override in subclass
  }

  // eslint-disable-next-line no-unused-vars
  onBreakpointChange({ detail: { breakpoint, fromBreakpoint, direction } }) {
    // override in subclass
  }

  onScroll() {
    // override in subclass
  }

  onCartUpdate({ detail: { cart } }) {
    // override in subclass
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