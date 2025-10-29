import { getQueryParams } from '@/core/utils'

import BaseSection from '@/sections/base'
import AJAXCart from '@/components/ajaxCart'

const selectors = {
  cartJson: '[data-cart-json]'
}

export default class AJAXCartSection extends BaseSection {
  static TYPE = 'ajax-cart'

  ajaxCart: AJAXCart

  constructor(container: HTMLElement) {
    super(container)

    const cartData = JSON.parse(this.qs(selectors.cartJson).textContent)

    this.ajaxCart = new AJAXCart(this.qs(AJAXCart.SELECTOR), cartData)

    // If redirected from the cart, show the ajax cart after a short delay
    if (getQueryParams().cart) {
      this.open({ delay: true })
    }     
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
