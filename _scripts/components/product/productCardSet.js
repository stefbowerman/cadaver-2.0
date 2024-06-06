import ProductCard from './productCard'

export default class ProductCardSet {
  static selector = '[data-product-card-set]'

  constructor(el) {
    this.$el = $(el)  
    
    this.productCards = $.map(this.$el.find(ProductCard.selector), el => new ProductCard(el))
  }

  destroy() {
    this.productCards.forEach(p => p.destroy())
  }
}