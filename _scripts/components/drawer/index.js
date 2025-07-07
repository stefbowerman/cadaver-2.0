import BaseComponent from '../base'
import Backdrop from '../backdrop'

import { toAriaBoolean } from '../../core/utils/a11y'
import FocusTrap from '../../core/focusTrap'

const selectors = {
  scroller: '[data-scroller]',
  close: '[data-close]'
}

const classes = {
  isOpen: 'is-open',
  bodyIsOpen: 'drawer-open'
}

export default class Drawer extends BaseComponent {
  static TYPE = 'drawer'

  constructor(el, options = {}) {
    super(el, {
      watchBreakpoint: options.maxBreakpoint ? true : false,
      ...options
    })

    this.settings = {
      maxBreakpoint: null,
      backdrop: true,
      ...options
    }

    this.role = this.el.getAttribute('role')

    this.focusTrap = new FocusTrap(this.el, {
      autofocus: false,
      returnFocus: false,
      preventScroll: true
    })

    this.scroller = this.qs(selectors.scroller)
    this.backdrop = null

    this.onClick = this.onClick.bind(this)
    this.onBodyClick = this.onBodyClick.bind(this)

    this.el.addEventListener('click', this.onClick)
    document.body.addEventListener('click', this.onBodyClick)

    if (this.settings.backdrop) {
      this.backdrop = Backdrop.generate(document.body, {
        ariaControls: this.el.id,
        ariaExpanded: false
      })
    }    

    if (this.role) {
      this.ariaControlElements.forEach(el => el.setAttribute('aria-haspopup', this.role))
    }     
  }

  destroy() {
    this.backdrop?.destroy()
    this.focusTrap.destroy()
    document.body.removeEventListener('click', this.onBodyClick)

    this.ariaControlElements.forEach(el => el.removeAttribute('aria-haspopup'))

    super.destroy()
  }

  get isOpen() {
    return !this.isAriaHidden
  }

  open() {
    if (this.isOpen) return

    this.el.classList.add(classes.isOpen)
    this.el.setAttribute('aria-hidden', toAriaBoolean(false))
    this.el.setAttribute('aria-modal', toAriaBoolean(true))

    document.body.classList.add(classes.bodyIsOpen)
    this.ariaControlElements.forEach(el => el.setAttribute('aria-expanded', toAriaBoolean(true)))

    this.backdrop?.show()

    this.el.removeAttribute('inert')

    this.focusTrap.activate()

    this.scroller.scrollTop = 0
  }

  close() {
    if (!this.isOpen) return

    this.el.classList.remove(classes.isOpen)
    this.el.setAttribute('aria-hidden', toAriaBoolean(true))
    this.el.setAttribute('aria-modal', toAriaBoolean(false))


    this.backdrop?.hide()
    
    document.body.classList.remove(classes.bodyIsOpen)
    this.ariaControlElements.forEach(el => el.setAttribute('aria-expanded', toAriaBoolean(false))) 

    this.el.setAttribute('inert', toAriaBoolean(true))

    this.focusTrap.deactivate()
  }

  toggle() {
    this.isOpen ? this.close() : this.open()
  }

  onBreakpointChange({ detail: { breakpoint } }) {
    if (!this.isOpen || !this.settings.maxBreakpoint) return

    if (breakpoint > this.settings.maxBreakpoint) {
      this.close()
    }
  }

  onClick(e) {
    if (e.target.closest(selectors.close)) {
      e.preventDefault()
      this.close()
    }
  }

  onBodyClick(e) {
    if (this.ariaControlElements.filter(el => {
      return (
        el.isSameNode(e.target) ||
        el.contains(e.target)
      )
    }).length > 0) {
      e.preventDefault()
      this.toggle()
    }  
  }  
}