import BaseSection from './base'
import ProductCard from '../components/product/productCard'

export default class CollectionSection extends BaseSection {
  static TYPE = 'collection'

  constructor(container) {
    super(container)

    this.productCards = this.qsa(ProductCard.SELECTOR).map(el => new ProductCard(el))
  }
}
