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
    super(el, {
      watchCartUpdate: true,
    })

    this.count = this.qs(selectors.count)
  }

  onCartUpdate({ detail: { cart } }) {
    this.count.innerText = cart.item_count
    this.el.classList.toggle(classes.hasItems, cart.item_count > 0)
  }
}