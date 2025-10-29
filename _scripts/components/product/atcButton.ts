import type { LiteVariant } from '@/types/shopify'
import BaseComponent from '@/components/base'

const selectors = {
  label: '[data-label]'
}

export default class ATCButton extends BaseComponent {
  static TYPE = 'atc-button'

  declare el: HTMLButtonElement;
  tempText: string | null
  label: HTMLElement

  constructor(el: HTMLButtonElement) {
    super(el)

    this.tempText = null

    this.label = this.qs(selectors.label) as HTMLElement

    if (!this.label) {
      console.warn('No label found')
    }
  }

  // @TODO - Move this to a utility function
  getString(key: string, fallback: string): string {
    return window.app?.strings?.[key] || fallback
  }

  /**
   * Updates the DOM state of the add to cart button based on the given variant.
   *
   * @param variant - LiteVariant object
   */
  update(variant: LiteVariant) {
    let isDisabled = true
    let labelText = this.getString('unavailable', 'Unavailable')

    if (variant) {
      if (variant.available) {
        isDisabled = false
        labelText = this.getString('addToCart', 'Add To Cart')
      }
      else {
        isDisabled = true
        labelText = this.getString('soldOut', 'Sold Out')
      }
    }

    // Update the button state
    this.el.disabled = isDisabled
    this.label.textContent = labelText
  }

  onAddStart() {
    this.tempText = this.label.innerText // Save a copy of the original text
    this.label.innerText = this.getString('adding', 'Adding...') // Run the "adding" animation
  }

  onAddSuccess() {
    this.label.innerText = this.getString('added', 'Added!')

    // @TODO - Add this timeout as an instance variable
    setTimeout(() => {
      // Reset the button text
      this.label.innerText = this.tempText
      this.tempText = null
    }, 1000)
  }

  onAddFail(e: Error) {
    this.label.innerText = this.tempText
  }
}