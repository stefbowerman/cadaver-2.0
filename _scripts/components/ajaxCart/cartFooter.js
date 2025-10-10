import BaseComponent from '@/components/base'

const selectors = {
  submit: '[type="submit"]',
  subtotalPrice: '[data-subtotal-price]'
}


export default class CartFooter extends BaseComponent {
  static TYPE = 'cart-footer'

  constructor(el) {
    super(el, {
      watchCartUpdate: true,
    })

    this.submit = this.qs(selectors.submit)
    this.subtotalPrice = this.qs(selectors.subtotalPrice)
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