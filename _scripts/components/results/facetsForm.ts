import BaseComponent from '@/components/base'

export type FacetsFormInput = HTMLInputElement | HTMLSelectElement

interface FacetsFormOptions {
  onInput?: (e: Event) => void
  onSubmit?: (e: SubmitEvent) => void
  onInputPointerEnter?: (input: HTMLInputElement) => void
  onInputPointerLeave?: (input: HTMLInputElement) => void
}

export default class FacetsForm extends BaseComponent {
  static TYPE = 'facets-form'

  static getInputElements(el: HTMLFormElement): FacetsFormInput[] {
    return Array.from(el.querySelectorAll<FacetsFormInput>('input[name], select[name]'))
  }

  settings: FacetsFormOptions
  inputs: FacetsFormInput[]

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

      if (label && input instanceof HTMLInputElement) {
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

  processInputs(callback: (el: FacetsFormInput) => void) {
    this.inputs.forEach(callback)
  }

  getActiveFiltersCount() {
    const checkedCount = this.inputs.filter(input => {
      return (input.type === 'checkbox' || input.type === 'radio') && input.name !== 'sort_by' && input.checked
    }).length

    return checkedCount
  }
}
