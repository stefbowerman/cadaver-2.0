import BaseSection from './base'
import ProductCardSet from '../components/product/productCardSet'

export default class FeaturedProductsSection extends BaseSection {
  static TYPE = 'featured-products'

  constructor(container) {
    super(container, 'featured-products')

    this.productCardSet = new ProductCardSet($(ProductCardSet.selector, this.$container).first())
  }

  onUnload() {   
    this.productCardSet.destroy()
    
    super.onUnload()
  }
}