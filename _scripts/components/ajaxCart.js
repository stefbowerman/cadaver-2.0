import { toAriaBoolean } from '@/core/utils/a11y'
import FocusTrap from '@/core/focusTrap'

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

export default class AJAXCart extends BaseComponent {
  static TYPE = 'ajax-cart'

  constructor(el, cartData) {
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

    this.backdrop = Backdrop.generate(document.body)
    this.backdrop.el.addEventListener('click', this.close.bind(this))  // Do this until ajax cart uses aria-controls elements

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

  setEmpty(isEmpty) {
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

  onCartUpdate(e) {
    const { cart } = e.detail

    this.setEmpty(cart.item_count === 0)
    
    this.open()
  }

  onBodyClick(e) {
    if (e.target.closest(selectors.close)) {
      return this.onCloseClick(e)
    }
    else if (e.target.closest(selectors.toggle)?.getAttribute('aria-controls') === this.el.id) {
      return this.onToggleClick(e)
    }
  }

  onToggleClick(e) {
    e.preventDefault()

    this.toggle()
  }

  onCloseClick(e) {
    e.preventDefault()
    this.close()
  }
}