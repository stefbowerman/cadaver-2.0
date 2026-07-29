import type { LiteCart } from '@/types/shopify'
import type { CartAPIEvent } from '@/core/cartAPI'
import { setAriaFlag, setAriaState } from '@/core/utils/a11y'
import FocusTrap from '@/core/focusTrap'

import BaseComponent from '@/components/base'
import Backdrop from '@/components/backdrop'
import CartBody from '@/components/ajaxCart/cartBody'
import CartFooter from '@/components/ajaxCart/cartFooter'

const selectors = {
  close: '[data-ajax-cart-close]'
}

const classes = {
  empty: 'is-empty',
  bodyCartOpen: 'ajax-cart-open'
}

// NOTE: This component takes a lot of inspiration from the drawer component but is purposely built separately so that it can easily be modified to work differently/independently

interface AJAXCartOptions {
  onOpenComplete?: () => void
  onCloseComplete?: () => void
}

export default class AJAXCart extends BaseComponent {
  static TYPE = 'ajax-cart'

  settings: AJAXCartOptions
  role: string | null
  focusTrap: FocusTrap
  cartBody: CartBody
  cartFooter: CartFooter
  backdrop: Backdrop

  constructor(el: HTMLElement, cartData: LiteCart, options: AJAXCartOptions = {}) {
    super(el, {
      watchCartUpdate: true
    })

    this.settings = {
      ...options
    }

    this.role = this.el.getAttribute('role')

    this.cartBody = new CartBody(this.qsRequired(CartBody.SELECTOR), cartData)
    this.cartFooter = new CartFooter(this.qsRequired(CartFooter.SELECTOR))

    this.focusTrap = new FocusTrap(this.el, {
      autofocus: false,
      returnFocus: false,
      preventScroll: true
    })

    this.backdrop = Backdrop.generate(document.body, {
      ariaControls: this.el.id,
      title: 'Close cart'
    })

    this.onBodyClick = this.onBodyClick.bind(this)
    this.onTransitionEnd = this.onTransitionEnd.bind(this)

    this.el.addEventListener('transitionend', this.onTransitionEnd)
    document.body.addEventListener('click', this.onBodyClick)

    // Set empty state based on initial cart data
    this.setEmpty(cartData.item_count === 0)

    const role = this.role
    if (role) {
      this.ariaControlElements.forEach(el => el.setAttribute('aria-haspopup', role))
    }
  }

  destroy() {
    this.focusTrap.destroy()

    document.body.classList.remove(classes.bodyCartOpen)
    document.body.removeEventListener('click', this.onBodyClick)

    this.ariaControlElements.forEach(el => el.removeAttribute('aria-haspopup'))

    super.destroy()
  }

  get isOpen() {
    return !this.isAriaHidden
  }

  setEmpty(isEmpty: boolean) {
    this.el.classList.toggle(classes.empty, isEmpty)
  }  

  toggle() {
    return this.isOpen ? this.close() : this.open()
  }  

  open() {
    if (this.isOpen) return

    setAriaFlag(this.el, 'aria-hidden', false)
    setAriaFlag(this.el, 'aria-modal', true)

    this.el.inert = false
    this.backdrop.show()
    this.ariaControlElements.forEach(el => setAriaState(el, 'aria-expanded', true))
    document.body.classList.add(classes.bodyCartOpen)
  }

  close() {
    if (!this.isOpen) return

    setAriaFlag(this.el, 'aria-hidden', true)
    setAriaFlag(this.el, 'aria-modal', false)

    this.el.inert = true
    this.backdrop.hide()
    this.ariaControlElements.forEach(el => setAriaState(el, 'aria-expanded', false))
    this.focusTrap.deactivate()
    document.body.classList.remove(classes.bodyCartOpen)
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

  onCartUpdate(e: CartAPIEvent) {
    const { cart } = e.detail

    this.setEmpty(cart.item_count === 0)
    
    this.open()
  }

  onBodyClick(e: MouseEvent) {
    const target = e.target as HTMLElement

    if (target?.closest(selectors.close)) {
      return this.onCloseClick(e)
    }
    else if (this.ariaControlElements.some(el => 
      el.isSameNode(target) || el.contains(target)
    )) {
      e.preventDefault()
      this.toggle()
    } 
  }

  onCloseClick(e: MouseEvent) {
    e.preventDefault()
    this.close()
  }
}
