import BaseSection from './base'
import ProductCardSet, { selector as productCardSetSelector } from '../components/product/productCardSet'

export default class SearchSection extends BaseSection {
  constructor(container) {
    super(container, 'search')
    
    this.productCardSet = new ProductCardSet($(productCardSetSelector, this.$container).first())
  }

  onUnload() {
    super.onUnload()
    
    this.productCardSet.destroy()
  }
}