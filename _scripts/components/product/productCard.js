export const selector = '[data-product-card]'

export default class ProductCard {
  constructor(el) {
    this.$el = $(el)
  }

  destroy() {
    // 
  }
}