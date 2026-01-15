import BreakpointsController, { type BreakpointChangeEvent } from '@/core/breakpointsController'
import CartAPI, { type CartAPIEvent } from '@/core/cartAPI'
import { isObject } from '@/core/utils'
import { ThemeEditorBlockDeselectEvent, ThemeEditorBlockSelectEvent } from '@/types/shopify';

const THEME_EDITOR_BLOCK_ATTR = 'data-shopify-editor-block'

export interface BaseComponentSettings {
  watchResize?: boolean;
  watchBreakpoint?: boolean;
  watchScroll?: boolean;
  watchCartUpdate?: boolean;
  watchIntersection?: boolean;
  intersectionOptions?: IntersectionObserverInit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow additional properties from subclasses
}

export default class BaseComponent {
  #settings: BaseComponentSettings;
  #resizeObserver: ResizeObserver | null;
  #intersectionObserver: IntersectionObserver | null;

  el: HTMLElement;
  type: string;

  static TYPE: string = 'base'

  static get SELECTOR(): string {
    return `[data-component="${this.TYPE}"]`
  }

  constructor(el: HTMLElement, options: BaseComponentSettings = {}) {
    this.#settings = {
      watchResize: false,
      watchBreakpoint: false,
      watchScroll: false,
      watchCartUpdate: false,
      watchIntersection: false,
      intersectionOptions: {
        rootMargin: '0px',
        threshold: 0.01,        
      },

      ...options
    }

    this.#resizeObserver = null
    this.#intersectionObserver = null    
    
    this.el = el
    this.type = (this.constructor as typeof BaseComponent).TYPE

    this.validateDom(this.el)

    if (this.type === 'base') {
      console.warn('BaseComponent should not be used directly')
    }

    this.onResize = this.onResize.bind(this)
    this.onIntersection = this.onIntersection.bind(this)
    this.onBreakpointChange = this.onBreakpointChange.bind(this)
    this.onScroll = this.onScroll.bind(this)
    this.onCartUpdate = this.onCartUpdate.bind(this)
    this.onSelfBlockSelect = this.onSelfBlockSelect.bind(this)
    this.onSelfBlockDeselect = this.onSelfBlockDeselect.bind(this)

    if (this.#settings.watchResize) {
      this.#resizeObserver = new ResizeObserver((entries) => this.onResize(entries))
      this.#resizeObserver.observe(this.el)
    }

    if (this.#settings.watchIntersection) {
      this.#intersectionObserver = new IntersectionObserver(this.onIntersection, this.#settings.intersectionOptions)
      this.#intersectionObserver.observe(this.el)
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

    if (this.el.hasAttribute(THEME_EDITOR_BLOCK_ATTR)) {
      window.addEventListener('shopify:block:select', this.#onBlockSelect)
      window.addEventListener('shopify:block:deselect', this.#onBlockDeselect)
    }
  }

  destroy() {
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect()
      this.#resizeObserver = null
    }

    if (this.#intersectionObserver) {
      this.#intersectionObserver.disconnect()
      this.#intersectionObserver = null
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

    if (this.el.hasAttribute(THEME_EDITOR_BLOCK_ATTR)) {
      window.removeEventListener('shopify:block:select', this.#onBlockSelect)
      window.removeEventListener('shopify:block:deselect', this.#onBlockDeselect)
    }

    doComponentCleanup(this)
  }

  #onBlockSelect = (e: ThemeEditorBlockSelectEvent) => {
    if (e.target === this.el) {
      this.onSelfBlockSelect(e)
    }
  }

  #onBlockDeselect = (e: ThemeEditorBlockDeselectEvent) => {
    if (e.target === this.el) {
      this.onSelfBlockDeselect(e)
    }
  }

  get dataset(): DOMStringMap {
    return this.el.dataset
  }

  get isAriaHidden(): boolean {
    return this.el.getAttribute('aria-hidden') === 'true'
  }

  get ariaControlElements(): HTMLElement[] {
    return [...document.querySelectorAll(`[aria-controls="${this.el.id}"]`)] as HTMLElement[]
  }  

  /**
   * Queries for the first element matching the given selector within the component's element,
   * excluding elements that belong to nested components.
   * 
   * @param selector - The CSS selector to query for an element.
   * @param dom - The DOM element to query within.  Defaults to the component's element.
   * @returns The first matching Element object within the component's scope, or undefined if no match is found.
   */
  qs(selector: string, dom: HTMLElement = this.el): HTMLElement | undefined {
    return this.qsa(selector, dom)[0]
  }

  /**
   * Queries for all elements matching the given selector within the component's element,
   * excluding elements that belong to nested components.
   * 
   * @param selector - The CSS selector to query for elements
   * @param dom - The DOM element to query within. Defaults to the component's element
   * @returns An array of matching Element objects within the component's scope
   * 
   * @description
   * This method filters out elements that belong to nested components by checking if the
   * closest parent component is either the querying component itself or matches the
   * selector (which would make it a target of the query rather than a container to exclude).
   */
  qsa(selector: string, dom: HTMLElement = this.el): HTMLElement[] {
    return Array.from(dom.querySelectorAll(selector)).filter(el => {
      const closest = el.closest('[data-component]')

      return closest.isSameNode(this.el) || closest.matches(selector)
    }) as HTMLElement[]
  }

  // Make sure we're working with a DOM element that matches the component selector
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validateDom(dom: any) {
    if (dom instanceof HTMLElement && dom.matches((this.constructor as typeof BaseComponent).SELECTOR)) {
      return true
    }

    console.warn(`[${this.type}] Invalid DOM: Must be an Element matching the component selector`)
    return false
  }

  onResize(entries: ResizeObserverEntry[]) {
    // override in subclass
  }

  onIntersection(entries: IntersectionObserverEntry[]) {
    // override in subclass
  }  

  onBreakpointChange(e: BreakpointChangeEvent) {
    // override in subclass

    // const { detail: { breakpoint, fromBreakpoint, direction } } = e
  }

  onScroll() {
    // override in subclass
  }

  onCartUpdate(e: CartAPIEvent) {
    // override in subclass
  }

  /**
   * Called if this component's block is selected in the theme editor
   * @param e - The event object
   */
  onSelfBlockSelect(e: ThemeEditorBlockSelectEvent) {
    // override in subclass

  }

  /**
   * Called if this component's block is deselected in the theme editor
   * @param e - The event object
   */
  onSelfBlockDeselect(e: ThemeEditorBlockDeselectEvent) {
    // override in subclass
  }
}

/**
 * 
 * Calls 'destroy' on any components that exists as instance variables or inside array instance variables
 * Inspiration from https://github.com/twbs/bootstrap/blob/main/js/src/base-component.js#L39
 * 
 * @param instance - The instance to clean up
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const doComponentCleanup = (instance: any) => {
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