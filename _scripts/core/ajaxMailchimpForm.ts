import MailchimpAPI from '@/core/mailchimpAPI'

/**
 * AJAX Mailchimp Form
 * -----------------------------------------------------------------------------
 *
 * Handles AJAX form submission and client subscription via the Mailchimp API
 *
 */
interface AJAXMailchimpFormSettings {
  onInit?: () => void
  onBeforeSend?: () => boolean | void
  onSubmitStart?: () => void
  onSubmitFail?: (errors: Error[]) => void
  onSubscribeSuccess?: () => void
  onSubscribeFail?: () => void
}

export default class AJAXMailchimpForm {
  settings: AJAXMailchimpFormSettings
  el: HTMLElement
  form: HTMLFormElement
  input: HTMLInputElement
  submit: HTMLButtonElement
  #isSubmitting: boolean

  constructor(el: HTMLElement, options: AJAXMailchimpFormSettings = {}) {
    this.settings = {
      ...options
    }

    this.el = el
    this.#isSubmitting = false

    const form = this.el.tagName === 'FORM' ? this.el as HTMLFormElement : this.el.querySelector('form')

    if (!form) {
      throw new Error('Form element required to initialize')
    }

    this.form = form

    const input = this.form.querySelector('input[type="email"]') as HTMLInputElement | null
    const submit = this.form.querySelector('[type="submit"]') as HTMLButtonElement | null

    if (!(input && submit)) {
      throw new Error('Email input and submit button required to initialize')
    }

    this.input = input
    this.submit = submit

    this.onFormSubmit = this.onFormSubmit.bind(this)
    this.form.addEventListener('submit', this.onFormSubmit)

    this.settings.onInit?.()
  }

  destroy() {
    this.form.removeEventListener('submit', this.onFormSubmit)
  }

  logErrors(errors: Error[]) {
    if (Array.isArray(errors) && errors.length) {
      for (let i = errors.length - 1; i >= 0; i--) {
        console.warn(`onSubmitFail error: ${errors[i].message}`);
      }
    }
  }

  onBeforeSend() {
    if (this.settings.onBeforeSend?.() === false) {
      return false;
    }

    if (this.input.value && this.input.value.length) {
      return true
    }

    return false;
  }

  onSubscribeSuccess() {
    this.settings.onSubscribeSuccess?.()
  }

  onSubscribeFail(errors: Error[]) {
    this.logErrors(errors)
    this.settings.onSubscribeFail?.()
  }

  // This is when something goes wrong with the form submissions / network request, not the subscription itself
  onSubmitFail(errors: Error[]) {
    this.logErrors(errors)
    this.settings.onSubmitFail?.(errors)
  }

  async onFormSubmit(e: SubmitEvent) {
    e.preventDefault()

    if (this.#isSubmitting || this.onBeforeSend() === false) {
      return false
    }

    const formData = new FormData(this.form)
    const email = formData.get('email')?.toString() ?? ''

    if (!email) {
      console.warn('Email is required')
      return
    }

    const fields: Record<string, string> = {}

    for (const [key, value] of formData.entries()) {
      if (key !== 'email' && typeof value === 'string' && value) {
        fields[key] = value
      }
    }

    try {
      this.#isSubmitting = true;

      this.submit.disabled = true
      this.settings.onSubmitStart?.()

      const result = await MailchimpAPI.subscribe(email, fields)

      if (result.success) {
        this.onSubscribeSuccess()
      }
      else {
        this.onSubscribeFail([
          new Error(result.message ?? 'Subscription failed')
        ])
      }
    }
    catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e))
      this.onSubmitFail([error])
    }
    finally {
      this.submit.disabled = false

      this.#isSubmitting = false
    }

    return false
  }
}
