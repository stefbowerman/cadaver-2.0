// Heavily inspired by Bootstrap's focusTrap - https://github.com/twbs/bootstrap/blob/main/js/src/util/focustrap.js

import { getFocusableChildren } from '@/core/utils/dom'

type FocusTrapOptions = {
  autofocus?: boolean
  returnFocus?: boolean
  preventScroll?: boolean
  onFocusin?: (element: Element) => void
}

export default class FocusTrap {
  settings: FocusTrapOptions
  el: HTMLElement
  isActive: boolean
  lastTabNavDirection: null | 'forward' | 'backward'
  focusableElements: HTMLElement[]
  previouslyFocusedElement: HTMLElement | null

  constructor(el: HTMLElement, options: FocusTrapOptions = {}) {
    this.settings = {
      autofocus: true,
      returnFocus: true,
      preventScroll: false,
      onFocusin: () => {},
      ...options
    }

    if (!el || !(el instanceof Element)) {
      throw new Error('Invalid element provided')
    }

    this.el = el
    this.isActive = false
    this.lastTabNavDirection = null
    this.focusableElements = []
    this.previouslyFocusedElement = null

    this.onFocusin = this.onFocusin.bind(this)
    this.onKeydown = this.onKeydown.bind(this)
  }

  destroy() {
    this.deactivate()
  }  

  activate() {
    if (this.isActive) {
      return
    }

    // Store the currently focused element before activating the trap
    this.previouslyFocusedElement = document.activeElement as HTMLElement | null

    this.focusableElements = getFocusableChildren(this.el)
 
    if (this.settings.autofocus) {
      if (this.focusableElements.length) {
        this.focusableElements[0].focus()
      }
      else {
        this.el.focus()
      }
    }

    document.addEventListener('focusin', this.onFocusin)
    document.addEventListener('keydown', this.onKeydown)

    this.isActive = true
  }

  deactivate() {
    this.isActive = false

    document.removeEventListener('focusin', this.onFocusin)
    document.removeEventListener('keydown', this.onKeydown)

    if (this.settings.returnFocus && this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus()
    }
  }

  onFocusin(event: FocusEvent) {
    if (event.target === document || event.target === this.el) {
      return
    }

    let focusEl: HTMLElement | null = null

    if (event.target instanceof HTMLElement && this.el.contains(event.target)) {
      focusEl = event.target
    }
    else {
      if (this.focusableElements.length === 0) {
        focusEl = this.el
      }
      else if (this.lastTabNavDirection === 'backward') {
        focusEl = this.focusableElements[this.focusableElements.length - 1]
      }
      else {
        focusEl = this.focusableElements[0]
      }

      // focusEl isn't event.target so we need to manually focus it
      (focusEl as HTMLElement).focus({
        preventScroll: this.settings.preventScroll
      })
    }

    this.settings.onFocusin(focusEl)
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') {
      return
    }

    this.lastTabNavDirection = event.shiftKey ? 'backward' : 'forward'    
  }
}