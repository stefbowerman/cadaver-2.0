import BaseComponent from '../base'
import ProductCard from './productCard'

export default class ProductCardSet extends BaseComponent {
  static TYPE = 'product-card-set'

  constructor(el) {
    super(el)

    this.productCards = [...this.el.querySelectorAll(ProductCard.SELECTOR)].map(el => new ProductCard(el))
  }
}