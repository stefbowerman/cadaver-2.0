import KlaviyoAPI from './klaviyoAPI'

const noop = () => {}

/**
 * AJAX Klaviyo Form
 * -----------------------------------------------------------------------------
 *
 * Handles AJAX form submission and callback event
 *
 * NOTE: This has not been rigorously tested yet...
 *
 */


/**
 * AJAX Klaviyo Form Constructor
 *
 * @param {HTMLElement} form - Form element
 * @param {Object} options
 * @param {String} options.source - Klaviyo custom $source property
 * @param {Function} options.onInit
 * @param {Function} options.onBeforeSend - Prevent AJAX submission by returning false here
 * @param {Function} options.onSubmitStart - Triggered once the AJAX request kicks off
 * @param {Function} options.onSubmitFail  
 * @param {Function} options.onSubscribeSuccess
 * @param {Function} options.onSubscribeFail
 * @return {self}
 */
export default class AJAXKlaviyoForm {
  constructor(el, options) {
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
    this.form = this.el.tagName === 'FORM' ? this.el : this.el.querySelector('form')

    if (!this.form) {
      console.warn(`[${this.name}] - Form element required to initialize`)
      return;
    }

    this.input = this.form.querySelector('input[type="email"]')
    this.submit = this.form.querySelector('[type="submit"]')
    this.isSubmitting = false

    if (!this.input === 0) {
      console.warn(`[${this.name}] - Email input missing`) // eslint-disable-line no-console
      return false
    }    

    this.form.addEventListener('submit', this.onFormSubmit.bind(this))

    this.settings.onInit()
  }

  logErrors(errors) {
    if (Array.isArray(errors) && errors.length) {
      for (let i = errors.length - 1; i >= 0; i--) {
        console.warn(`[${this.name}] - onSubmitFail error: ${errors[i]}`);
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

  onSubmitFail(errors) {
    this.submit.removeAttribute('disabled')

    this.logErrors(errors)
    this.settings.onSubmitFail(errors)
  }

  async onFormSubmit(e) {
    e.preventDefault()

    if (this.isSubmitting || this.onBeforeSend() === false) {
      return false
    }

    const email = this.input.value

    // This prop validation should probably be handled in a promise rejection from the KlaviyoAPI...?
    if (!email) {
      console.warn(`[${this.name}] - Email is required`) // eslint-disable-line no-console
      return
    }    

    try {
      this.isSubmitting = true;

      this.submit.setAttribute('disabled', true)
      this.settings.onSubmitStart()

      const success = await KlaviyoAPI.createClientSubscription({
        email,
        source: this.settings.source
      })

      success ? this.onSubmitSuccess() : this.onSubmitFail()
    }
    catch (e) {
      console.log('error', e) // eslint-disable-line no-console
    }
    finally {
      this.submit.removeAttribute('disabled')

      this.isSubmitting = false
    }

    return false
  }
}