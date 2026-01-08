import BaseComponent from '@/components/base'

const selectors = {
  form: 'form',
  formContents: '[data-form-contents]',
  formMessage: '[data-form-message]' // needs data-success, data-already-subscribed, data-fail
};

const classes = {
  showContents: 'show-contents',
  showMessage: 'show-message'
};

export default class NewsletterForm extends BaseComponent {
  static TYPE = 'newsletter-form'

  timeoutId: ReturnType<typeof setTimeout> | null
  form: HTMLFormElement
  formInput: HTMLInputElement
  formContents: HTMLElement
  formMessage: HTMLElement

  /**
   * NewsletterForm constructor
   */  
  constructor(el: HTMLElement) {
    super(el)

    this.timeoutId = null

    this.form = this.el.tagName === 'FORM' ? this.el as HTMLFormElement : this.qs(selectors.form) as HTMLFormElement
    
    if (!this.form) {
      console.warn(`[${this.type}] - Form element required to initialize`)
      return
    }

    this.formInput = this.form.querySelector('input[type="email"]')
    this.formContents = this.form.querySelector(selectors.formContents)
    this.formMessage = this.form.querySelector(selectors.formMessage)
  }

  destroy() {
    window.clearTimeout(this.timeoutId)

    super.destroy()
  }

  /**
   * Temporarily shows the form message
   *
   * @param message - The message to show
   * @param reset - If true, will call this.reset when finished
   */  
  showMessageWithTimeout(message: string, reset: boolean = false) {
    this.formMessage.innerHTML = message
    this.formContents.classList.add(classes.showMessage)

    window.clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(function() {
      if (reset) {
        this.reset();
      } 

      this.formContents.classList.remove(classes.showMessage)
    }.bind(this), 3000);    
  }

  showFormContents() {
    this.form.classList.add(classes.showContents)

    setTimeout(() => {
      this.focusInput();
    }, 100)
  }

  hideFormContents() {
    this.form.classList.remove(classes.showContents)
  }

  // Allow external components to focus the input
  focusInput() {
    this.formInput.focus()
  }

  /**
   * Resets everything to it's initial state.  Only call when form content isn't visible
   */
  reset() {
    this.formInput.value = ''
    this.formInput.dispatchEvent(new Event('change'))
  }

  onSubscribeSuccess() {
    // NOTE: This is commented out because Klaviyo no longer returns information about whether the email is already subscribed

    
    // const isSubscribed = response && response.data && response.data.is_subscribed;
    // const msgKey = isSubscribed ? 'alreadySubscribed' : 'success';

    // Don't reset the form if they're already subscribed, they might want to just enter a different email
    // const reset = !isSubscribed;
    
    // this.showMessageWithTimeout(this.formMessage.dataset[msgKey], reset);

    this.showMessageWithTimeout(this.formMessage.dataset.success, true);
  }

  onSubmitStart() {
    this.showMessageWithTimeout('Submitting...', false);
  }  

  onSubmitFail(errors: Error[] | string) {
    const msg = Array.isArray(errors) ? errors.join('  ') : errors;
    this.showMessageWithTimeout(msg, false);
  }

  onSubscribeFail() {
    this.showMessageWithTimeout(this.formMessage.dataset.fail, false);
  }
}