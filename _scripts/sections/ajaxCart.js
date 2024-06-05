import BaseSection from './base'
import AJAXFormManager, { events } from '../core/ajaxFormManager'
import { getCart } from '../core/cartAPI'
import { getQueryParams } from '../core/utils'
import AJAXCart, { selector as ajaxCartSelector } from '../components/ajaxCart'

const $window = $(window)

export default class AJAXCartSection extends BaseSection {
  constructor(container) {
    super(container, 'ajax-cart')

    this.ajaxCart = new AJAXCart($(ajaxCartSelector, this.$container).first())
    this.ajaxFormManager = new AJAXFormManager()

    // Store callbacks so we can remove them later
    this.callbacks = {
      changeSuccess: e => this.ajaxCart.onChangeSuccess(e.cart),
      changeFail: e => this.ajaxCart.onChangeFail(e.description)
    }

    $window.on(events.ADD_SUCCESS, this.callbacks.changeSuccess)
    $window.on(events.ADD_FAIL, this.callbacks.changeFail)

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

    $window.off(events.ADD_SUCCESS, this.callbacks.changeSuccess)
    $window.off(events.ADD_FAIL, this.callbacks.changeFail)    
  }  

  open({ delay = false }) {
    setTimeout(() => {
      this.ajaxCart.open()
    }, (delay ? 500 : 0))
  }

  close() {
    this.ajaxCart.close()
  }

  onSelect() {
    this.open()
  }

  onDeselect() {
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
