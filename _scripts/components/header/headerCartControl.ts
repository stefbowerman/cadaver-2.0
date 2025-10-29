import BaseComponent from '@/components/base'
import type { CartAPIEvent } from '@/core/cartAPI'

const selectors = {
  count: '[data-count]'
}

const classes = {
  hasItems: 'has-items'
}

export default class HeaderCartControl extends BaseComponent {
  static TYPE = 'header-cart-control'

  count: HTMLElement

  constructor(el: HTMLElement) {
    super(el, {
      watchCartUpdate: true,
    })

    this.count = this.qs(selectors.count)
  }

  onCartUpdate(e: CartAPIEvent) {
    const { cart } = e.detail
    
    this.count.innerText = cart.item_count.toString()
    this.el.classList.toggle(classes.hasItems, cart.item_count > 0)
  }
}