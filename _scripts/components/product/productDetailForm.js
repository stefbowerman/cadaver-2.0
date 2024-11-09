import CartAPI from '../../core/cartAPI'

import BaseComponent from '../base'
import ProductPrice from './productPrice'
import ATCButton from './atcButton'
import VariantPicker from './variantPicker'

const selectors = {
  form: 'form[action*="/cart/add"]',
  submit: '[type="submit"]',
  productJSON: '[data-product-json]',
  masterSelect: 'select[name="id"]'
}

export default class ProductDetailForm extends BaseComponent {
  static TYPE = 'product-detail-form'

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

    this.submitInProgress = false

    this.form = this.qs(selectors.form)
    this.masterSelect = this.qs(selectors.masterSelect)

    this.product = JSON.parse(this.qs(selectors.productJSON).textContent)
    this.price = new ProductPrice(this.qs(ProductPrice.SELECTOR))
    this.atcButton = new ATCButton(this.qs(ATCButton.SELECTOR))

    this.variantPicker = new VariantPicker(this.qs(VariantPicker.SELECTOR), {
      product: this.product,
      onVariantChange: this.onVariantChange.bind(this)
    })

    this.form.addEventListener('submit', this.onFormSubmit.bind(this))
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


  onFormSubmit(e) {
    e.preventDefault()

    if (this.submitInProgress) return

    const submit = this.form.querySelector(selectors.submit)

    // Disable the button so the user knows the form is being submitted
    submit.disabled = true
    this.submitInProgress = true

    this.onAddStart()

    CartAPI.addItemFromForm(this.form)
      .then(() => {
        this.onAddSuccess()
      })
      .catch((e) => {
        this.onAddFail(e)
      })
      .finally(() => {
        submit.disabled = false
        this.submitInProgress = false
      })

    // @TODO - Add role="status" for a11y
  }   

  onAddStart() {
    this.atcButton.onAddStart()
  }

  onAddSuccess() {
    this.atcButton.onAddSuccess()
  }
}