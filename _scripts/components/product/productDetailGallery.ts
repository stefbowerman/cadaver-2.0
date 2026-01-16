import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel'
import BaseComponent from '@/components/base'
import A11yStatus from '@/components/a11y/a11yStatus'

const selectors = {
  buttonNext: 'button[data-next]',
  buttonPrevious: 'button[data-previous]',
  pagination: '[data-pagination]',
}

export default class ProductDetailGallery extends BaseComponent {
  static TYPE = 'product-detail-gallery'

  color: string
  productTitle: string
  isActive: boolean
  emblaNode: HTMLElement | undefined
  emblaViewport: HTMLElement | undefined
  emblaPaginationNode: HTMLElement | undefined
  slides: HTMLElement[]
  pagination: HTMLElement | undefined
  buttonNext: HTMLElement | undefined
  buttonPrevious: HTMLElement | undefined
  slideshowDisabled: boolean
  emblaA11yStatus: A11yStatus | undefined
  emblaApi: EmblaCarouselType | undefined

  constructor(el: HTMLElement) {
    super(el)

    this.color = this.dataset.color
    this.productTitle = this.dataset.productTitle
    this.isActive = this.el.getAttribute('aria-current') === 'true'

    this.emblaNode = this.qs('.embla')
    this.emblaViewport = this.qs('.embla__viewport')
    this.emblaPaginationNode = this.qs('.embla__pagination')
    this.slides = this.qsa('.embla__slide')

    if (!this.emblaNode) {
      console.warn('ProductDetailGallery: Embla node not found')
      return
    }

    this.pagination = this.qs(selectors.pagination)
    this.buttonNext = this.qs(selectors.buttonNext)
    this.buttonPrevious = this.qs(selectors.buttonPrevious)

    this.slideshowDisabled = this.slideCount <= 1

    this.emblaA11yStatus = A11yStatus.generate(this.emblaNode)

    this.emblaApi = EmblaCarousel(this.emblaViewport, {
      loop: this.slideCount > 1,
      watchDrag: !this.slideshowDisabled,
    })

    const setCurrentStatus = () => {
      this.updatePagination()
      this.updateCurrentStatus()
    }

    this.emblaApi.on('init', setCurrentStatus)
    this.emblaApi.on('reInit', setCurrentStatus)
    this.emblaApi.on('select', setCurrentStatus)

    this.buttonNext?.addEventListener('click', this.onButtonNextClick.bind(this))
    this.buttonPrevious?.addEventListener('click', this.onButtonPreviousClick.bind(this))
  }

  get activeIndex() {
    return this.emblaApi?.selectedScrollSnap() ?? 0
  }

  get slideCount() {
    return this.slides?.length ?? 0
  }

  destroy() {
    this.emblaApi?.destroy()

    super.destroy()
  }

  activate() {
    if (this.isActive) return

    (this.qsa('img') as HTMLImageElement[]).forEach(img => img.setAttribute('loading', 'eager'))

    this.el.setAttribute('aria-current', 'true')
    this.emblaApi?.reInit()
    this.isActive = true
  }

  deactivate() {
    this.el.removeAttribute('aria-current')
    this.isActive = false
  }

  updatePagination() {
    if (!this.pagination) return
    
    this.pagination.innerHTML = `${this.emblaApi?.selectedScrollSnap() + 1} / ${this.emblaApi?.scrollSnapList().length}`
  }

  updateAriaCurrent(items: HTMLElement[], activeIndex: number) {
    items?.forEach((item, index) => {
      if (index === activeIndex) {
        item.setAttribute('aria-current', 'true')
      }
      else {
        item.removeAttribute('aria-current')
      }
    })
  }

  updateCurrentStatus() {
    let msg = `Image ${this.activeIndex + 1} of ${this.slideCount} for ${this.productTitle}`

    if (this.color) {
      msg = `${msg} in ${this.color}`
    }

    this.emblaA11yStatus.text = msg    
    this.updateAriaCurrent(this.slides, this.activeIndex) 
  }

  onButtonNextClick(e: MouseEvent) {
    e.preventDefault()
    this.emblaApi?.scrollNext()
  }

  onButtonPreviousClick(e: MouseEvent) {
    e.preventDefault()
    this.emblaApi?.scrollPrev()
  }
}
