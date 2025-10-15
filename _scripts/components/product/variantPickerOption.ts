import BaseComponent from '@/components/base'

export interface SelectedOption {
  name: string
  value: string
}

interface VariantPickerOptionSettings {
  onChange?: () => void
}

export default class VariantPickerOption extends BaseComponent {
  static TYPE = 'variant-picker-option'

  settings: VariantPickerOptionSettings
  name: string
  select: HTMLSelectElement | null
  inputs: HTMLInputElement[]

  constructor(el: HTMLElement, options: VariantPickerOptionSettings = {}) {
    super(el)

    this.settings = {
      onChange: () => {},
      ...options
    }

    this.name = this.dataset.name

    if (!this.name) {
      console.warn('No name attribute found')
    }
    
    // Picker options are either <select> tags or a series of <input> tags
    this.select = this.qs('select') as HTMLSelectElement | null
    this.inputs = this.qsa('input') as HTMLInputElement[]

    this.el.addEventListener('change', this.onChange.bind(this))
  }

  get selectedOption(): SelectedOption | undefined {
    let name: string | undefined = undefined
    let value: string | undefined = undefined

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
      [...this.select.children].forEach((option: HTMLOptionElement) => {
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

  onChange(e: Event) {
    this.settings.onChange()
  }
}