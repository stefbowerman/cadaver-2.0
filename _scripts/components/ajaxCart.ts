import { toAriaBoolean } from '@/core/utils/a11y'
import FocusTrap from '@/core/focusTrap'
import type { LiteCart } from '@/types/shopify'
import type { CartAPIEvent } from '@/core/cartAPI'

import BaseComponent from '@/components/base'
import Backdrop from '@/components/backdrop'
import CartBody from '@/components/ajaxCart/cartBody'
import CartFooter from '@/components/ajaxCart/cartFooter'

const selectors = {
  close: '[data-ajax-cart-close]',
  toggle: '[data-ajax-cart-toggle][aria-controls]' // Not scoped to the component
}

const classes = {
  open: 'is-open',
  empty: 'is-empty',
  bodyCartOpen: 'ajax-cart-open'
}

// NOTE: This component takes a lot of inspiration from the drawer component but is purposely built separately so that it can easily be modified to work differently/independently

export default class AJAXCart extends BaseComponent {
  static TYPE = 'ajax-cart'

  isOpen: boolean
  requestInProgress: boolean
  role: string | null
  cartBody: CartBody
  cartFooter: CartFooter
  focusTrap: FocusTrap
  backdrop: Backdrop

  constructor(el: HTMLElement, cartData: LiteCart) {
    super(el, {
      watchCartUpdate: true,
    })

    this.isOpen = false
    this.requestInProgress = false
    this.role = this.el.getAttribute('role')

    this.cartBody = new CartBody(this.qs(CartBody.SELECTOR), cartData)
    this.cartFooter = new CartFooter(this.qs(CartFooter.SELECTOR))
    
    this.focusTrap = new FocusTrap(this.el, {
      autofocus: false,
      returnFocus: false,
      preventScroll: true
    })

    this.backdrop = Backdrop.generate(document.body, {
      ariaControls: this.el.id,
      ariaExpanded: false
    })

    this.onBodyClick = this.onBodyClick.bind(this)

    document.body.addEventListener('click', this.onBodyClick)

    // Set empty state based on initial cart data
    this.setEmpty(cartData.item_count === 0)

    if (this.role) {
      this.ariaControlElements.forEach(el => el.setAttribute('aria-haspopup', this.role))
    }
  }

  destroy() {
    this.focusTrap.destroy()

    document.body.classList.remove(classes.bodyCartOpen)    
    document.body.removeEventListener('click', this.onBodyClick)

    super.destroy()
  }

  setEmpty(isEmpty: boolean) {
    this.el.classList.toggle(classes.empty, isEmpty)
  }  

  toggle() {
    return this.isOpen ? this.close() : this.open()
  }  

  open() {
    if (this.isOpen) return

    this.el.classList.add(classes.open)
    this.el.setAttribute('aria-hidden', toAriaBoolean(false))
    this.el.removeAttribute('inert')

    this.backdrop.show()

    this.ariaControlElements.forEach(el => el.setAttribute('aria-expanded', toAriaBoolean(true)))

    document.body.classList.add(classes.bodyCartOpen)

    this.focusTrap.activate()  // @NOTE - If using JS for animation, activation should happen on openComplete
    
    this.isOpen = true
  }

  close() {
    if (!this.isOpen) return

    this.el.classList.remove(classes.open)
    this.el.setAttribute('aria-hidden', toAriaBoolean(true))
    this.el.setAttribute('inert', toAriaBoolean(true))

    this.backdrop.hide()

    this.ariaControlElements.forEach(el => el.setAttribute('aria-expanded', toAriaBoolean(false)))  
    
    document.body.classList.remove(classes.bodyCartOpen)

    this.focusTrap.deactivate() // @NOTE - If using JS for animation, deactivation should happen on closeStart

    this.isOpen = false
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

  onToggleClick(e: MouseEvent) {
    e.preventDefault()

    this.toggle()
  }

  onCloseClick(e: MouseEvent) {
    e.preventDefault()
    this.close()
  }
}