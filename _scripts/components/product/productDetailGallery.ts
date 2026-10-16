import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel'
import { setAriaCurrent } from '@/core/utils/a11y'
import BaseComponent from '@/components/base'
import A11yStatus from '@/components/a11y/a11yStatus'

const selectors = {
  embla: '.embla',
  emblaViewport: '.embla__viewport',
  slide: '.embla__slide',
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
  buttonNext: HTMLButtonElement | null
  buttonPrevious: HTMLButtonElement | null
  emblaA11yStatus: A11yStatus
  emblaApi: EmblaCarouselType

  constructor(el: HTMLElement) {
    super(el)

    this.color = this.dataset.color
    this.productTitle = this.dataset.productTitle

    this.emblaNode = this.qsRequired(selectors.embla)
    this.emblaViewport = this.qsRequired(selectors.emblaViewport)
    this.slides = this.qsa(selectors.slide)

    this.pagination = this.qs(selectors.pagination)
    this.buttonNext = this.qs<HTMLButtonElement>(selectors.buttonNext)
    this.buttonPrevious = this.qs<HTMLButtonElement>(selectors.buttonPrevious)

    const slideCount = this.slides.length

    this.slides.forEach((el, i) => el.setAttribute('aria-label', `${i + 1} of ${slideCount}`))

    this.emblaA11yStatus = A11yStatus.generate(this.emblaNode)

    this.emblaApi = EmblaCarousel(this.emblaViewport, {
      // @NOTE: Assumes 1 slide per view. If multiple slides are visible, compare against slides-per-view instead of 1
      loop: slideCount > 1,
      watchDrag: slideCount > 1,
    })

    this.setCurrentStatus = this.setCurrentStatus.bind(this)

    this.emblaApi.on('init', this.setCurrentStatus)
    this.emblaApi.on('reInit', this.setCurrentStatus)
    this.emblaApi.on('select', this.setCurrentStatus)

    this.buttonNext?.addEventListener('click', this.onButtonNextClick.bind(this))
    this.buttonPrevious?.addEventListener('click', this.onButtonPreviousClick.bind(this))
  }

  get isActive() {
    return this.el.getAttribute('aria-current') === 'true'
  }

  set isActive(value: boolean) {
    setAriaCurrent(this.el, value ? 'true' : undefined)
  }

  destroy() {
    this.emblaApi.destroy()

    super.destroy()
  }

  activate() {
    if (this.isActive) return

    (this.qsa<HTMLImageElement>('img')).forEach(img => img.setAttribute('loading', 'eager'))

    this.isActive = true
    this.emblaApi.reInit()
  }

  deactivate() {
    this.isActive = false
  }

  setCurrentStatus() {
    const totalSnapCount = this.emblaApi.scrollSnapList().length
    const displaySnapIndex = this.emblaApi.selectedScrollSnap() + 1

    // Update A11y Status
    let msg = `Slide ${displaySnapIndex} of ${totalSnapCount}`

    if (this.productTitle) {
      msg += ` for ${this.productTitle}`
    }

    if (this.color) {
      msg += ` in ${this.color}`
    }

    this.emblaA11yStatus.text = msg    

    // Update Pagination
    if (!this.pagination) return

    this.pagination.textContent = `${displaySnapIndex} / ${totalSnapCount}`
  }

  onButtonNextClick(e: MouseEvent) {
    e.preventDefault()
    this.emblaApi.scrollNext()
  }

  onButtonPreviousClick(e: MouseEvent) {
    e.preventDefault()
    this.emblaApi.scrollPrev()
  }
}
