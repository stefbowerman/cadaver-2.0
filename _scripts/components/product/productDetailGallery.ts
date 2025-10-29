import { Swiper } from 'swiper'
import BaseComponent from '@/components/base'

const selectors = {
  slideshow: '[data-slideshow]',
  slide: '.swiper-slide',
}

const classes = {
  isActive: 'is-active',
  slideshowDisabled: 'is-disabled'
}

export default class ProductDetailGallery extends BaseComponent {
  static TYPE = 'product-detail-gallery'

  images: HTMLImageElement[]
  slideshow: HTMLElement | undefined
  slideCount: number
  color: string
  isActive: boolean
  swiper: Swiper

  constructor(el) {
    super(el)

    this.images = this.qsa('img') as HTMLImageElement[]

    this.slideshow = this.qs(selectors.slideshow)

    this.slideCount = this.qsa(selectors.slide).length // Swiper can't give you the total count without duplicates.. Also don't set this to a variable since it changes as soon as swiper is initialized
    this.color = this.dataset.color
    this.isActive = this.el.classList.contains(classes.isActive)

    this.swiper = new Swiper(this.slideshow, {     
      init: false,
      loop: this.slideCount > 1,
      effect: 'slide',
      speed: 600,
      simulateTouch: true,
      on: {
        realIndexChange: (swiper: Swiper) => {
          // 
        }
      }       
    }) 
    
    this.swiper.init()

    if (this.slideCount === 1) {
      this.slideshow.classList.add(classes.slideshowDisabled)
    }    
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