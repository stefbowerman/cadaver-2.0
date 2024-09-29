import { events as AJAXCartEvents } from '../ajaxCart'
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

    this.count = this.el.querySelector(selectors.count)

    // @TODO - Should be coming from a cart update event, not AJAXCartEvents.RENDER
    this.onAJAXCartRender = this.onAJAXCartRender.bind(this)

    // @TODO - Convert to vanilla
    $window.on(AJAXCartEvents.RENDER, this.onAJAXCartRender)
  }

  destroy() {
    $window.off(AJAXCartEvents.RENDER, this.onAJAXCartRender)

    super.destroy()
  }

  onAJAXCartRender({ cart }) {
    this.count.innerText = cart.item_count
    this.el.classList.toggle(classes.hasItems, cart.item_count > 0)
  }
}