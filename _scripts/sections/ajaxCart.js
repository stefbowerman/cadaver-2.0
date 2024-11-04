import BaseSection from './base'
import AJAXFormManager, { events } from '../core/ajaxFormManager'
import { getCart } from '../core/cartAPI'
import { getQueryParams } from '../core/utils'

import AJAXCart from '../components/ajaxCart'

export default class AJAXCartSection extends BaseSection {
  static TYPE = 'ajax-cart'

  constructor(container) {
    super(container)

    this.ajaxCart = new AJAXCart(this.container.querySelector(AJAXCart.selector))
    this.ajaxFormManager = new AJAXFormManager()

    // Store callbacks so we can remove them later
    this.callbacks = {
      changeSuccess: e => this.ajaxCart.onChangeSuccess(e.detail.cart),
      changeFail: e => this.ajaxCart.onChangeFail(e.detail.description)
    }

    window.addEventListener(events.ADD_SUCCESS, this.callbacks.changeSuccess)
    window.addEventListener(events.ADD_FAIL, this.callbacks.changeFail)

    getCart().then(cart => {
      this.ajaxCart.render(cart)

      // If redirected from the cart, show the ajax cart after a short delay
      if (getQueryParams().cart) {
        this.open({ delay: true })
      }        
    })
  }

  onUnload() {
    super.onUnload()
    
    this.ajaxCart.destroy()
    this.ajaxFormManager.destroy()

    window.removeEventListener(events.ADD_SUCCESS, this.callbacks.changeSuccess)
    window.removeEventListener(events.ADD_FAIL, this.callbacks.changeFail)
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
