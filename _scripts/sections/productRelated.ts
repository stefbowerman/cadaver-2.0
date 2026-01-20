import type { ThemeEditorSectionUnloadEvent } from '@/types/shopify'
import { fetchDom } from '@/core/utils/dom'

import BaseSection from '@/sections/base'
import ProductCard from '@/components/product/productCard'

// See: https://shopify.dev/docs/storefronts/themes/product-merchandising/recommendations/related-products#implementing-product-recommendations

const selectors = {
  contentTarget: '[data-content-target]',
  content: '[data-content]'
}

export default class ProductRelatedSection extends BaseSection {
  static TYPE = 'product-related'

  #abortController: AbortController | null
  productCards: ProductCard[]
  contentTarget: HTMLElement
  content: HTMLElement
  recommendationsUrl: string

  constructor(container: HTMLElement) {
    super(container, {
      watchIntersection: true,
      intersectionOptions: {
        rootMargin: '0px 0px 1000px 0px'
      }
    })

    this.#abortController = null
    this.productCards = []

    this.contentTarget = this.qs(selectors.contentTarget)
    this.content = this.qs(selectors.content)

    this.recommendationsUrl = this.dataset.url
  }

  onUnload(e: ThemeEditorSectionUnloadEvent) {
    this.#abortController?.abort();
    this.#abortController = null

    super.onUnload(e)
  }

  onIntersection(entries: IntersectionObserverEntry[]) {
    if (!entries[0].isIntersecting) return

    this.stopIntersectionObserver() // We only want to check for intersection *once*

    this.getRecommendations()
  }  

  async getRecommendations() {
    try {
      this.#abortController?.abort();
      this.#abortController = new AbortController();

      const dom = await fetchDom(this.recommendationsUrl, this.#abortController.signal)

      if (this.#abortController.signal.aborted) return

      if (!dom) throw new Error('Failed to load recommendations')

      const content = dom.querySelector(selectors.content)

      if (!content) throw new Error('Recommendations content not found')      

      this.contentTarget.replaceChildren(content)

      this.productCards = this.qsa(ProductCard.SELECTOR, this.contentTarget).map((el: HTMLElement) => new ProductCard(el))
    }
    catch (e) {
      console.warn(e)

      // Hide the container entirely
      this.container.style.display = 'none'
      this.container.setAttribute('aria-hidden', 'true')      
    }
  }  
}