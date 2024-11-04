import { Swiper } from 'swiper'

const selectors = {
  slideshow: '[data-slideshow]',
  slide: '.swiper-slide',
}

const classes = {
  isActive: 'is-active',
  slideshowDisabled: 'is-disabled'
}

export default class ProductDetailGallery {
  static selector = '[data-product-detail-gallery]'

  constructor(el) {
    this.el = el
    this.images = this.el.querySelectorAll('img')

    this.slideshow = this.el.querySelector(selectors.slideshow)

    this.slideCount = this.el.querySelectorAll(selectors.slide).length // Swiper can't give you the total count without duplicates.. Also don't set this to a variable since it changes as soon as swiper is initialized
    this.color = this.el.dataset.color
    this.isActive = this.el.classList.contains(classes.isActive)

    this.swiper = new Swiper(this.slideshow, {     
      init: false,
      loop: this.slideCount > 1,
      effect: 'slide',
      speed: 600,
      simulateTouch: true,
      on: {
        realIndexChange: (swiper) => {
          // 
        }
      }       
    }) 
    
    this.swiper.init()

    if (this.slideCount === 1) {
      this.slideshow.classList.add(classes.slideshowDisabled)
    }    
  }

  destroy() {

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