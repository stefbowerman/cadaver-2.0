import ProductCard, { selector as productCardSelector } from './productCard'

export const selector = '[data-product-card-set]'

export default class ProductCardSet {
  constructor(el) {
    this.$el = $(el)  
    
    this.productCards = $.map(this.$el.find(productCardSelector), el => new ProductCard(el))
  }

  destroy() {
    this.productCards.forEach(p => p.destroy())
  }
}