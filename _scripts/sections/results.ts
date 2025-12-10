import { fetchDom } from '@/core/utils/dom'

import BaseSection from '@/sections/base'
import ResultsDisplay from '@/components/results/resultsDisplay'

export default class ResultsSection extends BaseSection {
  static TYPE = 'results'

  isFetching: boolean
  resultsDisplay: ResultsDisplay

  constructor(container: HTMLElement) {
    super(container)

    this.isFetching = false

    this.resultsDisplay = new ResultsDisplay(this.qs(ResultsDisplay.SELECTOR), {
      onMoreIntersection: this.onMoreIntersection.bind(this),
      onReplaceComplete: this.onReplaceComplete.bind(this)
    })
  }

  async fetchResults(url: string): Promise<HTMLElement | undefined> {
    if (this.isFetching) return

    try {
      this.isFetching = true

      const fetchUrl = new URL(url, window.location.origin)
            fetchUrl.searchParams.set('t', Date.now().toString()) // Add timestamp to prevent caching?
            fetchUrl.searchParams.set('section_id', this.id)

      const dom = await fetchDom(fetchUrl)
      
      return dom.getElementById(this.parentId)?.querySelector(ResultsDisplay.SELECTOR) as HTMLElement
    }
    catch (e) {
      console.warn('something went wrong...', e)
    }
    finally {
      this.isFetching = false
    }
  }

  async onMoreIntersection(entries: IntersectionObserverEntry[]) {
    const entry = entries[0]

    if (!entry.isIntersecting) return

    try {
      const target = entry.target as HTMLAnchorElement
      const newResults = await this.fetchResults(target.href)
      
      this.resultsDisplay.add(newResults)
    }
    catch (e) {
      console.warn('something went wrong...', e)
    }
    finally {
      this.isFetching = false
    }        
  }

  onReplaceComplete(resultsDisplay: ResultsDisplay) {
    // console.log('onReplaceComplete', resultsDisplay)
  }
}