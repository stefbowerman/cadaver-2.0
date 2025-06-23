import BaseComponent from './base'
import SearchInline from './search/searchInline'

import { BREAKPOINTS } from '../core/breakpointsController'
import { toAriaBoolean } from '../core/utils/a11y'
import FocusTrap from '../core/focusTrap'

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
    this.role = this.el.getAttribute('role')

    this.onBodyClick = this.onBodyClick.bind(this)

    this.searchInline = new SearchInline(this.qs(SearchInline.SELECTOR))    

    this.focusTrap = new FocusTrap(this.el, {
      autofocus: false,
      returnFocus: false,
      preventScroll: true
    })    

    document.body.addEventListener('click', this.onBodyClick)

    if (this.role) {
      this.ariaControlElements.forEach(el => el.setAttribute('aria-haspopup', this.role))
    }    
  }

  destroy() {
    this.focusTrap.destroy()
    document.body.removeEventListener('click', this.onBodyClick)

    this.ariaControlElements.forEach(el => el.removeAttribute('aria-haspopup'))

    super.destroy()
  }
  
  open() {
    this.el.classList.add(classes.isOpen)
    this.el.setAttribute('aria-hidden', toAriaBoolean(false))

    document.body.classList.add(classes.bodyIsOpen)
    this.ariaControlElements.forEach(el => el.setAttribute('aria-expanded', toAriaBoolean(true)))

    this.el.removeAttribute('inert')

    this.focusTrap.activate()

    this.isOpen = true
  }

  close() {
    this.el.classList.remove(classes.isOpen)
    this.el.setAttribute('aria-hidden', toAriaBoolean(true))
    
    document.body.classList.remove(classes.bodyIsOpen)
    this.ariaControlElements.forEach(el => el.setAttribute('aria-expanded', toAriaBoolean(false))) 

    this.el.setAttribute('inert', toAriaBoolean(true))

    this.focusTrap.deactivate()

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