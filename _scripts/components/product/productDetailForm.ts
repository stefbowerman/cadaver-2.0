import CartAPI from '@/core/cartAPI'
import { toAriaBoolean } from '@/core/utils/a11y'
import type { LiteProduct, LiteVariant } from '@/types/shopify'

import BaseComponent from '@/components/base'
import ProductPrice from '@/components/product/productPrice'
import ATCButton from '@/components/product/atcButton'
import VariantPicker, { type VariantChangeEvent } from '@/components/product/variantPicker'
import A11yStatus from '@/components/a11y/a11yStatus'

const selectors = {
  form: 'form[action*="/cart/add"]',
  submit: '[type="submit"]',
  productJSON: '[data-product-json]',
  masterSelect: 'select[name="id"]'
}

interface ProductDetailFormSettings {
  onVariantChange?: (e: VariantChangeEvent) => void
  enableHistoryState?: boolean
}

export default class ProductDetailForm extends BaseComponent {
  static TYPE = 'product-detail-form'

  settings: ProductDetailFormSettings
  submitInProgress: boolean
  form: HTMLFormElement
  masterSelect: HTMLSelectElement
  product: LiteProduct
  price: ProductPrice
  atcButton: ATCButton
  variantPicker: VariantPicker
  a11yStatus: A11yStatus

  /**
   * ProductDetailForm constructor
   *
   * @param el
   * @param options
   * @param options.onVariantChange -  Called when a new variant has been selected from the form,
   * @param options.enableHistoryState - If set to "true", turns on URL updating when switching variant
   */  
  constructor(el: HTMLElement, options: ProductDetailFormSettings = {}) {
    super(el)

    this.settings = {
      enableHistoryState: true,
      ...options
    }

    this.submitInProgress = false

    this.form = this.qs(selectors.form) as HTMLFormElement
    this.masterSelect = this.qs(selectors.masterSelect) as HTMLSelectElement

    this.product = JSON.parse(this.qs(selectors.productJSON).textContent)
    this.price = new ProductPrice(this.qs(ProductPrice.SELECTOR))
    this.atcButton = new ATCButton(this.qs(ATCButton.SELECTOR) as HTMLButtonElement)

    this.variantPicker = new VariantPicker(this.qs(VariantPicker.SELECTOR), {
      product: this.product,
      onVariantChange: this.onVariantChange.bind(this)
    })

    this.a11yStatus = A11yStatus.generate(this.form)

    this.form.addEventListener('submit', this.onFormSubmit.bind(this))
  }

  updateHistoryState(variant: LiteVariant) {
    if (!this.settings.enableHistoryState) return

    const newurl = new URL(window.location.href)

    if (variant) {
      newurl.searchParams.set('variant', variant.id.toString())
    }
    else {
      newurl.searchParams.delete('variant')
    }

    window.history.replaceState({ path: newurl.href }, '', newurl.href)
  }

  onVariantChange(e: VariantChangeEvent) {
    const { variant } = e

    this.masterSelect.value = variant?.id.toString() || ''

    this.updateHistoryState(variant)
    this.atcButton.update(variant)
    this.price.update(variant)

    if (variant) {
      this.a11yStatus.text = `Variant changed to ${variant.title}`
    }    

    this.settings.onVariantChange?.(e)
  }


  onFormSubmit(e: SubmitEvent) {
    e.preventDefault()

    if (this.submitInProgress) return

    const submit = this.form.querySelector(selectors.submit) as HTMLButtonElement

    // Disable the button so the user knows the form is being submitted
    submit.disabled = true
    this.submitInProgress = true

    this.onAddStart()

    CartAPI.addItemFromForm(this.form)
      .then(() => {
        this.onAddSuccess()
      })
      .catch((e: Error) => {
        this.onAddFail(e)
      })
      .finally(() => {
        submit.disabled = false
        this.submitInProgress = false
      })
  }   

  onAddStart() {
    this.a11yStatus.text = 'Adding item to cart'
    this.form.setAttribute('aria-busy', toAriaBoolean(true))    
    this.atcButton.onAddStart()
  }

  onAddSuccess() {
    this.a11yStatus.text = 'Item added to cart'
    this.form.removeAttribute('aria-busy')    
    this.atcButton.onAddSuccess()
  }

  onAddFail(e: Error) {
    this.a11yStatus.text = e.message || 'Error adding to cart'
    this.form.removeAttribute('aria-busy')
    this.atcButton.onAddFail(e)
  }  
}