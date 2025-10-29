import type { LiteProduct, LiteVariant, SelectedOption } from '@/types/shopify'
import BaseComponent from '@/components/base'
import VariantPickerOption from '@/components/product/variantPickerOption'

export interface VariantChangeEvent {
  variant?: LiteVariant
  selectedOptions: SelectedOption[]
}

interface VariantPickerSettings {
  product?: LiteProduct
  onVariantChange?: (e: VariantChangeEvent) => void
}

export default class VariantPicker extends BaseComponent {
  static TYPE = 'variant-picker'

  settings: VariantPickerSettings
  product: LiteProduct | null
  availableVariants: LiteVariant[]
  pickerOptions: VariantPickerOption[]

  constructor(el: HTMLElement, options: VariantPickerSettings = {}) {
    super(el)

    this.settings = {
      product: null,
      onVariantChange: (e: VariantChangeEvent) => {},
      ...options
    }

    this.product = this.settings.product

    if (!this.product) {
      console.warn('Product required')
      return
    }

    this.availableVariants = this.product.variants.filter(v => v.available)
    this.onVariantPickerOptionChange = this.onVariantPickerOptionChange.bind(this)

    this.pickerOptions = this.qsa(VariantPickerOption.SELECTOR).map(el => {
      return new VariantPickerOption(el as HTMLElement, {
        onChange: this.onVariantPickerOptionChange
      })
    })
  }

  updateOptionValues(selectedOptions: SelectedOption[]) {   
    // Recursive function to check option values for variant availability, Goes deeper until we run out of product options
    const checkOption = (idx: number, availableVariantsArray: LiteVariant[]) => {
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

  onVariantChange(e: VariantChangeEvent) {
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
