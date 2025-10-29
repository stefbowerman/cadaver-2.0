import type { LiteVariant } from '@/types/shopify'
import BaseComponent from '@/components/base'

const selectors = {
  price: '[data-price]',
  compare: '[data-compare]',
  comparePrice: '[data-compare-price]'
}

export default class ProductPrice extends BaseComponent {
  static TYPE = 'product-price'

  price: HTMLElement | undefined
  compare: HTMLElement | undefined
  comparePrice: HTMLElement | undefined

  constructor(el: HTMLElement) {
    super(el)

    this.price = this.qs(selectors.price) as HTMLElement | undefined
     
    // These only exists if the item is on sale
    this.compare = this.qs(selectors.compare) as HTMLElement | undefined
    this.comparePrice = this.qs(selectors.comparePrice) as HTMLElement | undefined
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
  update(variant: LiteVariant) {
    if (variant) {
      const onSale = variant.compare_at_price > variant.price
      
      if (this.price) {
        this.price.textContent = variant.price_formatted
      }
            
      if (this.compare) {
        this.comparePrice.textContent = onSale ? variant.compare_at_price_formatted : ''
        this.comparePrice.style.display = onSale ? '' : 'none'
      }
      
      this.el.style.display = ''
    }
    else {
      this.el.style.display = 'none' // Hide price if variant doesn't exist
    }
  }
}