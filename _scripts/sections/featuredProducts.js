import BaseSection from './base'
import ProductCardSet from '../components/product/productCardSet'

export default class FeaturedProductsSection extends BaseSection {
  constructor(container) {
    super(container, 'featured-products')

    this.productCardSet = new ProductCardSet($(ProductCardSet.selector, this.$container).first())
  }

  onUnload() {
    super.onUnload()
    
    this.productCardSet.destroy()
  }
}