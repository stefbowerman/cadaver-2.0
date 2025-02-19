import BaseComponent from './base'
import SearchInline from './search/searchInline'

import BreakpointsController, { BREAKPOINTS } from '../core/breakpointsController'

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
    super(el)

    this.isOpen = false

    this.onBreakpointChange = this.onBreakpointChange.bind(this)
    this.onBodyClick = this.onBodyClick.bind(this)

    this.searchInline = new SearchInline(this.qs(SearchInline.SELECTOR))    

    document.body.addEventListener('click', this.onBodyClick)
    window.addEventListener(BreakpointsController.events.CHANGE, this.onBreakpointChange)     
  }

  destroy() {
    document.body.removeEventListener('click', this.onBodyClick)
    window.removeEventListener(BreakpointsController.events.CHANGE, this.onBreakpointChange)

    super.destroy()
  }
  
  open() {
    this.el.classList.add(classes.isOpen)
    this.el.setAttribute('aria-hidden', 'false')

    document.body.classList.add(classes.bodyIsOpen)
    this.ariaControlElements.forEach(el => el.setAttribute('aria-expanded', 'true'))
    
    this.isOpen = true
  }

  close() {
    this.el.classList.remove(classes.isOpen)
    this.el.setAttribute('aria-hidden', 'true')
    
    document.body.classList.remove(classes.bodyIsOpen)
    this.ariaControlElements.forEach(el => el.setAttribute('aria-expanded', 'false')) 

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