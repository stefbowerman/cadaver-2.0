import BaseComponent from '@/components/base'

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
    super(el)

    this.mediaSecondary = this.qs(selectors.mediaSecondary)

    // The secondary image is only revealed on hover / focus, so don't request it until then
    if (this.mediaSecondary) {
      this.el.addEventListener('pointerenter', this.loadMediaSecondary, { once: true })
      this.el.addEventListener('focusin', this.loadMediaSecondary, { once: true })
    }
  }

  loadMediaSecondary = () => {
    if (!this.mediaSecondary) return

    const img = this.mediaSecondary.querySelector('img')

    // Already loaded by the other event
    if (!img || (!img.dataset.src && !img.dataset.srcset)) return

    img.onload = () => this.mediaSecondary?.classList.add(classes.mediaSecondaryReady)

    if (img.dataset.src) img.src = img.dataset.src
    if (img.dataset.srcset) img.srcset = img.dataset.srcset

    img.removeAttribute('data-src')
    img.removeAttribute('data-srcset')
  }
}
