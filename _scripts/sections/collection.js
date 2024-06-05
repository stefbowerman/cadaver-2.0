import BaseSection from './base'
import ProductCardSet, { selector as productCardSetSelector } from '../components/product/productCardSet'

export default class CollectionSection extends BaseSection {
  constructor(container) {
    super(container, 'collection')

    this.productCardSet = new ProductCardSet($(productCardSetSelector, this.$container).first())
  }

  onUnload() {
    super.onUnload()
    
    this.productCardSet.destroy()
  }
}
