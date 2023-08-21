import BaseRenderer from './base'

import ProductSection from '../sections/product'
import ProductRelatedSection from '../sections/productRelated'

export default class ProductRenderer extends BaseRenderer {
  onEnter() {
    super.onEnter()
    
    this.sectionManager.register('product', ProductSection)
    this.sectionManager.register('product-related', ProductRelatedSection)
  }
}