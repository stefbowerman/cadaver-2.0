import BaseSection from './base'

import { fetchDom } from '../core/utils/dom'
import ResultsDisplay from '../components/results/resultsDisplay'

export default class ResultsSection extends BaseSection {
  static TYPE = 'results'

  constructor(container) {
    super(container)

    this.isFetching = false

    this.resultsDisplay = new ResultsDisplay(this.qs(ResultsDisplay.SELECTOR), {
      onMoreIntersection: this.onMoreIntersection.bind(this),
      onReplaceComplete: this.onReplaceComplete.bind(this)
    })
  }

  async fetchResults(url) {
    if (this.isFetching) return

    try {
      this.isFetching = true

      const fetchUrl = new URL(url, window.location.origin)
            fetchUrl.searchParams.set('t', Date.now()) // Add timestamp to prevent caching?
            fetchUrl.searchParams.set('section_id', this.id)

      const dom = await fetchDom(fetchUrl)
      
      return dom.getElementById(this.parentId)?.querySelector(ResultsDisplay.SELECTOR)
    }
    catch (e) {
      console.warn('something went wrong...', e)
    }
    finally {
      this.isFetching = false
    }
  }

  async onMoreIntersection(entries) {
    const entry = entries[0]

    if (!entry.isIntersecting) return

    try {
      const newResults = await this.fetchResults(entry.target.href)
      
      this.resultsDisplay.add(newResults)
    }
    catch (e) {
      console.warn('something went wrong...', e)
    }
    finally {
      this.isFetching = false
    }        
  }

  onReplaceComplete(resultsDisplay) {
    // console.log('onReplaceComplete', resultsDisplay)
  }
}