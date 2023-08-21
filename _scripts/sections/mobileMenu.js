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

const $window = $(window)
const $body = $(document.body)

export default class MobileMenuSection extends BaseSection {
  constructor(container) {
    super(container, 'mobile-menu')

    this.$searchForm = $(selectors.searchForm, this.$container) // I don't think this selector

    this.isOpen = false
    this.callbacks = {
      bodyToggleClick: this.onToggleClick.bind(this),
      breakpointChange: this.onBreakpointChange.bind(this)
    }

    this.$searchForm.on('submit', this.onSearchFormSubmit.bind(this))

    $body.on('click', selectors.toggle, this.callbacks.bodyToggleClick)
    $window.on(breakpointEvents.BREAKPOINT_CHANGE, this.callbacks.breakpointChange)
  }

  destroy() {
    $body.off('click', selectors.toggle, this.callbacks.bodyToggleClick)
    $window.off(breakpointEvents.BREAKPOINT_CHANGE, this.callbacks.breakpointChange)
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

      window.app.taxi.navigateTo(`/search?q=${q}`)

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

  onUnload() {
    this.destroy()
  }
}
