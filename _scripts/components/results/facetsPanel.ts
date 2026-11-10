import BaseComponent from '@/components/base'
import FacetsForm from '@/components/results/facetsForm'

export type FacetFilters = Map<string, string[]>

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
  clearFiltersButton: HTMLButtonElement | undefined

  constructor(el: HTMLElement, options: FacetsPanelOptions) {
    super(el)

    this.settings = {
      ...options
    }

    this.productsCountValueEl = this.qsRequired(selectors.productsCountValue)

    this.filtersActiveCountEls = this.qsa(selectors.filtersActiveCount)
    this.filtersActiveCountValueEls = this.qsa(selectors.filtersActiveCountValue) 
    
    this.clearFiltersButton = this.qs<HTMLButtonElement>(selectors.clearFilters) ?? undefined
    this.clearFiltersButton?.addEventListener('click', this.onClearFiltersButtonClick.bind(this))

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

  buildFacetFilters(): FacetFilters {
    const filters: FacetFilters = new Map()

    this.facetsForms[0]?.processInputs((input: HTMLInputElement) => {
      if ((input.type === 'checkbox' || input.type === 'radio') && input.checked) {
        if (!filters.has(input.name)) filters.set(input.name, [])
        filters.get(input.name)!.push(input.value)
      }
    })
    return filters
  }

  processFacetsFormsInputs(callback: (el: HTMLInputElement) => void) {
    this.facetsForms.forEach(f => f.processInputs(callback))
  }

  // Check exactly the inputs present in params, so the form matches the results on screen
  syncInputsToParams(params: URLSearchParams) {
    const sortBy = params.get('sort_by') ?? this.defaultSortBy

    this.processFacetsFormsInputs(el => {
      if (el.type !== 'checkbox' && el.type !== 'radio') return

      el.checked = el.name === 'sort_by'
        ? el.value === sortBy
        : params.getAll(el.name).includes(el.value)
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

  onClearFiltersButtonClick() {
    if (this.activeFiltersCount === 0) return

    this.processFacetsFormsInputs(el => {
      if (el.name === 'sort_by') return

      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = false
      }
    })

    const params = this.buildUrlParams()
    this.updateActiveCountDisplay(0)
    this.settings.onFiltersChange(params)
  }

  onFacetsFormInput(e: Event) {
    const target = e.target as HTMLInputElement

    // Sync inputs across duplicate forms (e.g. dropdown + drawer)
    this.processFacetsFormsInputs(el => {
      if (el === target || el.name !== target.name) return

      if (el.tagName === 'SELECT') {
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
