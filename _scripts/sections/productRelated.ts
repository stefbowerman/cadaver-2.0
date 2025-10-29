import { fetchDom } from '@/core/utils/dom'
import type { ThemeEditorSectionUnloadEvent } from '@/types/shopify'

import BaseSection from '@/sections/base'
import ProductCard from '@/components/product/productCard'

const selectors = {
  contentTarget: '[data-content-target]',
  content: '[data-content]'
}

export default class ProductRelatedSection extends BaseSection {
  static TYPE = 'product-related'

  productCards: ProductCard[]
  contentTarget: HTMLElement
  content: HTMLElement
  recommendationsUrl: string
  observer: IntersectionObserver

  constructor(container: HTMLElement) {
    super(container)

    this.productCards = []

    this.contentTarget = this.qs(selectors.contentTarget)
    this.content = this.qs(selectors.content)

    this.recommendationsUrl = this.dataset.url

    // If more than one section needs intersection observer, move this to BaseSection class
    // See: https://shopify.dev/docs/storefronts/themes/product-merchandising/recommendations/related-products#implementing-product-recommendations
    this.observer = new IntersectionObserver(this.onIntersection.bind(this), {
      rootMargin: '0px 0px 1000px 0px'
    })

    this.observer.observe(this.container)
  }

  onUnload(e: ThemeEditorSectionUnloadEvent) {
    this.observer.disconnect()

    super.onUnload(e)
  }

  onIntersection(entries: IntersectionObserverEntry[]) {
    if (!entries[0].isIntersecting) return

    this.observer.disconnect() // We only want to check for intersection *once*

    this.getRecommendations()
  }  

  async getRecommendations() {
    try {
      const dom = await fetchDom(this.recommendationsUrl)
      const content = dom.querySelector(selectors.content)

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