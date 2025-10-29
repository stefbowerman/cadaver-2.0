import type { LiteVariant } from '@/types/shopify'
import BaseComponent from '@/components/base'
import { getAppString } from '@/core/utils/string'

const selectors = {
  label: '[data-label]'
}

export default class ATCButton extends BaseComponent {
  static TYPE = 'atc-button'

  declare el: HTMLButtonElement;

  tempText: string | null
  label: HTMLElement
  successTimeoutId: ReturnType<typeof setTimeout> | null

  constructor(el: HTMLButtonElement) {
    super(el)

    this.tempText = null
    this.successTimeoutId = null

    this.label = this.qs(selectors.label) as HTMLElement

    if (!this.label) {
      console.warn('No label found')
    }
  }

  destroy() {
    window.clearTimeout(this.successTimeoutId)

    super.destroy()
  }

  /**
   * Updates the DOM state of the add to cart button based on the given variant.
   *
   * @param variant - LiteVariant object
   */
  update(variant: LiteVariant) {
    let isDisabled = true
    let labelText = getAppString('unavailable', 'Unavailable')

    if (variant) {
      if (variant.available) {
        isDisabled = false
        labelText = getAppString('addToCart', 'Add To Cart')
      }
      else {
        isDisabled = true
        labelText = getAppString('soldOut', 'Sold Out')
      }
    }

    // Update the button state
    this.el.disabled = isDisabled
    this.label.textContent = labelText
  }

  onAddStart() {
    this.tempText = this.label.innerText // Save a copy of the original text
    this.label.innerText = getAppString('adding', 'Adding...') // Run the "adding" animation
  }

  onAddSuccess() {
    this.label.innerText = getAppString('added', 'Added!')

    this.successTimeoutId = setTimeout(() => {
      // Reset the button text
      this.label.innerText = this.tempText
      this.tempText = null
    }, 1000)
  }

  onAddFail(e: Error) {
    this.label.innerText = this.tempText
  }
}