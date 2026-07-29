import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel'
import { setAriaCurrent } from '@/core/utils/a11y'
import BaseComponent from '@/components/base'
import A11yStatus from '@/components/a11y/a11yStatus'

const selectors = {
  buttonNext: 'button[data-next]',
  buttonPrevious: 'button[data-previous]',
  pagination: '[data-pagination]',
}

export default class ProductDetailGallery extends BaseComponent {
  static TYPE = 'product-detail-gallery'

  color: string | undefined
  productTitle: string | undefined
  emblaNode: HTMLElement
  emblaViewport: HTMLElement
  slides: HTMLElement[]
  pagination: HTMLElement | null
  buttonNext: HTMLElement | null
  buttonPrevious: HTMLElement | null
  slideshowDisabled: boolean
  emblaA11yStatus: A11yStatus
  emblaApi: EmblaCarouselType | undefined

  constructor(el: HTMLElement) {
    super(el)

    this.color = this.dataset.color
    this.productTitle = this.dataset.productTitle

    this.emblaNode = this.qsRequired('.embla')
    this.emblaViewport = this.qsRequired('.embla__viewport')
    this.slides = this.qsa('.embla__slide')

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

  get isActive() {
    return this.el.getAttribute('aria-current') === 'true'
  }

  set isActive(value: boolean) {
    setAriaCurrent(this.el, value ? 'true' : undefined)
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

    this.isActive = true
    this.emblaApi?.reInit()
  }

  deactivate() {
    this.isActive = false
  }

  updatePagination() {
    if (!this.pagination || !this.emblaApi) return
    
    this.pagination.innerHTML = `${this.emblaApi?.selectedScrollSnap() + 1} / ${this.emblaApi?.scrollSnapList().length}`
  }

  updateAriaCurrent(items: HTMLElement[], activeIndex: number) {
    items?.forEach((item, index) => {
      setAriaCurrent(item, index === activeIndex ? 'true' : undefined)
    })
  }

  updateCurrentStatus() {
    let msg = `Image ${this.activeIndex + 1} of ${this.slideCount}`

    if (this.productTitle) {
      msg = `${msg} for ${this.productTitle}`
    }

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
