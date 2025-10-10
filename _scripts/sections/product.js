import BaseSection from '@/sections/base'
import ProductDetailForm from '@/components/product/productDetailForm'
import ProductDetailGallery from '@/components/product/productDetailGallery'

export default class ProductSection extends BaseSection {
  static TYPE = 'product'

  constructor(container) {
    super(container)

    this.productDetailForm = new ProductDetailForm(this.qs(ProductDetailForm.SELECTOR), {
      onVariantChange: this.onVariantChange.bind(this)
    })

    this.galleries = this.qsa(ProductDetailGallery.SELECTOR).map(el => {
      return new ProductDetailGallery(el)
    })
  }

  onUnload() {    
    this.productDetailForm.destroy()
    this.galleries.forEach(g => g.destroy())

    super.onUnload()
  }

  /**
   * Look for a gallery matching one of the selected variant's options and switch to that gallery
   * If a matching gallery doesn't exist, look for the variant's featured image in the main gallery and switch to that
   *
   * @param {Object} variant - Shopify variant object
   * @param {Array} selectedOptions - Array of options
   * @param {Object} [option]
   * @param {String} option.name  - i.e. "Color"
   * @param {String} option.value - i.e. "Gun Metal"
   */
  onVariantChange({ variant, selectedOptions }) {
    this.updateGalleries(selectedOptions)
  }

  updateGalleries(currentOptions) {
    const currentColorOption = currentOptions.find(opt => (opt.name && opt.name.toLowerCase()) === 'color') || {}
    const selectedColor = currentColorOption.value

    if (this.galleries.length > 1) {
      if (selectedColor !== null) {
        const activeGallery = this.galleries.find(g => g.isActive)
        const selectedColorGallery = this.galleries.find(g => g.color === selectedColor)

        if (activeGallery !== selectedColorGallery) {
          activeGallery.el.style.opacity = 0
          activeGallery.deactivate()

          selectedColorGallery.el.style.opacity = 0
          selectedColorGallery.activate()
          selectedColorGallery.el.style.opacity = ''
        }
      }
    }
    else {
      // Do nothing...
    }
  }
}