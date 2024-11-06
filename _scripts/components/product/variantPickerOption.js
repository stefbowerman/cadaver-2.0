import BaseComponent from '../base'

export default class VariantPickerOption extends BaseComponent {
  static TYPE = 'variant-picker-option'

  constructor(el, options = {}) {
    super(el)

    this.settings = {
      onChange: () => {},
      ...options
    }

    // Picker options are either <select> tags or a series of <input> tags
    this.select = this.qs('select')
    this.inputs = this.qsa('input')

    this.el.addEventListener('change', this.onChange.bind(this))
  }

  get selectedOption() {
    let name, value

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

    return { name, value }
  }

  updateValueAvailability(value, available) {
    if (this.select) {
      [...this.select.children].forEach(option => {
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

  onChange(e) {
    this.settings.onChange()
  }
}