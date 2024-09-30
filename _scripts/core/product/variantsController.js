import { compact } from 'lodash-es'

/**
 * Variant Selection scripts
 * ------------------------------------------------------------------------------
 *
 * Handles change events from the variant inputs in any `cart/add` forms that may
 * exist. Also updates the master select and triggers updates when the variants
 * price or image changes.
 *
 */
export default class VariantsController {
  /**
   * Variant constructor
   *
   * @param {object} options
   */
  constructor(options) {
    this.container = options.container
    this.product = options.product
    this.singleOptionSelector = options.singleOptionSelector
    this.originalSelectorId = options.originalSelectorId
    this.enableHistoryState = options.enableHistoryState
    this.currentVariant = this._getVariantFromOptions()

    this._onSelectChange = this._onSelectChange.bind(this)

    this.container.querySelectorAll(this.singleOptionSelector).forEach((element) => {
      element.addEventListener('change', this._onSelectChange)
    })
  }

  destroy() {
    this.container.querySelectorAll(this.singleOptionSelector).forEach((element) => {
      element.removeEventListener('change', this._onSelectChange)
    })
  }

  /**
   * Get the currently selected options from add-to-cart form. Works with all
   * form input elements.
   *
   * @return {array} options - Values of currently selected variants
   */
  _getCurrentOptions() {
    let currentOptions = Array.from(this.container.querySelectorAll(this.singleOptionSelector)).map((element) => {
      const type = element.getAttribute('type')

      const currentOption = {
        value: element.value,
        index: element.dataset.index,
        name: element.dataset.name
      }

      // Shopify wrote this code...
      if (type === 'radio' || type === 'checkbox') {
        if (element.checked) {
          return currentOption
        }
        else {
          return false
        }
      }
      else {
        return currentOption
      }
    })

    // remove any unchecked input values if using radio buttons or checkboxes
    currentOptions = compact(currentOptions)

    return currentOptions
  }

  /**
   * Find variant based on selected values.
   *
   * @return {object || undefined} found - Variant object from product.variants
   */
  _getVariantFromOptions() {
    const selectedValues = this._getCurrentOptions()
    const variants = this.product.variants
    let found = false

    variants.forEach((variant) => {
      let satisfied = true

      selectedValues.forEach((option) => {
        if (satisfied) {
          satisfied = (option.value === variant[option.index])
        }
      })

      if (satisfied) {
        found = variant
      }
    })

    return found || null
  }

  /**
   * Event handler for when a variant input changes.
   */
  _onSelectChange() {
    const variant = this._getVariantFromOptions()
    const currentOptions = this._getCurrentOptions()

    // Trigger a custom event
    const event = new CustomEvent('variantChange', {
      detail: {
        variant,
        currentOptions
      }
    })

    this.container.dispatchEvent(event)

    if (!variant) {
      return
    }


    this._updateMasterSelect(variant)
    this._updatePrice(variant)
    this.currentVariant = variant

    if (this.enableHistoryState) {
      this._updateHistoryState(variant)
    }
  }

  /**
   * Trigger event when variant price changes.
   *
   * @param  {object} variant - Currently selected variant
   * @return {event} variantPriceChange
   */
  _updatePrice(variant) {
    if (variant.price === this.currentVariant.price && variant.compare_at_price === this.currentVariant.compare_at_price) {
      return;
    }

    // Trigger a custom event
    const event = new CustomEvent('variantPriceChange', {
      detail: {
        variant: variant
      }
    });
    this.container.dispatchEvent(event);
  }

  /**
   * Update history state for product deeplinking
   *
   * @param  {variant} variant - Currently selected variant
   * @return {k}         [description]
   */
  _updateHistoryState(variant) {
    if (!window.history.replaceState || !variant) {
      return;
    }

    const newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
    window.history.replaceState({ path: newurl }, '', newurl);
  }

  /**
   * Update hidden master select of variant change
   *
   * @param  {variant} variant - Currently selected variant
   */
  _updateMasterSelect(variant) {
    const selectElement = this.container.querySelector(this.originalSelectorId)

    if (selectElement) {
      selectElement.value = variant.id
    }
  }
}