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
  /**
   * 
   * @param {HTMLElement} el - Element containing all images
   */
  constructor(el) {
    this.el = el
    
    if (!this.el) {
      return
    }


    // Create a weakset to keep track of which elements are already being observed
    this.observedElements = new WeakSet()

    this.imageObserver = new IntersectionObserver(this.onIntersection.bind(this), {
      rootMargin: '0px 0px 50% 0px'
    })

    this.mutationObserver = new MutationObserver(this.onMutation.bind(this))
    this.mutationObserver.observe(this.el, { childList: true, subtree: true })

    this.el.querySelectorAll(SELECTOR).forEach(img => this.observeImage(img))
  }

  destroy() {
    this.imageObserver.disconnect()
    this.mutationObserver.disconnect()
  }

  unobserveImage(img) {
    if (!this.observedElements.has(img)) {
      return
    }

    this.imageObserver.unobserve(img)
    this.observedElements.delete(img)
  }

  observeImage(img) {
    if (this.observedElements.has(img)) {
      return
    }

    this.imageObserver.observe(img)
    this.observedElements.add(img)
  }

  onImageLoad(img) {
    img.classList.add(LOADED_CLASS)
  }

  onIntersection(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target

        // Create a named function so that we can remove the eventListener
        const loadHandler = () => {
          this.onImageLoad(img)
          img.removeEventListener('load', loadHandler)
        }        

        if (img.complete) {
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

  onMutation(mutationsList) {
    const processNodes = (nodes, handler) => {
      nodes.forEach(node => {
        if (!(node instanceof Element)) return
  
        if (node.matches && node.matches(SELECTOR)) {
          handler(node)
        }
        else {
          node.querySelectorAll(SELECTOR).forEach(img => handler(img))
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