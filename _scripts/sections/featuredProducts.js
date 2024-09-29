import BaseSection from './base'
import ProductCardSet from '../components/product/productCardSet'

export default class FeaturedProductsSection extends BaseSection {
  static TYPE = 'featured-products'

  constructor(container) {
    super(container)

    this.productCardSet = new ProductCardSet(this.container.querySelector(ProductCardSet.SELECTOR))
  }
}