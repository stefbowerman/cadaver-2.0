import ResultsSection from '@/sections/results'
import SearchInline from '@/components/search/searchInline'

export default class SearchSection extends ResultsSection {
  static TYPE = 'search'

  searchInline: SearchInline

  constructor(container: HTMLElement) {
    super(container)

    this.searchInline = new SearchInline(this.qsRequired<HTMLFormElement>(SearchInline.SELECTOR), {
      onSubmit: this.onSubmit.bind(this)
    })
  }

  // @NOTE - This must be a synchronous function and return false to prevent the default form submission behavior
  onSubmit(e: SubmitEvent, url: string) {
    e.preventDefault()

    this.updateResults(new URL(url, window.location.origin).searchParams)

    return false
  }
}
