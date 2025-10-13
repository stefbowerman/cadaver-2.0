import EmblaCarousel from 'embla-carousel'
import BaseComponent from '@/components/base'

const selectors = {
  slideshow: '[data-slideshow]',
  slide: '.embla__slide',
}

const classes = {
  isActive: 'is-active',
  slideshowDisabled: 'is-disabled'
}

const addDotBtnsAndClickHandlers = (emblaApi, dotsNode) => {
  let dotNodes = []

  const addDotBtnsWithClickHandlers = () => {
    dotsNode.innerHTML = emblaApi
      .scrollSnapList()
      .map(() => '<button class="embla__dot" type="button"></button>')
      .join('')

    const scrollTo = (index) => {
      emblaApi.scrollTo(index)
    }

    dotNodes = Array.from(dotsNode.querySelectorAll('.embla__dot'))
    dotNodes.forEach((dotNode, index) => {
      dotNode.addEventListener('click', () => scrollTo(index), false)
    })
  }

  const toggleDotBtnsActive = () => {
    const previous = emblaApi.previousScrollSnap()
    const selected = emblaApi.selectedScrollSnap()
    dotNodes[previous].classList.remove('embla__dot--selected')
    dotNodes[selected].classList.add('embla__dot--selected')
  }

  emblaApi
    .on('init', addDotBtnsWithClickHandlers)
    .on('reInit', addDotBtnsWithClickHandlers)
    .on('init', toggleDotBtnsActive)
    .on('reInit', toggleDotBtnsActive)
    .on('select', toggleDotBtnsActive)

  return () => {
    dotsNode.innerHTML = ''
  }
}

const addPaginationHandlers = (emblaApi, paginationNode) => {
  const updatePagination = () => {
    paginationNode.innerHTML = `${emblaApi.selectedScrollSnap() + 1} / ${emblaApi.scrollSnapList().length}`
  }

  emblaApi
    .on('init', updatePagination)
    .on('reInit', updatePagination)
    .on('select', updatePagination)

  return () => {
    paginationNode.innerHTML = ''
  }
}

export default class ProductDetailGallery extends BaseComponent {
  static TYPE = 'product-detail-gallery'

  constructor(el) {
    super(el)

    this.images = this.qsa('img')

    this.emblaNode = this.qs('.embla')
    this.slideshow = this.qs(selectors.slideshow)

    this.slideCount = this.qsa(selectors.slide).length
    this.color = this.dataset.color
    this.isActive = this.el.classList.contains(classes.isActive)


    this.emblaApi = EmblaCarousel(this.slideshow, {
      loop: this.slideCount > 1
    })

    this.removeDotBtnsAndClickHandlers = addDotBtnsAndClickHandlers(
      this.emblaApi,
      this.emblaNode.querySelector('.embla__dots')
    )

    this.removePaginationHandlers = addPaginationHandlers(
      this.emblaApi,
      this.emblaNode.querySelector('.embla__pagination')
    )

    if (this.slideCount === 1) {
      this.slideshow.classList.add(classes.slideshowDisabled)

      // @TODO - Should remove the dots and pagination (or not initialize in the first place...)
    }    
  }

  destroy() {
    this.removePaginationHandlers()
    this.removeDotBtnsAndClickHandlers()
    this.emblaApi.destroy()

    super.destroy()
  }

  activate() {
    if (this.isActive) return

    this.el.classList.add(classes.isActive)
    this.images.forEach(img => img.setAttribute('loading', 'eager'))
    this.isActive = true
  }

  deactivate() {
    this.el.classList.remove(classes.isActive)
    this.isActive = false
  }  
}