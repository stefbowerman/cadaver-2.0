import CartAPI from '../../core/cartAPI'
import BaseComponent from '../base'

const selectors = {
  count: '[data-count]'
}

const classes = {
  hasItems: 'has-items'
}

export default class HeaderCartControl extends BaseComponent {
  static TYPE = 'header-cart-control'

  constructor(el) {
    super(el)

    this.count = this.qs(selectors.count)

    this.onCartUpdate = this.onCartUpdate.bind(this)

    window.addEventListener(CartAPI.events.UPDATE, this.onCartUpdate)
  }

  destroy() {
    window.removeEventListener(CartAPI.events.UPDATE, this.onCartUpdate)

    super.destroy()
  }

  onCartUpdate({ detail: { cart } }) {
    this.count.innerText = cart.item_count
    this.el.classList.toggle(classes.hasItems, cart.item_count > 0)
  }
}