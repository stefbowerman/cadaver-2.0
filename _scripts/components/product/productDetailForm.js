import { events as AJAXFormManagerEvents } from '../../core/ajaxFormManager'
import Variants from './variants'
import ProductPrice from './productPrice'
import ExpanderGroup from '../expanderGroup'

const selectors = {
  form: 'form[data-add-to-cart-form]',
  productJSON: '[data-product-json]',
  singleOptionSelector: '[data-single-option-selector]',
  originalSelectorId: '[data-product-select]',
  variantOptionValueList: '[data-variant-option-value-list][data-option-position]',
  variantOptionValue: '[data-variant-option-value]',  
  addToCartBtn: '[data-add-to-cart-btn]',
  addToCartText: '[data-add-to-cart-text]'
}

const classes = {
  variantOptionValueActive: 'is-active'
}

export default class ProductDetailForm {
  static selector = '[data-product-detail-form]'

  /**
   * ProductDetailForm constructor
   *
   * @param { HTMLElement } el
   * @param { Object } options
   * @param { Function } config.onVariantChange -  Called when a new variant has been selected from the form,
   * @param { Boolean } config.enableHistoryState - If set to "true", turns on URL updating when switching variant
   */  
  constructor(el, options) {
    const defaults = {
      onVariantChange: () => {},
      enableHistoryState: true
    };

    this.settings = $.extend({}, defaults, options);

    this.$el = $(el);
    this.$form = $(selectors.form, this.$el);
    this.$singleOptionSelectors = $(selectors.singleOptionSelector, this.$el);
    this.$variantOptionValueList = $(selectors.variantOptionValueList, this.$el); // Alternate UI that takes the place of a single option selector (could be swatches, dots, buttons, whatever..)    
    this.$addToCartBtn = $(selectors.addToCartBtn, this.$el);
    this.$addToCartBtnText = $(selectors.addToCartText, this.$el); // Text inside the add to cart button
    this.defaultButtonText = 'Add to Cart'; // this.$addToCartBtnText.text()

    this.product = JSON.parse($(selectors.productJSON, this.$el).html())
    this.price = new ProductPrice(this.$el.get(0).querySelector(ProductPrice.SELECTOR))
    
    this.variants = new Variants({
      $container: this.$el,
      enableHistoryState: this.settings.enableHistoryState,
      singleOptionSelector: selectors.singleOptionSelector,
      originalSelectorId: selectors.originalSelectorId,
      product: this.product
    })

    this.expanderGroup = new ExpanderGroup($(ExpanderGroup.selector, this.$el).first())

    this.onAddStart = this.onAddStart.bind(this)
    this.onAddDone = this.onAddDone.bind(this)    

    this.$el.on('variantChange', this.onVariantChange.bind(this))
    this.$el.on('click', selectors.variantOptionValue, this.onVariantOptionValueClick.bind(this))
    $window.on(AJAXFormManagerEvents.ADD_START, this.onAddStart)
    $window.on(AJAXFormManagerEvents.ADD_DONE, this.onAddDone)
  }

  destroy() {
    $window.off(AJAXFormManagerEvents.ADD_START, this.onAddStart)
    $window.off(AJAXFormManagerEvents.ADD_DONE, this.onAddDone)
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

  /**
   * Updates the DOM state of the add to cart button
   *
   * @param {Object} variant - Shopify variant object
   */
  updateAddToCartState(variant) {
    let btnText = '';
    let btnDisabled = false;

    if (variant) {
      if (variant.available) {
        btnDisabled = false
        btnText = app.strings.addToCart
      }
      else {
        btnDisabled = true
        btnText = app.strings.soldOut
      }      
    }
    else {
      btnDisabled = true
      btnText = app.strings.unavailable
    }

    this.$addToCartBtn.prop('disabled', btnDisabled);
    this.$addToCartBtnText.text(btnText);
  }

  onVariantChange({ variant, currentOptions }) {
    this.updateVariantOptionValues(variant)
    this.updateAddToCartState(variant)
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

  onAddStart({ relatedTarget }) {
    if (!this.$form.is(relatedTarget)) return
      
    this.$addToCartBtnText.text('Adding...')
  }

  onAddDone({ relatedTarget }) {
    if (!this.$form.is(relatedTarget)) return

    this.$addToCartBtnText.text(this.defaultButtonText)
  }
}