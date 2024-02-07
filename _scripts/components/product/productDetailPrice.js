const selectors = {
  price: '[data-price]',
  compareText: '[data-compare-text]',
  comparePrice: '[data-compare-price]'
}

export const selector = '[data-product-detail-price]'

export default class ProductDetailPrice {
  constructor(el) {
    this.$el = $(el)
    this.$price = $(selectors.price, this.$el)
    this.$compareText = $(selectors.compareText, this.$el)
    this.$comparePrice = $(selectors.comparePrice, this.$el)
    this.$compareEls = this.$comparePrice.add(this.$compareText)
  }

  update(variant) {
    if (variant) {
      this.$price.html(variant.price_formatted)

      if (variant.compare_at_price > variant.price) {
        this.$comparePrice.html(variant.compare_at_price_formatted)
        this.$compareEls.show()
      }
      else {
        this.$comparePrice.html('')
        this.$compareEls.hide()
      }

      this.$el.show()     
    }
    else {
      this.$el.hide()
    }
  }
}