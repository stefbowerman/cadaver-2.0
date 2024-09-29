import BaseComponent from '../base'

const selectors = {
  label: '[data-label]'
}

export default class ATCButton extends BaseComponent {
  static TYPE = 'atc-button'

  constructor(el) {
    super(el)

    this.tempText = null

    this.label = this.el.querySelector(selectors.label)
  }

  /**
   * Updates the DOM state of the add to cart button based on the given variant.
   *
   * @param {Object} variant - Shopify variant object
   * @param {boolean} variant.available - Indicates if the variant is available
   */
  update(variant) {
    let isDisabled = true
    let labelText = app.strings.unavailable

    if (variant) {
      if (variant.available) {
        isDisabled = false
        labelText = app.strings.addToCart
      }
      else {
        isDisabled = true
        labelText = app.strings.soldOut
      }
    }

    // Update the button state
    this.el.disabled = isDisabled
    this.label.textContent = labelText
  }

  onAddStart() {
    this.tempText = this.label.innerText // Save a copy of the original text
    this.label.innerText = app.strings.adding || 'Adding...' // Run the "adding" animation
  }

  onAddSuccess() {
    this.label.innerText = app.strings.added || 'Added!'

    setTimeout(() => {
      // Reset the button text
      this.label.innerText = this.tempText
      this.tempText = null
    }, 1000)
  }

  onAddDone() {

  }
}