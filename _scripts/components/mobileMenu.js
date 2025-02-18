import BaseComponent from './base'

import BreakpointsController, { BREAKPOINTS } from '../core/breakpointsController'

const selectors = {
  toggle: '[data-mobile-menu-toggle]',
  searchForm: '[data-search-form]'
}

const classes = {
  isOpen: 'is-open',
  bodyIsOpen: 'mobile-menu-open'
}

export default class MobileMenu extends BaseComponent {
  static TYPE = 'mobile-menu'

  constructor(el) {
    super(el)

    this.searchForm = this.qs(selectors.searchForm)

    this.isOpen = false

    this.onBreakpointChange = this.onBreakpointChange.bind(this)
    this.onBodyClick = this.onBodyClick.bind(this)

    this.searchForm.addEventListener('submit', this.onSearchFormSubmit.bind(this))

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

  onSearchFormSubmit(e) {
    if (!window.app.taxi) {
      return
    }

    e.preventDefault()

    const data = new FormData(this.searchForm)

    const q = data.get('q')
    const type = data.get('type') || 'product'

    if (!q) {
      return // @TODO - Show error ?
    }

    window.app.taxi.navigateTo(`${this.searchForm.action}?type=${type}&q=${q}`)

    return false
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