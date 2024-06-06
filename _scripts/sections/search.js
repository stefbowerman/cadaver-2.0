import BaseSection from './base'
import ProductCardSet from '../components/product/productCardSet'

export default class SearchSection extends BaseSection {
  constructor(container) {
    super(container, 'search')
    
    this.productCardSet = new ProductCardSet($(ProductCardSet.selector, this.$container).first())
  }

  onUnload() {
    super.onUnload()
    
    this.productCardSet.destroy()
  }
}