import LazyImageController from '@/core/lazyImageController'
import { doComponentCleanup } from '@/components/base'

// Standard components
import GraphicCoverVideo from '../components/graphicCoverVideo'

export default class BaseSection {
  constructor(container) {
    this.container = container
    this.id = this.dataset.sectionId
    this.type = this.constructor.TYPE
    this.parent = this.container.parentElement // Automatically generated wrapper element
    this.parentId = this.parent.id

    if (!this.id) {
      console.warn('Section ID not found', this)
    }

    this.onNavigateOut = this.onNavigateOut.bind(this)
    this.onNavigateIn  = this.onNavigateIn.bind(this)
    this.onNavigateEnd = this.onNavigateEnd.bind(this)

    window.addEventListener('taxi.navigateOut', this.onNavigateOut)
    window.addEventListener('taxi.navigateIn', this.onNavigateIn)
    window.addEventListener('taxi.navigateEnd', this.onNavigateEnd)

    this.lazyImageController = new LazyImageController(this.container)

    // Below are standard components that can be initialized at the base section level (until there's a reason for them to get pushed down somewhere more specific)
    this.graphicCoverVideos = this.qsa(GraphicCoverVideo.SELECTOR).map(el => {
      return new GraphicCoverVideo(el)
    })

    // Good for testing...
    // Array.from(container.querySelectorAll('img')).forEach(el => {
    //   if (!el.getAttribute('alt')) {
    //     console.log('No alt text found for => ', el)
    //   }
    // })    
  }

  get dataset() {
    return this.container.dataset
  }

  /**
   * Query selector helper that returns the first matching element within the section container
   * @param {string} selector - CSS selector string
   * @param {HTMLElement} [dom=this.container] - Parent element to query within (defaults to section container)
   * @returns {HTMLElement|undefined} First matching element or undefined if none found
   */
  qs(selector, dom = this.container) {
    return this.qsa(selector, dom)[0]
  }

  /**
   * Query selector all helper that returns an array of matching elements within the section container,
   * filtering out nested components that match the selector.
   * 
   * @param {string} selector - CSS selector string to match elements
   * @param {HTMLElement} [dom=this.container] - Parent element to query within (defaults to section container)
   * @returns {HTMLElement[]} Array of matching elements, excluding nested component matches
   *
   */
  qsa(selector, dom = this.container) {
    return [...dom.querySelectorAll(selector)].filter(el => {
      const closest = el.closest('[data-component]')

      return !closest || closest.isSameNode(el)
    })
  }

  onUnload(e) {
    window.removeEventListener('taxi.navigateOut', this.onNavigateOut)
    window.removeEventListener('taxi.navigateIn', this.onNavigateIn)
    window.removeEventListener('taxi.navigateEnd', this.onNavigateEnd)

    this.lazyImageController.destroy()

    doComponentCleanup(this) // This automatically calls this.destroy() up all components recursively
  }

  onSectionSelect(e) {
    
  }

  onSectionDeselect(e) {

  }

  onSectionReorder(e) {

  }

  onBlockSelect(e) {

  }

  onBlockDeselect(e) {

  }

  onNavigateOut(e) {
    // const { from, trigger } = e.detail
  }

  onNavigateIn(e) {
    // const { to, trigger } = e.detail
  }

  onNavigateEnd(e) {
    // const { to, from, trigger } = e.detail
  }    
}
