import BaseSection from './base'

import { events as breakpointEvents } from '../core/breakpoints'

const selectors = {
  toggle: '[data-mobile-menu-toggle]',
  searchForm: '[data-search-form]'
}

const classes = {
  isOpen: 'is-open',
  bodyIsOpen: 'mobile-menu-open'
}

export default class MobileMenuSection extends BaseSection {
  constructor(container) {
    super(container, 'mobile-menu')

    this.$searchForm = $(selectors.searchForm, this.$container) // I don't think this selector

    this.isOpen = false

    this.onToggleClick = this.onToggleClick.bind(this)
    this.onBreakpointChange = this.onBreakpointChange.bind(this)

    this.$searchForm.on('submit', this.onSearchFormSubmit.bind(this))

    $body.on('click', selectors.toggle, this.onToggleClick)
    $window.on(breakpointEvents.BREAKPOINT_CHANGE, this.onBreakpointChange)
  }

  onUnload() {
    super.onUnload()

    $body.off('click', selectors.toggle, this.onToggleClick)
    $window.off(breakpointEvents.BREAKPOINT_CHANGE, this.onBreakpointChange)
  }

  open() {
    this.$container.addClass(classes.isOpen)
    $body.addClass(classes.bodyIsOpen)
    
    this.isOpen = true
  }

  close() {
    this.$container.removeClass(classes.isOpen)
    $body.removeClass(classes.bodyIsOpen)

    if (this.$container.has(document.activeElement)) {
      document.activeElement.blur()
    }

    this.isOpen = false
  }

  toggle() {
    this.isOpen ? this.close() : this.open()
  }

  onSearchFormSubmit(e) {
    if (window.app.taxi) {
      e.preventDefault()

      const q = this.$searchForm.find('[name="q"]').val() // Could probably use $.fn.serialize here...
      const type = this.$searchForm.find('[name="type"]').val() || 'product'

      window.app.taxi.navigateTo(`${this.$searchForm.attr('action')}?type=${type}&q=${q}`)

      return false
    }
  }

  onBreakpointChange(e) {
    if (!this.isOpen) return

    if (!['xs', 'sm'].includes(e.bpMinWidthKey)) {
      this.close()
    }
  }

  onToggleClick(e) {
    e.preventDefault()
    
    this.toggle()
  }  

  onSelect() {
    this.open()
  }

  onDeselect() {
    this.close()
  }

  onNavigateOut() {
    this.close()
  }
}
