import { isObject } from 'lodash-es'

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

  _log(...args) {
    console.log(`[${this.type}]`, ...args)
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

  get ariaControlElements() {
    return document.querySelectorAll(`[aria-controls="${this.el.id}"]`)
  }
}