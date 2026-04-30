import { setAriaFlag, setAriaState } from '@/core/utils/a11y'
import FocusTrap from '@/core/focusTrap'
import { BreakpointChangeEvent } from '@/core/breakpointsController'

import BaseComponent, { type BaseComponentSettings } from '@/components/base'
import Backdrop, { type BackdropOptions } from '@/components/backdrop'

const selectors = {
  scroller: '[data-scroller]',
  close: '[data-close]'
}

const classes = {
  bodyIsOpen: 'drawer-open'
}

interface DrawerSettings extends BaseComponentSettings {
  minBreakpoint?: number | null
  maxBreakpoint?: number | null
  backdrop?: boolean
  backdropOptions?: BackdropOptions
  onOpenComplete?: () => void
  onCloseComplete?: () => void  
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
      watchBreakpoint: (typeof options.minBreakpoint === 'number' || typeof options.maxBreakpoint === 'number') ? true : false,
      ...options
    })

    this.settings = {
      minBreakpoint: null,
      maxBreakpoint: null,
      backdrop: true,
      backdropOptions: {},
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
    this.onTransitionEnd = this.onTransitionEnd.bind(this)

    this.el.addEventListener('click', this.onClick)
    this.el.addEventListener('transitionend', this.onTransitionEnd)
    document.body.addEventListener('click', this.onBodyClick)

    if (this.settings.backdrop) {
      this.backdrop = Backdrop.generate(document.body, {
        ...this.settings.backdropOptions,
        ariaControls: this.el.id
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

    setAriaFlag(this.el, 'aria-hidden', false)
    setAriaFlag(this.el, 'aria-modal', true)

    document.body.classList.add(classes.bodyIsOpen)
    this.ariaControlElements.forEach(el => setAriaState(el, 'aria-expanded', true))

    this.backdrop?.show()

    this.el.inert = false

    if (this.scroller) this.scroller.scrollTop = 0
  }

  close() {
    if (!this.isOpen) return

    setAriaFlag(this.el, 'aria-hidden', true)
    setAriaFlag(this.el, 'aria-modal', false)

    this.backdrop?.hide()
    
    document.body.classList.remove(classes.bodyIsOpen)
    this.ariaControlElements.forEach(el => setAriaState(el, 'aria-expanded', false)) 

    this.el.inert = true

    this.focusTrap.deactivate()
  }

  toggle() {
    this.isOpen ? this.close() : this.open()
  }

  onOpenComplete() {
    this.focusTrap.activate()

    this.settings.onOpenComplete?.()
  }

  onCloseComplete() {
    this.settings.onCloseComplete?.()
  }

  onTransitionEnd(e: TransitionEvent) {
    if (e.target !== this.el) return

    this.isOpen ? this.onOpenComplete() : this.onCloseComplete()
  }  

  onBreakpointChange(e: BreakpointChangeEvent) {
    if (!this.isOpen) return

    const { detail: { breakpoint } } = e

    if (
      (this.settings.maxBreakpoint && breakpoint >= this.settings.maxBreakpoint) ||
      (this.settings.minBreakpoint && breakpoint < this.settings.minBreakpoint)
    ) {
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