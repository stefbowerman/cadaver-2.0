import BaseComponent from '@/components/base'
import type { SelectedOption } from '@/types/shopify'

interface VariantPickerOptionOptions {
  onChange?: () => void
}

export default class VariantPickerOption extends BaseComponent {
  static TYPE = 'variant-picker-option'

  settings: VariantPickerOptionOptions
  name: string | undefined
  select: HTMLSelectElement | null
  inputs: HTMLInputElement[]

  constructor(el: HTMLElement, options: VariantPickerOptionOptions = {}) {
    super(el)

    this.settings = {
      ...options
    }

    this.name = this.dataset.name

    if (!this.name) {
      console.warn('No name attribute found')
    }
    
    // Picker options are either <select> tags or a series of <input> tags
    this.select = this.qs<HTMLSelectElement>('select')
    this.inputs = this.qsa<HTMLInputElement>('input')

    this.el.addEventListener('change', this.onChange.bind(this))
  }

  get selectedOption(): SelectedOption | undefined {
    let name: string | undefined
    let value: string | undefined

    if (this.select) {
      name = this.select.name
      value = this.select.value
    }
    else {
      const selectedInput = this.inputs.find(input => input.checked)

      if (selectedInput) {
        name = selectedInput.name
        value = selectedInput.value
      }
    }

    return name && value ? { name, value } : undefined
  }

  updateValueAvailability(value: string, available: boolean) {
    if (this.select) {
      [...this.select.options].forEach(option => {
        if (option.value === value) {
          option.disabled = !available
        }
      })
    }
    else {
      const input = this.inputs.find(input => input.value === value)

      if (!input) return
  
      input.disabled = !available
    }
  }

  onChange() {
    this.settings.onChange?.()
  }
}
