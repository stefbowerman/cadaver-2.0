import type { LiteVariant } from '@/types/shopify'
import { getAppString } from '@/core/utils/string'
import BaseComponent from '@/components/base'

const selectors = {
  priceValue: '[data-price-value]',
  priceLabel: '[data-price-label]',
  compare: '[data-compare]',
  comparePrice: '[data-compare-price]'
}

export default class ProductPrice extends BaseComponent {
  static TYPE = 'product-price'

  labelPrice: string
  labelSalePrice: string
  priceValue: HTMLElement
  priceLabel: HTMLElement
  compare: HTMLElement | null
  comparePrice: HTMLElement | null

  constructor(el: HTMLElement) {
    super(el)

    this.labelPrice = this.el.dataset.labelPrice || getAppString('productPrice') || 'Price'
    this.labelSalePrice = this.el.dataset.labelSalePrice || getAppString('productSalePrice') || 'Sale Price'

    this.priceValue = this.qsRequired(selectors.priceValue)
    this.priceLabel = this.qsRequired(selectors.priceLabel)

    // These only exists if one or more product variants have a compare at price
    this.compare = this.qs(selectors.compare)
    this.comparePrice = this.qs(selectors.comparePrice)
  }

  /**
   * Updates the product price display based on the given variant.
   *
   * @param variant - The product variant object.
   * @param variant.price_formatted - The formatted price of the variant.
   * @param variant.price - The price of the variant.
   * @param variant.compare_at_price - The compare at price of the variant.
   * @param variant.compare_at_price_formatted - The formatted compare at price of the variant.
   */  
  update(variant?: LiteVariant) {
    if (variant) {
      const onSale = variant.compare_at_price && variant.compare_at_price > variant.price
      
      if (this.priceValue) {
        this.priceValue.textContent = variant.price_formatted
      }

      if (this.priceLabel) {
        this.priceLabel.textContent = onSale ? this.labelSalePrice : this.labelPrice
      }
            
      if (this.compare && this.comparePrice) {
        this.comparePrice.textContent = onSale ? variant.compare_at_price_formatted : ''
        this.compare.hidden = !onSale
      }
    }

    this.el.hidden = !variant  // Hide price if variant doesn't exist
  }
}
