import BaseSection from './base'
import ProductCard from '../components/product/productCard'

export default class FeaturedProductsSection extends BaseSection {
  static TYPE = 'featured-products'

  constructor(container) {
    super(container)

    this.productCards = this.qsa(ProductCard.SELECTOR).map(el => new ProductCard(el))
  }
}