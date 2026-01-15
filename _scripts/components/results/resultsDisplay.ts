import { BREAKPOINTS } from '@/core/breakpointsController'
import gsap from '@/core/gsap'

import BaseComponent from '@/components/base'
import ProductCard from '@/components/product/productCard'
import A11yStatus from '@/components/a11y/a11yStatus'

const selectors = {
  list: 'ul',
  more: 'a[data-more]'
}

interface ResultsDisplaySettings {
  onMoreIntersection?: (entries: IntersectionObserverEntry[]) => void
  onReplaceStart?: (resultsDisplay: ResultsDisplay) => void
  onReplaceComplete?: (resultsDisplay: ResultsDisplay) => void
}

export default class ResultsDisplay extends BaseComponent {
  static TYPE = 'results-display'

  settings: ResultsDisplaySettings
  productCards: ProductCard[]
  list: HTMLUListElement | null
  a11yStatus: A11yStatus | null
  more: HTMLAnchorElement | undefined
  moreObserver: IntersectionObserver | null
  replacementTl: gsap.core.Timeline | null

  constructor(el: HTMLElement, options: ResultsDisplaySettings = {}) {
    super(el)

    this.settings = {
      ...options
    }

    this.productCards = []

    this.list = null
    this.a11yStatus = null
    this.more = null
    this.moreObserver = null
    this.replacementTl = null

    this.onMoreIntersection = this.onMoreIntersection.bind(this)

    this.setup()
  }

  setup() {
    this.productCards = this.qsa(ProductCard.SELECTOR).map(el => new ProductCard(el))

    this.list = this.qs(selectors.list) as HTMLUListElement | null
    this.more = this.qs(selectors.more) as HTMLAnchorElement | undefined

    if (this.more) {
      const rootMargin = window.innerWidth < BREAKPOINTS.md ? '1000px' : `${Math.max(window.innerHeight*2, 1500)}px`

      this.moreObserver = new IntersectionObserver(this.onMoreIntersection, {
        root: null,
        rootMargin,
        threshold: 0.1
      })

      // Prevent immediate triggering
      requestAnimationFrame(() => {
        this.moreObserver.observe(this.more)
      })
    }

    this.a11yStatus = A11yStatus.generate(this.el)  
  }

  teardown() {
    this.productCards.forEach(card => card.destroy())
    this.productCards = []

    this.list = null
    this.more = null

    this.moreObserver?.disconnect()
    this.moreObserver = null

    this.a11yStatus.el?.remove()
    this.a11yStatus.destroy()
    this.a11yStatus = null
  }

  destroy() {
    this.replacementTl?.kill()
    this.replacementTl = null

    this.teardown()

    super.destroy()
  }

  // Replace the entire contents of the results display
  replace(dom: HTMLElement | undefined) {
    if (!this.validateDom(dom)) return

    this.replacementTl = gsap.timeline({ paused: true })

    this.replacementTl.to(this.el, {
      duration: 0.4,
      opacity: 0,
      ease: 'power2.out',
      onStart: () => {
        this.settings.onReplaceStart?.(this)
      },
      onComplete: () => {
        this.teardown()
        this.el.innerHTML = dom.innerHTML
        this.setup()

        gsap.set(this.el, { clearProps: true })

        this.settings.onReplaceComplete?.(this)
      }
    })

    this.replacementTl.to(this.el, {
      duration: 1,
      delay: 0.25,
      opacity: 1,
      ease: 'power2.in'
    })

    this.replacementTl.play()
  }

  add(dom: HTMLElement | undefined) {
    if (!this.validateDom(dom)) return

    const newList = dom.querySelector(selectors.list)
    const newItems = newList ? [...newList.children] : []

    // Add all items to the list
    if (newItems.length) {
      const fragment = document.createDocumentFragment()

      newItems.forEach(el => {      
        fragment.append(el) // el === <li>
        
        const card = el.querySelector(ProductCard.SELECTOR) as HTMLElement

        if (card) {
          this.productCards.push(new ProductCard(card))
        }
      })

      this.list.append(fragment)
      this.a11yStatus.text = `${newItems.length} items loaded`

      // Replace the "more" link if it exists
      const newMore = dom.querySelector(selectors.more) as HTMLAnchorElement | undefined

      if (this.more && newMore) {
        this.more.href = newMore.href
      }
      else {
        this.onNoMoreResults()
      }
    }    
  }

  onNoMoreResults() {
    this.more.remove()
    this.more = null

    this.moreObserver?.disconnect()
    this.moreObserver = null
  }  

  onMoreIntersection(entries: IntersectionObserverEntry[]) {
    if (!this.more) return // Prevent a race condition

    this.settings.onMoreIntersection?.(entries)
  }
}