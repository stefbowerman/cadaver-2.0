import { type ThemeEditorSectionUnloadEvent } from '@/types/shopify'
import { sectionRenderService } from '@/core/sectionRenderService'
import { debounce } from '@/core/utils'

import BaseSection from '@/sections/base'
import ResultsDisplay from '@/components/results/resultsDisplay'
import FacetsPanel from '@/components/results/facetsPanel'
import FacetsForm from '@/components/results/facetsForm'

export default class ResultsSection extends BaseSection {
  static TYPE = 'results'

  #isFetching: boolean
  #isFiltering: boolean

  resultsDisplay: ResultsDisplay
  facetsPanel: FacetsPanel | undefined

  constructor(container: HTMLElement) {
    super(container, { cacheOnLoad: true })

    this.#isFetching = false
    this.#isFiltering = false

    this.resultsDisplay = new ResultsDisplay(this.qsRequired(ResultsDisplay.SELECTOR), {
      onMoreIntersection: this.onMoreIntersection.bind(this),
      onReplaceComplete: this.onReplaceComplete.bind(this)
    })

    const facetsPanelEl = this.qs(FacetsPanel.SELECTOR)

    if (facetsPanelEl) {
      this.facetsPanel = new FacetsPanel(facetsPanelEl, {
        onFiltersChange: this.onFacetsFiltersChange.bind(this),
        onInputPointerEnter: this.debouncedFacetsFormInputTogglePrefetch,
        onInputPointerLeave: () => this.debouncedFacetsFormInputTogglePrefetch.cancel(),        
      })
    }
  }

  onUnload(e?: ThemeEditorSectionUnloadEvent): void {
    this.debouncedFacetsFormInputTogglePrefetch.cancel()

    super.onUnload(e)
  }

  async facetsFormInputTogglePrefetch(target: HTMLInputElement) {
    if (target.disabled) return

    const url = new URL(window.location.href)
    const params = url.searchParams

    const { name: key, value } = target

    if (target.type === 'checkbox') {
      if (target.checked) {
        params.delete(key, value)
      }
      else if (!params.getAll(key).includes(value)) {
        params.append(key, value)
      }
    }
    else if (key === 'sort_by' && value === this.facetsPanel?.defaultSortBy) {
      params.delete(key) // default sort: match buildUrlParams(), which leaves it out of the URL
    }    
    else {
      params.set(key, value)
    }

    params.delete('page')
    sectionRenderService.prefetch(this.id, url)
  }

  debouncedFacetsFormInputTogglePrefetch = debounce((target: HTMLInputElement) => {
    this.facetsFormInputTogglePrefetch(target)
  }, 200)

  async onFacetsFiltersChange(params: URLSearchParams) {
    const fetchUrl = new URL(window.location.href)
          fetchUrl.search = params.toString()

    const searchParamsString = params.toString()

    this.#isFiltering = true
    try {
      const dom = await sectionRenderService.getSectionDom(this.id, fetchUrl)

      if (!dom) throw new Error('Failed to load results')

      const resultsDisplayDom = dom.getElementById(this.parentId)?.querySelector(ResultsDisplay.SELECTOR)
      if (!resultsDisplayDom) throw new Error('Results display not found')

      this.resultsDisplay.replace(resultsDisplayDom as HTMLElement)
      this.facetsPanel?.updateCount(this.resultsDisplay.productsCount)

      const facetsFormDom = dom.getElementById(this.parentId)?.querySelector(FacetsForm.SELECTOR)

      if (facetsFormDom) {
        // name=value pairs the server says are still selectable for the new results
        const available = new Set(
          FacetsForm.getInputElements(facetsFormDom as HTMLFormElement)
            .filter(input => !input.disabled)
            .map(input => `${input.name}=${input.value}`)
        )

        // Disable anything the server dropped or disabled, but never a checked input, so it can always be unchecked
        this.facetsPanel?.processFacetsFormsInputs(el => {
          el.disabled = !el.checked && !available.has(`${el.name}=${el.value}`)
        })
      }

      window.history.replaceState(
        { searchParamsString },
        '',
        `${window.location.pathname}${searchParamsString && '?' + searchParamsString}`
      )
    }
    catch (e) {
      console.warn('something went wrong...', e)
    }
    finally {
      this.#isFiltering = false
    }
  }  

  async fetchResults(url: string): Promise<HTMLElement | null> {
    if (this.#isFetching) return null

    try {
      this.#isFetching = true

      const fetchUrl = new URL(url, window.location.origin)
            // fetchUrl.searchParams.set('t', Date.now().toString()) // Add timestamp to prevent caching?
            fetchUrl.searchParams.set('section_id', this.id)

      const dom = await sectionRenderService.getSectionDom(this.id, fetchUrl)

      return (dom?.getElementById(this.parentId)?.querySelector(ResultsDisplay.SELECTOR) ?? null) as HTMLElement | null
    }
    catch (e) {
      console.warn('something went wrong...', e)
      return null
    }
    finally {
      this.#isFetching = false
    }
  }

  async onMoreIntersection(entries: IntersectionObserverEntry[]) {
    const entry = entries[0]

    if (!entry.isIntersecting || this.#isFiltering) return

    try {
      const target = entry.target as HTMLAnchorElement
      const newResults = await this.fetchResults(target.href)

      if (!newResults || !target.isConnected) return  // Make sure the "more" link we just fetched hasn't been removed from the DOM

      this.resultsDisplay.add(newResults)
    }
    catch (e) {
      console.warn('something went wrong...', e)
    }       
  }

  onReplaceComplete(resultsDisplay: ResultsDisplay) {
    // console.log('onReplaceComplete', resultsDisplay)
  }
}