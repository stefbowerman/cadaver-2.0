import BaseComponent from '../base'
import VariantPickerOption from './variantPickerOption'

export default class VariantPicker extends BaseComponent {
  static TYPE = 'variant-picker'

  constructor(el, options = {}) {
    super(el)

    this.settings = {
      product: null,
      onVariantChange: () => {},
      ...options
    }

    this.product = this.settings.product

    if (!this.product) {
      console.warn('Product required')
      return
    }

    this.availableVariants = this.product.variants.filter(v => v.available)
    this.onVariantPickerOptionChange = this.onVariantPickerOptionChange.bind(this)

    this.pickerOptions = [...this.el.querySelectorAll(VariantPickerOption.SELECTOR)].map(el => {
      return new VariantPickerOption(el, {
        onChange: this.onVariantPickerOptionChange
      })
    })
  }

  updateOptionValues(selectedOptions) {   
    // Recursive function to check option values for variant availability, Goes deeper until we run out of product options
    const checkOption = (idx, availableVariantsArray) => {
      const option = this.product.options_with_values[idx] // e.g. { name: 'Color', position: 1, values: ['Red', 'Blue', 'Green'] }

      if (!option) return

      const pickerOption = this.pickerOptions.find(pO => pO.name === option.name)

      option.values.forEach(value => {
        const availableVariantsForValue = availableVariantsArray.filter(v => v.options[idx] === value && v.available)

        pickerOption?.updateValueAvailability(value, availableVariantsForValue.length > 0)

        // If our loop is on a currently selected option and we can go deeper...
        if (selectedOptions[idx]?.value === value && this.product.options_with_values[idx + 1]) {
          checkOption(idx + 1, availableVariantsForValue)
        }
      }) 
    }

    checkOption(0, this.availableVariants)
  }

  onVariantChange(e) {
    this.updateOptionValues(e.selectedOptions)

    this.settings.onVariantChange(e)
  }

  onVariantPickerOptionChange() {   
    const selectedOptions = this.pickerOptions.map(pO => pO.selectedOption).filter(Boolean)

    // Find the variant that matches the selected options
    const variant = this.product.variants.find(variant => {
      return variant.options.every((value, index) => value === selectedOptions[index]?.value)
    })

    this.onVariantChange({ variant, selectedOptions })
  }
}
