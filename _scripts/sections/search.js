import BaseSection from './base'
import ProductCardSet from '../components/product/productCardSet'

export default class SearchSection extends BaseSection {
  static TYPE = 'search'

  constructor(container) {
    super(container, 'search')
    
    this.productCardSet = new ProductCardSet($(ProductCardSet.selector, this.$container).first())
  }

  onUnload() {    
    this.productCardSet.destroy()

    super.onUnload()
  }
}