import { BREAKPOINTS } from '../../core/breakpointsController'
import gsap from '../../core/gsap'

import BaseComponent from '../base'
import ProductCard from '../product/productCard'
import A11yStatus from '../a11y/a11yStatus'

const selectors = {
  list: 'ul',
  more: 'a[data-more]'
}

export default class ResultsDisplay extends BaseComponent {
  static TYPE = 'results-display'

  constructor(el, options = {}) {
    super(el)

    this.settings = {
      onMoreIntersection: () => {},
      onReplaceStart: () => {},
      onReplaceComplete: () => {},
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

    this.list = this.qs(selectors.list)
    this.more = this.qs(selectors.more)

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
  replace(dom) {
    if (!this.validateDom(dom)) return

    this.replacementTl = gsap.timeline({ paused: true })

    this.replacementTl.to(this.el, {
      duration: 0.4,
      opacity: 0,
      ease: 'power2.out',
      onStart: () => {
        this.settings.onReplaceStart(this)
      },
      onComplete: () => {
        this.teardown()
        this.el.innerHTML = dom.innerHTML
        this.setup()

        gsap.set(this.el, { clearProps: true })

        this.settings.onReplaceComplete(this)
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

  add(dom) {
    if (!this.validateDom(dom)) return

    const newList = dom.querySelector(selectors.list)
    const newItems = newList ? [...newList.children] : []

    // Add all items to the list
    if (newItems.length) {
      const fragment = document.createDocumentFragment()

      newItems.forEach(el => {      
        fragment.append(el) // el === <li>
        
        const card = el.querySelector(ProductCard.SELECTOR)

        if (card) {
          this.productCards.push(new ProductCard(card))
        }
      })

      this.list.append(fragment)
      this.a11yStatus.text = `${newItems.length} items loaded`

      // Replace the "more" link if it exists
      const newMore = dom.querySelector(selectors.more)

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

  onMoreIntersection(entries) {
    if (!this.more) return // Prevent a race condition

    this.settings.onMoreIntersection(entries)
  }
}