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

import { sectionRenderService } from '@/core/sectionRenderService'
import { formatTable } from '@/core/rte'

import { doComponentCleanup } from '@/components/base'

// Standard components
import GraphicCoverVideo from '@/components/graphicCoverVideo'

export interface BaseSectionOptions {
  watchIntersection?: boolean
  intersectionOptions?: IntersectionObserverInit
  cacheOnLoad?: boolean
}

type BaseSectionSettings = Required<BaseSectionOptions>

export default class BaseSection {
  static TYPE: string

  #settings: BaseSectionSettings;
  #intersectionObserver: IntersectionObserver | null;

  type: string
  container: HTMLElement
  id: string
  parent: HTMLElement
  parentId: string
  graphicCoverVideos: GraphicCoverVideo[]

  constructor(container: HTMLElement, options: BaseSectionOptions = {}) {
    this.#settings = {
      watchIntersection: false,
      cacheOnLoad: false,
      intersectionOptions: {
        rootMargin: '0px',
        threshold: 0.01,        
      },
      ...options
    }

    this.#intersectionObserver = null
    this.type = (this.constructor as typeof BaseSection).TYPE

    this.container = container
    this.id = this.dataset.sectionId ?? ''

    if (!this.id) {
      console.warn('Section ID not found', this)
    }    

    const parent = this.container.parentElement

    if (!parent) { 
      throw new Error(`[${this.type}] Section container has no parent element`)
    }

    this.parent = parent
    this.parentId = this.parent.id

    this.onNavigateOut = this.onNavigateOut.bind(this)
    this.onNavigateIn  = this.onNavigateIn.bind(this)
    this.onNavigateEnd = this.onNavigateEnd.bind(this)
    this.onIntersection = this.onIntersection.bind(this)

    window.addEventListener('taxi.navigateOut', this.onNavigateOut)
    window.addEventListener('taxi.navigateIn', this.onNavigateIn)
    window.addEventListener('taxi.navigateEnd', this.onNavigateEnd)

    // This need to go here so that the clean section html is cached before any component initialization
    if (this.#settings.cacheOnLoad) {
      sectionRenderService.cacheSection(this)
    }    

    if (this.#settings.watchIntersection) {
      this.#intersectionObserver = new IntersectionObserver(this.onIntersection, this.#settings.intersectionOptions)
      this.#intersectionObserver.observe(this.container)
    }      

    // Below are standard components that can be initialized at the base section level (until there's a reason for them to get pushed down somewhere more specific)
    this.graphicCoverVideos = this.qsa(GraphicCoverVideo.SELECTOR).map(el => {
      return new GraphicCoverVideo(el)
    })

    // Format tables in RTE
    Array.from(container.querySelectorAll('.rte table') as NodeListOf<HTMLTableElement>).forEach(formatTable)    

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
   * @returns {T|null} First matching element, narrowed to T, or null if none found
   */
  qs<T extends HTMLElement = HTMLElement>(selector: string, dom: HTMLElement = this.container): T | null {
    return this.qsa<T>(selector, dom)[0] ?? null
  }

  /**
   * Query selector helper that returns the first matching element within the section container,
   * throwing if no match is found. Use for elements the section's own template requires.
   * @param {string} selector - CSS selector string
   * @param {HTMLElement} [dom=this.container] - Parent element to query within
   * @returns {T} The first matching element, narrowed to T
   */
  qsRequired<T extends HTMLElement = HTMLElement>(selector: string, dom: HTMLElement = this.container): T {
    const el = this.qs<T>(selector, dom)

    if (!el) {
      throw new Error(`[${this.type}] Required element not found: "${selector}"`)
    }

    return el
  }

  /**
   * Query selector all helper that returns an array of matching elements within the section container,
   * filtering out nested components that match the selector.
   *
   * @param {string} selector - CSS selector string to match elements
   * @param {HTMLElement} [dom=this.container] - Parent element to query within (defaults to section container)
   * @returns {T[]} Array of matching elements, narrowed to T, excluding nested component matches
   *
   */
  qsa<T extends HTMLElement = HTMLElement>(selector: string, dom: HTMLElement = this.container): T[] {
    return Array.from(dom.querySelectorAll<T>(selector)).filter(el => {
      const closest = el.closest('[data-component]')

      return !closest || closest.isSameNode(el)
    })
  }

  onIntersection(entries: IntersectionObserverEntry[]) {
    // override in subclass
  }

  killIntersectionObserver() {
    this.#intersectionObserver?.disconnect()
    this.#intersectionObserver = null
  }

  /**
   * Called before the page transition begins to allow sections to run their own exit animations.
   * This method is awaited by the page transition system, so any async animations or cleanup
   * can delay the start of the main page transition until they complete.
   * 
   * the `transitionDuration` parameter is included to allow sections to sync their animations with the main page transition.
   * 
   * @param {number} transitionDuration - Duration of the main page transition in seconds
   * @returns {Promise<void>} Promise that resolves when section exit animations are complete
   *
   */
  async onRendererLeaveStart(transitionDuration: number) : Promise<void> {

  }

  onUnload(e?: ThemeEditorSectionUnloadEvent) {
    window.removeEventListener('taxi.navigateOut', this.onNavigateOut)
    window.removeEventListener('taxi.navigateIn', this.onNavigateIn)
    window.removeEventListener('taxi.navigateEnd', this.onNavigateEnd)

    this.killIntersectionObserver()

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
