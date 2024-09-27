import BaseSection from './base'
import ProductCardSet from '../components/product/productCardSet'

export default class ProductRelatedSection extends BaseSection {
  static TYPE = 'product-related'

  constructor(container) {
    super(container, 'product-related')

    this.$productCardSet = $(ProductCardSet.selector, this.$container)
    this.$content = $('[data-content]', this.$container)

    $.ajax({
      type: 'get',
      url: this.$container.data('url'),
      success: (sectionHtml) => {
        const $section = $(sectionHtml)
        const $sectionContents = $section.children()

        if ($sectionContents.length === 0) {
          this.$container.hide()
          return  
        }

        this.$content.html($sectionContents)
        this.productCardSet = new ProductCardSet(this.$productCardSet)
      },
      error: () => {
        this.$container.hide()
      }
    })
  }

  onUnload() {
    this.productCardSet && this.productCardSet.destroy()

    super.onUnload()
  }
}