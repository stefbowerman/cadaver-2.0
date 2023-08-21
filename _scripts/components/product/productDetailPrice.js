import { formatMoney, stripZeroCents } from '../../core/currency'

const selectors = {
  price: '[data-price]',
  compareText: '[data-compare-text]',
  comparePrice: '[data-compare-price]'
}

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
      const price = stripZeroCents(formatMoney(variant.price, app.moneyFormat))
      const comparePrice = stripZeroCents(formatMoney(variant.compare_at_price, app.moneyFormat))

      this.$price.html(price)

      if (variant.compare_at_price > variant.price) {
        this.$comparePrice.html(comparePrice)
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