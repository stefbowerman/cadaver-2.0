import BaseComponent from '@/components/base'
import FacetsForm, { type FacetsFormInput } from '@/components/results/facetsForm'
import { isVisible } from '@/core/utils/dom'

interface FacetsPanelOptions {
  onFiltersChange: (params: URLSearchParams) => void
  onInputPointerEnter?: (input: HTMLInputElement) => void
  onInputPointerLeave?: (input: HTMLInputElement) => void
}

const selectors = {
  filtersActiveCount: '[data-filters-active-count]',
  filtersActiveCountValue: '[data-filters-active-count-value]',
  productsCountValue: '[data-products-count-value]',
  clearFilters: 'button[data-clear-filters]',
}

export default class FacetsPanel extends BaseComponent {
  static TYPE = 'facets-panel'

  settings: FacetsPanelOptions
  facetsForms: FacetsForm[]
  productsCountValueEl: HTMLElement
  filtersActiveCountEls: HTMLElement[]
  filtersActiveCountValueEls: HTMLElement[]
  clearFiltersButton: HTMLButtonElement | null

  constructor(el: HTMLElement, options: FacetsPanelOptions) {
    super(el)

    this.settings = {
      ...options
    }

    this.productsCountValueEl = this.qsRequired(selectors.productsCountValue)

    this.filtersActiveCountEls = this.qsa(selectors.filtersActiveCount)
    this.filtersActiveCountValueEls = this.qsa(selectors.filtersActiveCountValue) 
    
    this.clearFiltersButton = this.qs<HTMLButtonElement>(selectors.clearFilters)
    this.clearFiltersButton?.addEventListener('click', this.clearFilters.bind(this))

    this.facetsForms = this.qsa(FacetsForm.SELECTOR).map(el => new FacetsForm(el as HTMLFormElement, {
      onInput: this.onFacetsFormInput.bind(this),
      onSubmit: (e: SubmitEvent) => e.preventDefault(),
      onInputPointerEnter: this.settings.onInputPointerEnter,
      onInputPointerLeave: this.settings.onInputPointerLeave
    }))
  }
  
  get activeFiltersCount(): number {
    return this.facetsForms[0]?.getActiveFiltersCount() ?? 0
  }

  get defaultSortBy(): string {
    return this.facetsForms[0]?.form.dataset.defaultSortBy ?? ''
  }

  buildUrlParams(): URLSearchParams {
    const searchParams = new URLSearchParams(window.location.search)
    const facetNames = new Set<string>()

    this.processFacetsFormsInputs(el => facetNames.add(el.name))
    facetNames.forEach(name => searchParams.delete(name))
    searchParams.delete('page')

    const defaultSortBy = this.defaultSortBy

    this.facetsForms.forEach(({ formData }) => {
      formData.forEach((v: FormDataEntryValue, k: string) => {
        if (k === 'sort_by' && v === defaultSortBy) return // default sort: leave it out of the URL

        if (typeof v === 'string' && !searchParams.getAll(k).includes(v)) {
          searchParams.append(k, v)
        }
      })
    })

    return searchParams
  }

  processFacetsFormsInputs(callback: (el: FacetsFormInput) => void) {
    this.facetsForms.forEach(f => f.processInputs(callback))
  }

  // The default sort is left out of the URL, so fall back to it when sort_by is missing
  #getParamValues(params: URLSearchParams, name: string): string[] {
    if (name === 'sort_by') {
      return [params.get('sort_by') ?? this.defaultSortBy]
    }

    return params.getAll(name)
  }

  // Set every input to match params, so the form matches the results on screen
  syncInputsToParams(params: URLSearchParams) {
    this.processFacetsFormsInputs(el => {
      const values = this.#getParamValues(params, el.name)

      if (el instanceof HTMLSelectElement) {
        el.value = values[0] ?? ''
      }
      else if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = values.includes(el.value)
      }
    })

    this.updateActiveCountDisplay(this.activeFiltersCount)
  }

  updateCount(count: number) {
    this.productsCountValueEl.textContent = count.toString()
  }

  updateActiveCountDisplay(activeCount: number) {
    this.filtersActiveCountValueEls.forEach(el => {
      el.textContent = activeCount.toString()
    })

    this.filtersActiveCountEls.forEach(el => {
      el.hidden = activeCount === 0
    })

    if (this.clearFiltersButton) {
      this.clearFiltersButton.hidden = activeCount === 0
    }
  }

  clearFilters() {
    if (this.activeFiltersCount === 0) return

    this.processFacetsFormsInputs(el => {
      if (el.name === 'sort_by') return

      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = false
      }
    })

    const params = this.buildUrlParams()

    this.updateActiveCountDisplay(0)
    this.facetsForms.find(f => isVisible(f.el))?.inputs.find(input => !input.disabled)?.focus() // the clear control is about to be hidden or replaced, so keep focus in the first visible filter
    this.settings.onFiltersChange(params)
  }

  onFacetsFormInput(e: Event) {
    const target = e.target as HTMLInputElement

    // Sync inputs across duplicate forms (e.g. dropdown + drawer)
    this.processFacetsFormsInputs(el => {
      if (el === target || el.name !== target.name) return

      if (el instanceof HTMLSelectElement) {
        el.value = target.value
      }
      else {
        switch (el.type) {
          case 'checkbox':
            if (el.value === target.value) el.checked = target.checked
            break
          case 'radio':
            el.checked = el.value === target.value
            break
          default:
            el.value = target.value
        }
      }
    })

    const params = this.buildUrlParams()

    this.updateActiveCountDisplay(this.activeFiltersCount)
    this.settings.onFiltersChange(params)
  }
}
