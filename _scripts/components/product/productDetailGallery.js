import Swiper from 'swiper'

const selectors = {
  slideshow: '[data-slideshow]',
  slide: '.swiper-slide',
}

const classes = {
  isActive: 'is-active',
  slideshowDisabled: 'is-disabled'
}

export default class ProductDetailGallery {
  constructor(el) {
    this.$el = $(el)
    this.$images = $('img', this.$el)
    this.$slideshow = $(selectors.slideshow, this.$el)
    this.$slides = $(selectors.slide, this.$el)    

    this.slideCount = this.$slides.length // Swiper can't give you the total count without duplicates..
    this.color = this.$el.data('color')
    this.isActive = this.$el.hasClass(classes.isActive) 

    this.swiper = new Swiper(this.$slideshow.get(0), {     
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
      this.$slideshow.addClass(classes.slideshowDisabled)
    }    
  }

  destroy() {

  }

  activate() {
    if (this.isActive) return

    this.$el.addClass(classes.isActive)
    this.$images.attr('loading', 'eager')
    this.isActive = true;
  }

  deactivate() {
    this.$el.removeClass(classes.isActive)
    this.isActive = false
  }

  findImageById(id) {
    return this.$images.filter(`[data-image-id="${id}"]`).get(0)
  }   
}