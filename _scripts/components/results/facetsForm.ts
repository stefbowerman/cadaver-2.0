import BaseComponent from '@/components/base'

export interface FacetsFormSettings {
  sortFunc?: (a: string, b: string) => number
  onInput?: (e: Event) => void
  onSubmit?: (e: SubmitEvent) => void
  onInputPointerEnter?: (input: HTMLInputElement) => void
  onInputPointerLeave?: (input: HTMLInputElement) => void
}

const selectors = {
  checkGroup: '[data-check-group]',
}

export default class FacetsForm extends BaseComponent {
  static TYPE = 'facets-form'

  static getInputElements(el: HTMLFormElement): HTMLInputElement[] {
    return Array.from(el.querySelectorAll('[name]')) as HTMLInputElement[]
  }

  settings: FacetsFormSettings
  inputs: HTMLInputElement[]
  checkGroups: HTMLElement[] | null = null

  constructor(el: HTMLFormElement, options: FacetsFormSettings = {}) {
    super(el)

    this.settings = {
      ...options
    }

    this.inputs = FacetsForm.getInputElements(this.form)
    this.checkGroups = this.qsa(selectors.checkGroup) as HTMLElement[]

    if (typeof this.settings.sortFunc === 'function') {
      this.checkGroups.forEach(parent => {
        // This feels a little dirty but it's the most straightforrward way to do this.
        // @TODO - Figure this out better
        const composableInputs = Array.from(parent?.querySelectorAll('.composable-input') ?? [])

        if (parent && composableInputs) {
          composableInputs.sort((a, b) => {
            const elA = a.querySelector('[name]') as HTMLInputElement
            const elB = b.querySelector('[name]') as HTMLInputElement

            return this.settings.sortFunc ? this.settings.sortFunc(elA.value, elB.value) : 0
          })

          composableInputs.forEach(input => {
            parent?.appendChild(input)
          })
        }
      })
    }

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
