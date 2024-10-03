import animateScrollTo from 'animated-scroll-to'

import BaseSection from './base'
import ProductDetailForm from '../components/product/productDetailForm'
import ProductDetailGallery from '../components/product/productDetailGallery'

export default class ProductSection extends BaseSection {
  static TYPE = 'product'

  constructor(container) {
    super(container)

    this.productDetailForm = new ProductDetailForm(this.container.querySelector(ProductDetailForm.selector), {
      onVariantChange: this.onVariantChange.bind(this)
    })

    this.galleries = [...this.container.querySelectorAll(ProductDetailGallery.selector)].map(el => new ProductDetailGallery(el))
  }

  onUnload() {
    super.onUnload()
    
    this.productDetailForm.destroy()
    this.galleries.forEach(g => g.destroy())
  }

  /**
   * Look for a gallery matching one of the selected variant's options and switch to that gallery
   * If a matching gallery doesn't exist, look for the variant's featured image in the main gallery and switch to that
   *
   * @param {Object} variant - Shopify variant object
   * @param {Array} currentOptions - Array of options
   * @param {Object} [option]
   * @param {String} option.name  - i.e. "Color"
   * @param {String} option.value - i.e. "Gun Metal"
   */
  onVariantChange(variant, currentOptions) {
    this.updateGalleries(currentOptions)
  }

  updateGalleries(currentOptions) {
    const currentColorOption = currentOptions.find(opt => (opt.name && opt.name.toLowerCase()) === 'color') || {}
    const selectedColor = currentColorOption.value

    if (this.galleries.length > 1) {
      if (selectedColor !== null) {
        const activeGallery = this.galleries.find(g => g.isActive)
        const selectedColorGallery = this.galleries.find(g => g.color === selectedColor)

        if (activeGallery !== selectedColorGallery) {
          activeGallery.$el.stop().fadeTo(100, 0, 'easeOutQuad', function () {
            activeGallery.deactivate()
            selectedColorGallery.$el.css('opacity', 0)
            selectedColorGallery.activate()

            // Maybe only do this if we're above the mobile breakpoint?
            animateScrollTo(0, {
              speed: 700,
              minDuration: 300,
              maxDuration: 1000
            })

            setTimeout(function () {
              selectedColorGallery.$el.stop().fadeTo(700, 1, 'easeInQuad')
            }, 20)
          })
        }
      }
    }
    else {
      // Do nothing...
    }
  }
}