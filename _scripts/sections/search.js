import ResultsSection from '@/sections/results'
import SearchInline from '@/components/search/searchInline'

export default class SearchSection extends ResultsSection {
  #isLoading;

  static TYPE = 'search'

  constructor(container) {
    super(container)

    this.#isLoading = false

    this.searchInline = new SearchInline(this.qs(SearchInline.SELECTOR), {
      onSubmit: this.onSubmit.bind(this)
    })
  }

  async runSearch(url) {
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
  onSubmit(e, url) {
    e.preventDefault()

    if (this.#isLoading) return false
    
    this.runSearch(url)

    return false
  }
}