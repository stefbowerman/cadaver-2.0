import ResultsSection from '@/sections/results'
import SearchInline from '@/components/search/searchInline'

export default class SearchSection extends ResultsSection {
  static TYPE = 'search'

  #isLoading: boolean

  searchInline: SearchInline

  constructor(container: HTMLElement) {
    super(container)

    this.#isLoading = false

    this.searchInline = new SearchInline(this.qs(SearchInline.SELECTOR) as HTMLFormElement, {
      onSubmit: this.onSubmit.bind(this)
    })
  }

  async runSearch(url: string) {
    try {
      this.#isLoading = true

      const results = await this.fetchResults(url)

      this.resultsDisplay.replace(results)
  
      window.history.replaceState({}, '', url)
    }
    catch (e) {
      console.warn('something went wrong...', e)
    }
    finally {
      this.#isLoading = false
    }
  }

  // @NOTE - This must be a synchronous function and return false to prevent the default form submission behavior
  onSubmit(e: SubmitEvent, url: string) {
    e.preventDefault()

    if (this.#isLoading) return false
    
    this.runSearch(url)

    return false
  }
}