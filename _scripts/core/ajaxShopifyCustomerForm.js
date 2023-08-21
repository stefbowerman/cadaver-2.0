const name = 'ajaxShopifyCustomerForm'
const namespace = `.${name}`

const selectors = {
  errors: '[data-errors]',
  success: '[data-success]'
}

export const events = {
  SUBMIT: 'submit' + namespace
}

export default class AJAXShopifyCustomerForm {
  constructor(form, options = {}) {
    this.name = name
    this.namespace = namespace
    this.events = events

    const defaults = {
      onInit: () => {},
      onDestroy: () => {},
      onBeforeSend: () => {},
      onSubmitFail: response => {},
      onSubscribeSuccess: message => {},
      onSubscribeFail: message => {}
    }

    if (!form || form.length == 0) {
      return
    }

    this.$form = $(form)
    this.$input   = this.$form.find('input[type="email"]');
    this.$submit  = this.$form.find('[type="submit"]');
    this.settings = { ...defaults, ...options }

    if(this.$input.attr('name') !== "contact[email]") {
      console.warn('['+this.name+'] - Email input *must* have attribute [name="contact[email]"]');
    }

    this.$form.on(this.events.SUBMIT, this.onFormSubmit.bind(this));

    this.settings.onInit();

    return this;    
  }

  onBeforeSend() {
    if(this.settings.onBeforeSend() == false) {
      return false
    }

    if (this.$input.val() && this.$input.val().length) {
      this.$submit.prop('disabled', true);
      return true
    }

    return false
  }  

  onSubmitDone(responseHtml) {
    const $dom = $(responseHtml)
    const $responseForm = $dom.find(`#${this.$form.attr('id')}`)
    const $errors = $responseForm.find(selectors.errors)
    const $success = $responseForm.find(selectors.success)

    const message = $errors.length ? $errors.text() : ($success.text() || 'Thank you for subscribing')
    const cb = $errors.length ? this.onSubscribeFail : this.settings.onSubscribeSuccess

    this.$submit.prop('disabled', false)
    cb(message)
  }

  onSubmitFail() {
    this.settings.onSubmitFail()
  }  

  onFormSubmit(e) {
    e.preventDefault()
    
    const data = this.$form.serialize()
  
    $.ajax({
        url: this.$form.attr('action'),
        type: 'POST',
        data,
        beforeSend: this.onBeforeSend.bind(this)
      })
      .done(responseHtml => this.onSubmitDone(responseHtml))
      .fail(responseHtml => this.onSubmitFail(responseHtml))

    return false
  }
}