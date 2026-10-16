import { BREAKPOINTS } from '@/core/breakpointsController'
import { swap } from '@/core/gsap'

import BaseComponent from '@/components/base'
import ProductCard from '@/components/product/productCard'
import A11yStatus from '@/components/a11y/a11yStatus'

const selectors = {
  list: 'ul',
  more: 'a[data-more]'
}

function parseProductsCount(el: HTMLElement) {
  return el.dataset.productsCount ? parseInt(el.dataset.productsCount) : 0
}

interface ResultsDisplayOptions {
  onMoreIntersection?: (entries: IntersectionObserverEntry[]) => void
  onReplaceStart?: (resultsDisplay: ResultsDisplay) => void
  onReplaceComplete?: (resultsDisplay: ResultsDisplay) => void
}

export default class ResultsDisplay extends BaseComponent {
  static TYPE = 'results-display'

  #swapTl: gsap.core.Timeline | null
  #moreObserver: IntersectionObserver | null

  settings: ResultsDisplayOptions
  productCards: ProductCard[]
  list: HTMLUListElement | null
  a11yStatus: A11yStatus | null
  more: HTMLAnchorElement | null

  constructor(el: HTMLElement, options: ResultsDisplayOptions = {}) {
    super(el)

    this.settings = {
      ...options
    }

    this.#swapTl = null
    this.#moreObserver = null
    this.productCards = []
    this.list = null
    this.a11yStatus = null
    this.more = null

    this.onMoreIntersection = this.onMoreIntersection.bind(this)

    this.setup()
  }

  setup() {
    this.productCards = this.qsa(ProductCard.SELECTOR).map(el => new ProductCard(el))

    this.list = this.qs<HTMLUListElement>(selectors.list)
    this.more = this.qs<HTMLAnchorElement>(selectors.more)

    if (this.more) {
      const more = this.more
      const rootMargin = window.innerWidth < BREAKPOINTS.md ? '1000px' : `${Math.max(window.innerHeight*2, 1500)}px`

      this.#moreObserver = new IntersectionObserver(this.onMoreIntersection, {
        root: null,
        rootMargin,
        threshold: 0.1
      })

      const moreObserver = this.#moreObserver

      // Prevent immediate triggering
      requestAnimationFrame(() => {
        moreObserver.observe(more)
      })
    }

    this.a11yStatus = A11yStatus.generate(this.el)  
  }

  teardown() {
    this.productCards.forEach(card => card.destroy())
    this.productCards = []

    this.list = null
    this.more = null

    this.#moreObserver?.disconnect()
    this.#moreObserver = null

    this.a11yStatus?.el?.remove()
    this.a11yStatus?.destroy()
    this.a11yStatus = null
  }

  destroy() {
    this.#swapTl?.kill()
    this.#swapTl = null

    this.teardown()

    super.destroy()
  }

  // This is exposed so that the parent can update any related components - typically used with facets (that aren't yet implemented)
  get productsCount() {
    return parseProductsCount(this.el)
  }

  // Replace the entire contents of the results display
  replace(dom: HTMLElement | null) {
    if (!dom || !this.validateDom(dom)) return

    // Update the products count from the entire component DOM because we only update the innerHTML of the results display
    this.el.dataset.productsCount = parseProductsCount(dom).toString()

    this.#swapTl?.kill()
    this.#swapTl = swap(this.el, {
      onExitStart: () => {
        this.settings.onReplaceStart?.(this)
      },
      onExitComplete: () => {
        this.teardown()
        this.el.innerHTML = dom.innerHTML
        this.setup()

        if (this.a11yStatus) this.a11yStatus.text = 'Results updated'

        this.settings.onReplaceComplete?.(this)
      }
    })
  }

  add(dom: HTMLElement | undefined) {
    if (!dom || !this.validateDom(dom)) return
    if (!this.list) return

    const newList = dom.querySelector(selectors.list)
    const newItems = newList ? [...newList.children] : []

    // Add all items to the list
    if (newItems.length) {
      const fragment = document.createDocumentFragment()

      newItems.forEach(el => {      
        fragment.append(el) // el === <li>
        
        const card = el.querySelector<HTMLElement>(ProductCard.SELECTOR)

        if (card) {
          this.productCards.push(new ProductCard(card))
        }
      })

      this.list.append(fragment)
      if (this.a11yStatus) this.a11yStatus.text = `${newItems.length} items loaded`

      // Replace the "more" link if it exists
      const newMore = dom.querySelector<HTMLAnchorElement>(selectors.more)

      if (this.more && newMore) {
        this.more.href = newMore.href
      }
      else {
        this.onNoMoreResults()
      }
    }    
  }

  onNoMoreResults() {
    if (!this.more) return

    this.more.remove()
    this.more = null

    this.#moreObserver?.disconnect()
    this.#moreObserver = null
  }  

  onMoreIntersection(entries: IntersectionObserverEntry[]) {
    if (!this.more) return // Prevent a race condition

    this.settings.onMoreIntersection?.(entries)
  }
}
