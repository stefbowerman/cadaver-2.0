import BaseComponent, { type BaseComponentSettings } from '@/components/base'
import Backdrop from '@/components/backdrop'

import { toAriaBoolean } from '@/core/utils/a11y'
import FocusTrap from '@/core/focusTrap'
import { BreakpointChangeEvent } from '@/core/breakpointsController'

const selectors = {
  scroller: '[data-scroller]',
  close: '[data-close]'
}

const classes = {
  isOpen: 'is-open',
  bodyIsOpen: 'drawer-open'
}

interface DrawerSettings extends BaseComponentSettings {
  maxBreakpoint?: number | null
  backdrop?: boolean
}

export default class Drawer extends BaseComponent {
  static TYPE = 'drawer'

  settings: DrawerSettings
  role: string | null
  focusTrap: FocusTrap
  scroller: HTMLElement | undefined
  backdrop: Backdrop | null

  constructor(el: HTMLElement, options: DrawerSettings = {}) {
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

    this.focusTrap.activate()   // @NOTE - If using JS for animation, activation should happen on openComplete

    if (this.scroller) this.scroller.scrollTop = 0
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

  onBreakpointChange(e: BreakpointChangeEvent) {
    const { detail: { breakpoint } } = e

    if (!this.isOpen || !this.settings.maxBreakpoint) return

    if (breakpoint > this.settings.maxBreakpoint) {
      this.close()
    }
  }

  onClick(e: MouseEvent) {
    const target = e.target as HTMLElement

    if (target?.closest(selectors.close)) {
      e.preventDefault()
      this.close()
    }
  }

  onBodyClick(e: MouseEvent) {
    const target = e.target as HTMLElement

    if (this.ariaControlElements.some(el => 
      el.isSameNode(target) || el.contains(target)
    )) {
      e.preventDefault()
      this.toggle()
    } 
  }  
}