import { events as AJAXFormManagerEvents } from '../../core/ajaxFormManager'
import VariantsController from '../../core/product/variantsController'

import BaseComponent from '../base'
import ProductPrice from './productPrice'
import ATCButton from './atcButton'

const selectors = {
  form: 'form[data-add-to-cart-form]',
  productJSON: '[data-product-json]',
  singleOptionSelector: '[data-single-option-selector]',
  originalSelectorId: '[data-product-select]',
  variantOptionValueList: '[data-variant-option-value-list][data-option-position]',
  variantOptionValue: '[data-variant-option-value]'
}

const classes = {
  variantOptionValueActive: 'is-active'
}

export default class ProductDetailForm extends BaseComponent {
  static TYPE = 'product-detail-form'
  static selector = '[data-product-detail-form]'

  /**
   * ProductDetailForm constructor
   *
   * @param { HTMLElement } el
   * @param { Object } options
   * @param { Function } options.onVariantChange -  Called when a new variant has been selected from the form,
   * @param { Boolean } options.enableHistoryState - If set to "true", turns on URL updating when switching variant
   */  
  constructor(el, options = {}) {
    super(el)

    this.settings = {
      onVariantChange: () => {},
      enableHistoryState: true,
      ...options
    }    

    this.$el = $(el)

    this.form = this.qs(selectors.form)

    this.$singleOptionSelectors = $(selectors.singleOptionSelector, this.$el)
    this.$variantOptionValueList = $(selectors.variantOptionValueList, this.$el) // Alternate UI that takes the place of a single option selector (could be swatches, dots, buttons, whatever..)    

    this.product = JSON.parse(this.qs(selectors.productJSON).textContent)
    this.price = new ProductPrice(this.el.querySelector(ProductPrice.SELECTOR))
    
    this.variantsController = new VariantsController({
      container: this.el,
      enableHistoryState: this.settings.enableHistoryState,
      singleOptionSelector: selectors.singleOptionSelector,
      originalSelectorId: selectors.originalSelectorId,
      product: this.product
    }) 

    this.atcButton = new ATCButton(this.el.querySelector(ATCButton.SELECTOR))

    this.onAddStart = this.onAddStart.bind(this)
    this.onAddSuccess = this.onAddSuccess.bind(this)    

    this.$el.on('variantChange', this.onVariantChange.bind(this))
    this.$el.on('click', selectors.variantOptionValue, this.onVariantOptionValueClick.bind(this))
    window.addEventListener(AJAXFormManagerEvents.ADD_START, this.onAddStart)
    window.addEventListener(AJAXFormManagerEvents.ADD_SUCCESS, this.onAddSuccess)
  }

  destroy() {
    this.variantsController.destroy()

    window.removeEventListener(AJAXFormManagerEvents.ADD_START, this.onAddStart)
    window.removeEventListener(AJAXFormManagerEvents.ADD_SUCCESS, this.onAddSuccess)
  }

  /**
   * Updates the DOM state of the elements matching the variantOption Value selector based on the currently selected variant
   *
   * @param {Object} variant - Shopify variant object
   */
  updateVariantOptionValues(variant) {
    if (variant) {
      // Loop through all the options and update the option value
      for (let i = 1; i <= 3; i++) {
        const variantOptionValue = variant[`option${i}`];

        if (!variantOptionValue) break; // Break if the product doesn't have an option at this index

        // Since we are finding the variantOptionValueUI based on the *actual* value, we need to scope to the correct list
        // As some products can have the same values for different variant options (waist + inseam both use "32", "34", etc..)
        const $list = this.$variantOptionValueList.filter(`[data-option-position="${i}"]`);
        const $variantOptionValueUI = $list.find('[data-variant-option-value="' + variantOptionValue + '"]');

        $variantOptionValueUI.addClass(classes.variantOptionValueActive);
        $variantOptionValueUI.siblings().removeClass(classes.variantOptionValueActive);
      }
    }
  }

  onVariantChange(e) {
    const { variant, currentOptions } = e.detail

    this.updateVariantOptionValues(variant)
    
    this.atcButton.update(variant)
    this.price.update(variant)

    this.settings.onVariantChange(variant, currentOptions)
  }

  onVariantOptionValueClick(e) {
    e.preventDefault()

    const $option = $(e.currentTarget)

    if ($option.hasClass(classes.variantOptionValueActive) || $option.hasClass('is-disabled')) {
      return
    }

    const value = $option.data('variant-option-value')
    const position = $option.parents(selectors.variantOptionValueList).data('option-position')
    const $selector = this.$singleOptionSelectors.filter(`[data-index="option${position}"]`)    

    $selector
      .val(value)
      .trigger('change')

    $option.addClass(classes.variantOptionValueActive)
    $option.siblings().removeClass(classes.variantOptionValueActive)
  }

  onAddStart({ detail: { relatedTarget } }) {
    if (this.form !== relatedTarget) return
      
    this.atcButton.onAddStart()
  }

  onAddSuccess({ detail: { relatedTarget } }) {
    if (this.form !== relatedTarget) return

    this.atcButton.onAddSuccess()
  }
}