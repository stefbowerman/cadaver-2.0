import BaseComponent from '@/components/base'
import type { CartAPIEvent } from '@/core/cartAPI'
import { getAppString, pluralize } from '@/core/utils/string'

const selectors = {
  count: '[data-count]',
  countLabel: '[data-count-label]'
}

const classes = {
  hasItems: 'has-items'
}

export default class HeaderCartControl extends BaseComponent {
  static TYPE = 'header-cart-control'

  count: HTMLElement
  countLabel: HTMLElement

  constructor(el: HTMLElement) {
    super(el, {
      watchCartUpdate: true,
    })

    this.count = this.qsRequired(selectors.count)
    this.countLabel = this.qsRequired(selectors.countLabel)
  }

  onCartUpdate(e: CartAPIEvent) {
    const { cart } = e.detail

    this.count.innerText = cart.item_count.toString()
    this.countLabel.textContent = ` ${pluralize(
      cart.item_count,
      getAppString('cartItem', 'item'),
      getAppString('cartItems', 'items')
    )}`
    this.el.classList.toggle(classes.hasItems, cart.item_count > 0)
  }
}
