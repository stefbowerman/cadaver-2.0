import { compact } from '../../core/utils'

/**
 * Variant Selection scripts
 * ------------------------------------------------------------------------------
 *
 * Handles change events from the variant inputs in any `cart/add` forms that may
 * exist. Also updates the master select and triggers updates when the variants
 * price or image changes.
 *
 */
export default class Variants {
  /**
   * Variant constructor
   *
   * @param {object} options
   */  
  constructor(options) {
    this.$container = options.$container;
    this.product = options.product;
    this.singleOptionSelector = options.singleOptionSelector;
    this.originalSelectorId = options.originalSelectorId;
    this.enableHistoryState = options.enableHistoryState;
    this.currentVariant = this._getVariantFromOptions();

    $(this.singleOptionSelector, this.$container).on('change', this._onSelectChange.bind(this));
  }

  /**
   * Get the currently selected options from add-to-cart form. Works with all
   * form input elements.
   *
   * @return {array} options - Values of currently selected variants
   */
  _getCurrentOptions() {
    let currentOptions = $.map($(this.singleOptionSelector, this.$container), (element) => {
      const $element = $(element);
      const type = $element.attr('type');

      const currentOption = {
        value: $element.val(),
        index: $element.data('index'),
        name: $element.data('name')
      };

      /* eslint-disable */
      // Shopify wrote this code...
      if (type === 'radio' || type === 'checkbox') {
        if ($element[0].checked) {
          return currentOption;
        }
        else {
          return false;
        }
      }
      else {
        return currentOption;
      }
      /* eslint-enable */
    });

    // remove any unchecked input values if using radio buttons or checkboxes
    currentOptions = compact(currentOptions);

    return currentOptions;
  }

  /**
   * Find variant based on selected values.
   *
   * @param  {array} selectedValues - Values of variant inputs
   * @return {object || undefined} found - Variant object from product.variants
   */
  _getVariantFromOptions() {
    const selectedValues = this._getCurrentOptions();
    const variants = this.product.variants;
    let found = false;

    variants.forEach((variant) => {
      let satisfied = true;

      selectedValues.forEach((option) => {
        if (satisfied) {
          satisfied = (option.value === variant[option.index]);
        }
      });

      if (satisfied) {
        found = variant;
      }
    });

    return found || null;
  }

  /**
   * Event handler for when a variant input changes.
   */
  _onSelectChange() {
    const variant = this._getVariantFromOptions()
    const currentOptions = this._getCurrentOptions()

    this.$container.trigger({
      type: 'variantChange',
      variant,
      currentOptions
    });

    if (!variant) {
      return;
    }

    this._updateMasterSelect(variant);
    this._updateImages(variant);
    this._updatePrice(variant);
    this.currentVariant = variant;

    if (this.enableHistoryState) {
      this._updateHistoryState(variant);
    }
  }

  /**
   * Trigger event when variant image changes
   *
   * @param  {object} variant - Currently selected variant
   * @return {event}  variantImageChange
   */
  _updateImages(variant) {
    const variantImage = variant.featured_image || {};
    const currentVariantImage = this.currentVariant.featured_image || {};

    if (!variant.featured_image || variantImage.src === currentVariantImage.src) {
      return;
    }

    this.$container.trigger({
      type: 'variantImageChange',
      variant: variant
    });
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

    this.$container.trigger({
      type: 'variantPriceChange',
      variant: variant
    });
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
    $(this.originalSelectorId, this.$container)[0].value = variant.id;
  }
}
