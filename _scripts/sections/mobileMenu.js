import BaseSection from './base'

import BreakpointsController, { BREAKPOINTS } from '../core/breakpointsController'

const selectors = {
  toggle: '[data-mobile-menu-toggle]',
  searchForm: '[data-search-form]'
}

const classes = {
  isOpen: 'is-open',
  bodyIsOpen: 'mobile-menu-open'
}

export default class MobileMenuSection extends BaseSection {
  static TYPE = 'mobile-menu'

  constructor(container) {
    super(container)

    this.searchForm = this.container.querySelector(selectors.searchForm)

    this.isOpen = false

    // this.onToggleClick = this.onToggleClick.bind(this)
    this.onBreakpointChange = this.onBreakpointChange.bind(this)
    this.onBodyClick = this.onBodyClick.bind(this)

    this.searchForm.addEventListener('submit', this.onSearchFormSubmit.bind(this))

    document.body.addEventListener('click', this.onBodyClick)
    window.addEventListener(BreakpointsController.events.CHANGE, this.onBreakpointChange)  
  }

  onUnload() {
    document.body.removeEventListener('click', this.onBodyClick)
    window.removeEventListener(BreakpointsController.events.CHANGE, this.onBreakpointChange)  
    
    super.onUnload()
  }

  open() {
    this.container.classList.add(classes.isOpen)
    document.body.classList.add(classes.bodyIsOpen)
    
    this.isOpen = true
  }

  close() {
    this.container.classList.remove(classes.isOpen)
    document.body.classList.remove(classes.bodyIsOpen)

    if (this.$container.has(document.activeElement)) {
      document.activeElement.blur()
    }

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

  onSectionSelect() {
    this.open()
  }

  onSectionDeselect() {
    this.close()
  }

  onNavigateOut() {
    this.close()
  }
}
