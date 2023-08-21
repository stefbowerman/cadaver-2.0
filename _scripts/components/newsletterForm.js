export const selector = '[data-newsletter-form]'

const selectors = {
  form: 'form',
  formContents: '[data-form-contents]',
  formMessage: '[data-form-message]' // needs data-success, data-already-subscribed, data-fail
};

const classes = {
  showContents: 'show-contents',
  showMessage: 'show-message'
};

export default class NewsletterForm {
  /**
   * NewsletterForm constructor
   *
   * @param {HTMLElement} el - Element used for scoping any element selection.  Can either be a containing element or the form element itself
   */  
  constructor(el) {
    this.name = 'newsletterForm';

    this.timeout = null;

    this.$el = $(el);
    this.$form = this.$el.is(selectors.form) ? this.$el : this.$el.find(selectors.form);
    this.$formInput = $('input[type="email"]', this.$el);
    
    if (!this.$form.length) {
      console.warn(`[${this.name}] - Form element required to initialize`);
      return;
    }

    this.$formContents = $(selectors.formContents, this.$el);
    this.$formMessage  = $(selectors.formMessage, this.$el);
  }

  /**
   * Temporarily shows the form message
   *
   * @param {Boolean} reset - If true, will call this.reset when finished
   */  
  showMessageWithTimeout(message, reset = false) {
    this.$formMessage.html(message);
    this.$formContents.addClass(classes.showMessage);

    window.clearTimeout(this.timeout);

    this.timeout = setTimeout(function() {
      if (reset) {
        this.reset();
      } 

      this.$formContents.removeClass(classes.showMessage);
    }.bind(this), 3000);    
  }

  showFormContents() {
    this.$form.addClass(classes.showContents);

    setTimeout(() => {
      this.focusInput();
    }, 100)
  }

  hideFormContents() {
    this.$form.removeClass(classes.showContents);
  }

  // Allow external components to focus the input
  focusInput() {
    this.$formInput.focus();
  }

  /**
   * Resets everything to it's initial state.  Only call when form content isn't visible
   */
  reset() {
    this.$formInput.val('');
    this.$formInput.trigger('change');
  }

  onSubscribeSuccess(response) {
    const isSubscribed = response && response.data && response.data.is_subscribed;
    const msgKey = isSubscribed ? 'already-subscribed' : 'success';

    // Don't reset the form if they're already subscribed, they might want to just enter a different email
    const reset = !isSubscribed;
    
    this.showMessageWithTimeout(this.$formMessage.data(msgKey), reset);
  }

  onSubmitStart() {
    this.showMessageWithTimeout('Submitting...', false);
  }  

  onSubmitFail(errors) {
    const msg = Array.isArray(errors) ? errors.join('  ') : errors;
    this.showMessageWithTimeout(msg, false);
  }

  onSubscribeFail() {
    this.showMessageWithTimeout(this.$formMessage.data('fail'), false);
  }
}