import BaseComponent from '@/components/base'

interface FacetsFormOptions {
  onInput?: (e: Event) => void
  onSubmit?: (e: SubmitEvent) => void
  onInputPointerEnter?: (input: HTMLInputElement) => void
  onInputPointerLeave?: (input: HTMLInputElement) => void
}

export default class FacetsForm extends BaseComponent {
  static TYPE = 'facets-form'

  static getInputElements(el: HTMLFormElement): HTMLInputElement[] {
    return Array.from(el.querySelectorAll('[name]')) as HTMLInputElement[]
  }

  settings: FacetsFormOptions
  inputs: HTMLInputElement[]

  constructor(el: HTMLFormElement, options: FacetsFormOptions = {}) {
    super(el)

    this.settings = {
      ...options
    }

    this.inputs = FacetsForm.getInputElements(this.form)

    this.el.addEventListener('input', (e) => this.settings.onInput?.(e))
    this.el.addEventListener('submit', (e) => this.settings.onSubmit?.(e))

    this.inputs.forEach(input => {
      const label = input.labels?.[0]

      // No need to add listeners to the inputs because they are sr-only
      // @TODO - Do a visibility check on the input element and apply the listeners if they are visible.  This sr-only assumption is based on the fact that currently the only inputs are check inputs with sr-only
      // input.addEventListener('pointerenter', () => this.settings.onInputPointerEnter?.(input))                                                                                                                    
      // input.addEventListener('pointerleave', () => this.settings.onInputPointerLeave?.(input))

      if (label) {
        label.addEventListener('pointerenter', () => this.settings.onInputPointerEnter?.(input))                                                                                                                   
        label.addEventListener('pointerleave', () => this.settings.onInputPointerLeave?.(input))
      }
    })
  }

  get form(): HTMLFormElement {
    return this.el as HTMLFormElement
  }

  get formData(): FormData {
    return new FormData(this.form)
  }

  processInputs(callback: (el: HTMLInputElement) => void) {
    this.inputs.forEach(callback)
  }

  getActiveFiltersCount() {
    const checkedCount = this.inputs.filter(input => {
      if ((input.type === 'checkbox' || input.type === 'radio') && input.name !== 'sort_by') {
        return input.checked
      }
    }).length

    return checkedCount
  }
}
