import { events as AJAXFormManagerEvents } from '../../core/ajaxFormManager'

import BaseComponent from '../base'
import ProductPrice from './productPrice'
import ATCButton from './atcButton'
import VariantPicker from './variantPicker'

const selectors = {
  form: 'form[data-add-to-cart-form]',
  productJSON: '[data-product-json]',
  masterSelect: 'select[name="id"]'
}

export default class ProductDetailForm extends BaseComponent {
  static TYPE = 'product-detail-form'
  static selector = '[data-product-detail-form]'

  /**
   * ProductDetailForm constructor
   *
   * @param { HTMLElement } el
   * @param { Object } options
   * @param { Function } options.onVariantChange -  Called when a new variant has been selected from the form,
   * @param { Boolean } options.enableHistoryState - If set to "true", turns on URL updating when switching variant
   */  
  constructor(el, options = {}) {
    super(el)

    this.settings = {
      onVariantChange: () => {},
      enableHistoryState: true,
      ...options
    }    

    this.form = this.qs(selectors.form)
    this.masterSelect = this.qs(selectors.masterSelect)

    this.product = JSON.parse(this.qs(selectors.productJSON).textContent)
    this.price = new ProductPrice(this.el.querySelector(ProductPrice.SELECTOR))
    this.atcButton = new ATCButton(this.el.querySelector(ATCButton.SELECTOR))

    this.variantPicker = new VariantPicker(this.el.querySelector(VariantPicker.SELECTOR), {
      product: this.product,
      onVariantChange: this.onVariantChange.bind(this)
    })    

    this.onAddStart = this.onAddStart.bind(this)
    this.onAddSuccess = this.onAddSuccess.bind(this)    

    window.addEventListener(AJAXFormManagerEvents.ADD_START, this.onAddStart)
    window.addEventListener(AJAXFormManagerEvents.ADD_SUCCESS, this.onAddSuccess)
  }

  destroy() {
    this.variantPicker.destroy()
    window.removeEventListener(AJAXFormManagerEvents.ADD_START, this.onAddStart)
    window.removeEventListener(AJAXFormManagerEvents.ADD_SUCCESS, this.onAddSuccess)

    super.destroy()
  }

  updateHistoryState(variant) {
    if (!this.settings.enableHistoryState) return

    const newurl = new URL(window.location.href)

    if (variant) {
      newurl.searchParams.set('variant', variant.id)
    }
    else {
      newurl.searchParams.delete('variant')
    }

    window.history.replaceState({ path: newurl.href }, '', newurl.href)
  }  

  onVariantChange(e) {
    const { variant } = e

    this.masterSelect.value = variant?.id

    this.updateHistoryState(variant)
    this.atcButton.update(variant)
    this.price.update(variant)

    this.settings.onVariantChange(e)
  }

  onAddStart({ detail: { relatedTarget } }) {
    if (this.form !== relatedTarget) return
      
    this.atcButton.onAddStart()
  }

  onAddSuccess({ detail: { relatedTarget } }) {
    if (this.form !== relatedTarget) return

    this.atcButton.onAddSuccess()
  }
}