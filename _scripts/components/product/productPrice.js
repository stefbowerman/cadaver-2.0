import BaseComponent from '@/components/base'

const selectors = {
  price: '[data-price]',
  compare: '[data-compare]',
  comparePrice: '[data-compare-price]'
}

export default class ProductPrice extends BaseComponent {
  static TYPE = 'product-price'

  constructor(el) {
    super(el)

    this.price = this.qs(selectors.price)
     
    // These only exists if the item is on sale
    this.compare = this.qs(selectors.compare)
    this.comparePrice = this.qs(selectors.comparePrice)
  }

  /**
   * Updates the product price display based on the given variant.
   *
   * @param {Object} variant - The product variant object.
   * @param {string} variant.price_formatted - The formatted price of the variant.
   * @param {number} variant.price - The price of the variant.
   * @param {number} variant.compare_at_price - The compare at price of the variant.
   * @param {string} variant.compare_at_price_formatted - The formatted compare at price of the variant.
   */  
  update(variant) {
    if (variant) {
      this.price.textContent = variant.price_formatted
      
      const onSale = variant.compare_at_price > variant.price
      
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