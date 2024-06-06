export default class ProductCard {
  static selector = '[data-product-card]'

  constructor(el) {
    this.$el = $(el)
  }

  destroy() {
    // 
  }
}