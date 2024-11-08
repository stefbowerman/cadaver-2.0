import BaseSection from './base'
import ProductCard from '../components/product/productCard'

export default class SearchSection extends BaseSection {
  static TYPE = 'search'

  constructor(container) {
    super(container)
    
    this.productCards = this.qsa(ProductCard.SELECTOR).map(el => new ProductCard(el))
  }
}