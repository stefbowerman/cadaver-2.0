import BaseSection from './base'
import ProductCardSet from '../components/product/productCardSet'

export default class CollectionSection extends BaseSection {
  static TYPE = 'collection'

  constructor(container) {
    super(container, 'collection')

    this.productCardSet = new ProductCardSet($(ProductCardSet.selector).first())
  }

  onUnload() {    
    this.productCardSet.destroy()
    
    super.onUnload()
  }
}
