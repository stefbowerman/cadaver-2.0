import BaseSection from './base'
import ProductCardSet from '../components/product/productCardSet'

export default class CollectionSection extends BaseSection {
  static TYPE = 'collection'

  constructor(container) {
    super(container)

    this.productCardSet = new ProductCardSet(this.container.querySelector(ProductCardSet.SELECTOR))
  }
}
