import KlaviyoAPI from '@/core/klaviyoAPI'

const noop = () => {}

/**
 * AJAX Klaviyo Form
 * -----------------------------------------------------------------------------
 *
 * Handles AJAX form submission and callback event
 *
 * NOTE: This has not been rigorously tested...
 *
 */
interface AJAXKlaviyoFormSettings {
  source?: string
  onInit?: () => void
  onBeforeSend?: () => boolean | void
  onSubmitStart?: () => void
  onSubmitFail?: (errors: Error[]) => void
  onSubscribeSuccess?: () => void
  onSubscribeFail?: () => void
}

export default class AJAXKlaviyoForm {
  name: string
  settings: AJAXKlaviyoFormSettings
  el: HTMLElement
  form: HTMLFormElement
  input: HTMLInputElement
  submit: HTMLButtonElement
  isSubmitting: boolean

  constructor(el: HTMLElement, options: AJAXKlaviyoFormSettings = {}) {
    this.name = 'ajaxKlaviyoForm'

    this.settings = {
      source: 'Shopify Form',
      onInit: noop,
      onBeforeSend: noop,
      onSubmitStart: noop,
      onSubmitFail: noop,
      onSubscribeSuccess: noop,
      onSubscribeFail: noop,
      ...options
    }

    this.el = el
    this.form = this.el.tagName === 'FORM' ? this.el as HTMLFormElement : this.el.querySelector('form')

    if (!this.form) {
      console.warn(`[${this.name}] - Form element required to initialize`)
      return;
    }

    // Allow the source to be set via the data-source attribute on the form element
    if (this.form.dataset.source) {
      this.setSource(this.form.dataset.source)
    }

    this.input = this.form.querySelector('input[type="email"]')
    this.submit = this.form.querySelector('[type="submit"]')
    this.isSubmitting = false

    if (!this.input) {
      console.warn(`[${this.name}] - Email input missing`)
      return
    }    

    this.onFormSubmit = this.onFormSubmit.bind(this)
    this.form.addEventListener('submit', this.onFormSubmit)

    this.settings.onInit()
  }

  destroy() {
    this.form.removeEventListener('submit', this.onFormSubmit)
  }

  logErrors(errors: Error[]) {
    if (Array.isArray(errors) && errors.length) {
      for (let i = errors.length - 1; i >= 0; i--) {
        console.warn(`[${this.name}] - onSubmitFail error: ${errors[i].message}`);
      }
    }
  }

  setSource(source = '') {
    this.settings.source = source
  }

  onBeforeSend() {
    if (this.settings.onBeforeSend() === false) {
      return false;
    }

    if (this.input.value && this.input.value.length) {
      return true
    }

    return false;
  }

  onSubmitSuccess() {
    this.settings.onSubscribeSuccess?.()
  }

  onSubmitFail(errors: Error[]) {
    this.submit.removeAttribute('disabled')

    this.logErrors(errors)
    this.settings.onSubmitFail(errors)
  }

  async onFormSubmit(e: SubmitEvent) {
    e.preventDefault()

    if (this.isSubmitting || this.onBeforeSend() === false) {
      return false
    }

    const email = this.input.value

    // This prop validation should probably be handled in a promise rejection from the KlaviyoAPI...?
    if (!email) {
      console.warn(`[${this.name}] - Email is required`)
      return
    }    

    try {
      this.isSubmitting = true;

      this.submit.setAttribute('disabled', 'true')
      this.settings.onSubmitStart()

      const success = await KlaviyoAPI.createClientSubscription({
        email,
        source: this.settings.source
      })

      if (success) {
        this.onSubmitSuccess()
      }
      else {
        this.onSubmitFail([
          new Error('Failed to subscribe to newsletter')
        ])
      }
    }
    catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e))
      this.onSubmitFail([error])
    }
    finally {
      this.submit.removeAttribute('disabled')

      this.isSubmitting = false
    }

    return false
  }
}