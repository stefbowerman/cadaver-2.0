import BaseSection from './base'
import ProductCardSet, { selector as productCardSetSelector } from '../components/product/productCardSet'

export default class FeaturedProductsSection extends BaseSection {
  constructor(container) {
    super(container, 'featured-products')

    this.productCardSet = new ProductCardSet($(productCardSetSelector, this.$container).first())
  }

  onUnload() {
    this.productCardSet.destroy()
  }
}