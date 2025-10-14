/**
 * Lazy Image Controller
 * ------------------------------------------------------------------------------
 *
 * Implements a lazy loading mechanism for images on a web page.
 * It uses the Intersection Observer API to detect when images enter the viewport, loading them only when they become visible to improve page performance.
 * Additionally, it employs a Mutation Observer to dynamically handle new images added to the DOM, ensuring that lazy loading is applied to all relevant images, even those added after initial page load.
 *
 */

const SELECTOR = 'img.lazy-image'
const LOADED_CLASS = 'is-loaded'
const CACHED_CLASS = 'is-cached'

export default class LazyImageController {
  el: HTMLElement
  observedElements: WeakSet<HTMLImageElement>
  imageObserver: IntersectionObserver
  mutationObserver: MutationObserver

  /**
   * @param el - Element containing all images
   */
  constructor(el: HTMLElement) {
    this.el = el
    
    // Create a weakset to keep track of which elements are already being observed
    this.observedElements = new WeakSet()

    this.imageObserver = new IntersectionObserver(this.onIntersection.bind(this), {
      rootMargin: '0px 0px 50% 0px'
    })

    this.mutationObserver = new MutationObserver(this.onMutation.bind(this))
    this.mutationObserver.observe(this.el, { childList: true, subtree: true })

    this.el.querySelectorAll(SELECTOR).forEach(img => this.observeImage(img as HTMLImageElement))
  }

  destroy() {
    this.imageObserver.disconnect()
    this.mutationObserver.disconnect()
  }

  unobserveImage(img: HTMLImageElement) {
    if (!this.observedElements.has(img)) {
      return
    }

    this.imageObserver.unobserve(img)
    this.observedElements.delete(img)
  }

  observeImage(img: HTMLImageElement) {
    if (this.observedElements.has(img)) {
      return
    }

    this.imageObserver.observe(img)
    this.observedElements.add(img)
  }

  onImageLoad(img: HTMLImageElement) {
    img.classList.add(LOADED_CLASS)
  }

  onIntersection(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target

        // Create a named function so that we can remove the eventListener
        const loadHandler = () => {
          this.onImageLoad(img as HTMLImageElement)
          img.removeEventListener('load', loadHandler)
        }        

        if ((img as HTMLImageElement).complete) {
          loadHandler()
          img.classList.add(CACHED_CLASS)
        }
        else {
          img.addEventListener('load', loadHandler)
        }

        observer.unobserve(img)
      }
    })
  }

  onMutation(mutationsList: MutationRecord[]) {
    const processNodes = (nodes: NodeList, handler: (node: HTMLElement) => void) => {
      nodes.forEach(node => {
        if (!(node instanceof HTMLElement)) return
  
        if (node.matches && node.matches(SELECTOR)) {
          handler(node as HTMLImageElement)
        }
        else {
          node.querySelectorAll(SELECTOR).forEach(img => handler(img as HTMLImageElement))
        }
      })
    }

    mutationsList.forEach(mutation => {
      if (mutation.type === 'childList') {
        processNodes(mutation.removedNodes, this.unobserveImage.bind(this))
        processNodes(mutation.addedNodes, this.observeImage.bind(this))
      }
    })
  }
}