import BaseComponent from '@/components/base'
import { prefersPointer } from '@/core/utils'

const selectors = {
  mediaSecondary: '[data-media-secondary]'
}

const classes = {
  mediaSecondaryReady: 'is-ready'
}

export default class ProductCard extends BaseComponent {
  static TYPE = 'product-card'

  mediaSecondary: HTMLElement | null
  
  constructor(el: HTMLElement) {
    super(el, {
      watchIntersection: true,
    })

    this.mediaSecondary = this.qs(selectors.mediaSecondary)
  }

  onIntersection(entries: IntersectionObserverEntry[]) {
    if (entries[0].isIntersecting) {
      if (this.mediaSecondary instanceof HTMLElement && prefersPointer()) {
        const img = this.qs<HTMLImageElement>('img', this.mediaSecondary)

        if (img) {
          img.onload = () => this.mediaSecondary?.classList.add(classes.mediaSecondaryReady)

          if (img.dataset.src) img.src = img.dataset.src;
          if (img.dataset.srcset) img.srcset = img.dataset.srcset;
  
          img.removeAttribute('data-src')
          img.removeAttribute('data-srcset')
        }
      }

      this.killIntersectionObserver()
    }
  }  
}
