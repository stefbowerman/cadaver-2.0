import CartAPI from '../../core/cartAPI'
import BaseComponent from '../base'

const selectors = {
  submit: '[type="submit"]',
  subtotalPrice: '[data-subtotal-price]'
}


export default class CartFooter extends BaseComponent {
  static TYPE = 'cart-footer'

  constructor(el) {
    super(el)

    this.submit = this.qs(selectors.submit)
    this.subtotalPrice = this.qs(selectors.subtotalPrice)

    this.onCartUpdate = this.onCartUpdate.bind(this)

    window.addEventListener(CartAPI.events.UPDATE, this.onCartUpdate)
  }

  destroy() {
    window.removeEventListener(CartAPI.events.UPDATE, this.onCartUpdate) 

    super.destroy()
  }

  onCartUpdate(e) {
    const { cart } = e.detail

    this.subtotalPrice.textContent = cart.items_subtotal_price_formatted

    if (cart.items.length === 0) {
      this.submit.setAttribute('disabled', 'true')      
    }
    else {
      this.submit.removeAttribute('disabled')
    }
  }
}