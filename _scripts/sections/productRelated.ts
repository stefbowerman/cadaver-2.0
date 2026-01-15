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

    this.productCards = []

    this.contentTarget = this.qs(selectors.contentTarget)
    this.content = this.qs(selectors.content)

    this.recommendationsUrl = this.dataset.url
  }

  onIntersection(entries: IntersectionObserverEntry[]) {
    if (!entries[0].isIntersecting) return

    this.stopIntersectionObserver() // We only want to check for intersection *once*

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