import BaseSection from './base'
import { events as AJAXCartEvents } from '../components/ajaxCart'

const selectors = {
  cartCount: '[data-cart-count]',
  cartToggle: '[data-ajax-cart-toggle]'
}

const classes = {
  hasItems: 'has-items'
}

export default class HeaderSection extends BaseSection {
  static TYPE = 'header'

  constructor(container) {
    super(container, 'header');
    
    this.$cartCount = $(selectors.cartCount, this.$container)
    this.$cartToggle = $(selectors.cartToggle, this.$container)

    this.onAJAXCartRender = this.onAJAXCartRender.bind(this)

    $window.on(AJAXCartEvents.RENDER, this.onAJAXCartRender)
  }

  onUnload() {    
    $window.off(AJAXCartEvents.RENDER, this.onAJAXCartRender)

    super.onUnload()
  }

  onAJAXCartRender({ cart }) {
    this.$cartCount.text(cart.item_count)
    this.$cartToggle.toggleClass(classes.hasItems, cart.item_count > 0)
  }
}
