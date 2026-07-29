import BaseComponent from '@/components/base'
import type { CartAPIEvent } from '@/core/cartAPI'

const selectors = {
  submit: '[type="submit"]',
  subtotalPrice: '[data-subtotal-price]'
}


export default class CartFooter extends BaseComponent {
  static TYPE = 'cart-footer'

  submit: HTMLButtonElement
  subtotalPrice: HTMLElement

  constructor(el: HTMLElement) {
    super(el, {
      watchCartUpdate: true,
    })
    
    this.submit = this.qsRequired<HTMLButtonElement>(selectors.submit)
    this.subtotalPrice = this.qsRequired(selectors.subtotalPrice)
  }

  onCartUpdate(e: CartAPIEvent) {
    const { cart } = e.detail

    this.subtotalPrice.textContent = cart.items_subtotal_price_formatted

    if (cart.items.length === 0) {
      this.submit.disabled = true
    }
    else {
      this.submit.disabled = false
    }
  }
}