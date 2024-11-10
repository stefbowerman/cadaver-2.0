import BaseSection from './base'
import CartAPI from '../core/cartAPI'
import { getQueryParams } from '../core/utils'

import AJAXCart from '../components/ajaxCart'

export default class AJAXCartSection extends BaseSection {
  static TYPE = 'ajax-cart'

  constructor(container) {
    super(container)

    this.ajaxCart = new AJAXCart(this.qs(AJAXCart.SELECTOR))

    this.onCartUpdate = e => this.ajaxCart.onChangeSuccess(e.detail.cart)

    window.addEventListener(CartAPI.events.UPDATE, this.onCartUpdate)

    CartAPI.getCart().then(cart => {
      this.ajaxCart.render(cart)

      // If redirected from the cart, show the ajax cart after a short delay
      if (getQueryParams().cart) {
        this.open({ delay: true })
      }        
    })
  }

  onUnload() {
    window.removeEventListener(CartAPI.events.UPDATE, this.onCartUpdate)

    super.onUnload()
  }  

  open({ delay = false } = {}) {
    setTimeout(() => {
      this.ajaxCart.open()
    }, (delay ? 500 : 0))
  }

  close() {
    this.ajaxCart.close()
  }

  onSectionSelect() {
    this.open()
  }

  onSectionDeselect() {
    this.close()
  }

  onNavigateOut() {
    this.close()
  }

  onNavigateIn() {
    if (getQueryParams().cart) {
      this.open({ delay: true })
    } 
  }
}
