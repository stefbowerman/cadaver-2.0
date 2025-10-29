import type {
  ThemeEditorSectionUnloadEvent,
  ThemeEditorSectionSelectEvent,
  ThemeEditorSectionDeselectEvent,
  ThemeEditorSectionReorderEvent,
  ThemeEditorBlockSelectEvent,
  ThemeEditorBlockDeselectEvent,
} from '@/types/shopify'

import type {
  TaxiNavigateOutEvent,
  TaxiNavigateInEvent,
  TaxiNavigateEndEvent,
} from '@/types/taxi'

import LazyImageController from '@/core/lazyImageController'
import { doComponentCleanup } from '@/components/base'

// Standard components
import GraphicCoverVideo from '@/components/graphicCoverVideo'

export default class BaseSection {
  static TYPE: string

  container: HTMLElement
  id: string
  type: string
  parent: HTMLElement
  parentId: string
  lazyImageController: LazyImageController
  graphicCoverVideos: GraphicCoverVideo[]

  constructor(container: HTMLElement) {
    this.container = container
    this.id = this.dataset.sectionId
    this.type = (this.constructor as typeof BaseSection).TYPE
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

  get dataset(): DOMStringMap {
    return this.container.dataset
  }

  /**
   * Query selector helper that returns the first matching element within the section container
   * @param {string} selector - CSS selector string
   * @param {HTMLElement} [dom=this.container] - Parent element to query within (defaults to section container)
   * @returns {HTMLElement|undefined} First matching element or undefined if none found
   */
  qs(selector: string, dom: HTMLElement = this.container): HTMLElement | undefined {
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
  qsa(selector: string, dom: HTMLElement = this.container): HTMLElement[] {
    return Array.from(dom.querySelectorAll(selector)).filter(el => {
      const closest = el.closest('[data-component]')

      return !closest || closest.isSameNode(el)
    }) as HTMLElement[]
  }

  onUnload(e: ThemeEditorSectionUnloadEvent) {
    window.removeEventListener('taxi.navigateOut', this.onNavigateOut)
    window.removeEventListener('taxi.navigateIn', this.onNavigateIn)
    window.removeEventListener('taxi.navigateEnd', this.onNavigateEnd)

    this.lazyImageController.destroy()

    doComponentCleanup(this) // This automatically calls this.destroy() up all components recursively
  }

  onSectionSelect(e: ThemeEditorSectionSelectEvent) {
    
  }

  onSectionDeselect(e: ThemeEditorSectionDeselectEvent) {

  }

  onSectionReorder(e: ThemeEditorSectionReorderEvent) {

  }

  onBlockSelect(e: ThemeEditorBlockSelectEvent) {

  }

  onBlockDeselect(e: ThemeEditorBlockDeselectEvent) {

  }

  onNavigateOut(e: TaxiNavigateOutEvent) {
    
  }

  onNavigateIn(e: TaxiNavigateInEvent) {
    
  }

  onNavigateEnd(e: TaxiNavigateEndEvent) {
    
  }    
}
