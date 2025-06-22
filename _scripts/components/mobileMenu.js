import BaseComponent from './base'
import SearchInline from './search/searchInline'

import { BREAKPOINTS } from '../core/breakpointsController'
import { toAriaBoolean } from '../core/utils/a11y'

const selectors = {
  toggle: '[data-mobile-menu-toggle][aria-controls]'
}

const classes = {
  isOpen: 'is-open',
  bodyIsOpen: 'mobile-menu-open'
}

export default class MobileMenu extends BaseComponent {
  static TYPE = 'mobile-menu'

  constructor(el) {
    super(el, {
      watchBreakpoint: true,
    })

    this.isOpen = false

    this.onBodyClick = this.onBodyClick.bind(this)

    this.searchInline = new SearchInline(this.qs(SearchInline.SELECTOR))    

    document.body.addEventListener('click', this.onBodyClick)
  }

  destroy() {
    document.body.removeEventListener('click', this.onBodyClick)

    super.destroy()
  }
  
  open() {
    this.el.classList.add(classes.isOpen)
    this.el.setAttribute('aria-hidden', 'false')

    document.body.classList.add(classes.bodyIsOpen)
    this.ariaControlElements.forEach(el => el.setAttribute('aria-expanded', toAriaBoolean(true)))
    
    this.isOpen = true
  }

  close() {
    this.el.classList.remove(classes.isOpen)
    this.el.setAttribute('aria-hidden', 'true')
    
    document.body.classList.remove(classes.bodyIsOpen)
    this.ariaControlElements.forEach(el => el.setAttribute('aria-expanded', toAriaBoolean(false))) 

    this.isOpen = false
  }

  toggle() {
    this.isOpen ? this.close() : this.open()
  }

  onBreakpointChange({ detail: { breakpoint } }) {
    if (!this.isOpen) return

    if (breakpoint > BREAKPOINTS.sm) {
      this.close()
    }
  }

  onBodyClick(e) {
    if (e.target.closest(selectors.toggle)) {
      return this.onToggleClick(e)
    }
  }

  onToggleClick(e) {
    e.preventDefault()
    
    this.toggle()
  }  
}