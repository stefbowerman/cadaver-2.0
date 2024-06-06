import BaseSection from './base'
import ProductCardSet from '../components/product/productCardSet'

export default class CollectionSection extends BaseSection {
  constructor(container) {
    super(container, 'collection')

    this.productCardSet = new ProductCardSet($(ProductCardSet.selector).first())
  }

  onUnload() {
    super.onUnload()
    
    this.productCardSet.destroy()
  }
}
