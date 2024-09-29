import BaseSection from './base'
import ProductCardSet from '../components/product/productCardSet'

export default class SearchSection extends BaseSection {
  static TYPE = 'search'

  constructor(container) {
    super(container)
    

    // @TODO - This needs to work with article cards as well
    if (this.container.querySelector(ProductCardSet.SELECTOR)) {
      this.productCardSet = new ProductCardSet(this.container.querySelector(ProductCardSet.SELECTOR))
    }
  }
}