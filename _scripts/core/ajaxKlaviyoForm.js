import KlaviyoAPI from './klaviyoAPI'

const noop = () => {};

/**
 * AJAX Klaviyo Library
 * -----------------------------------------------------------------------------
 * Handles AJAX form submission and callback event
 *
 * Usage:
 *
 *   import AJAXKlaviyoForm from './ajaxKlaviyoForm';
 *
 *   const $form = $('form');
 *   const apiKey = $form.data('api-key');
 *   const listId = $form.data('list-id');
 *   const source = $form.data('source');
 *
 *   const options = {
 *     apiKey: apiKey
 *     listId: listId,
 *     source: source,
 *     onSubscribeSuccess: function() { .. },
 *     onSubmitFail: function(){ .. }
 *   };
 *
 *   const ajaxKlaviyoForm = new AJAXKlaviyoForm($form, options);
 *
 * @namespace ajaxKlaviyoForm
 */


/**
 * AJAX Klaviyo Form Constructor
 *
 * @param {HTMLElement | jQuery} form - Form element
 * @param {Object} options
 * @param {String} options.apiKey - Klaviyo Public API Key
 * @param {String} options.listId - Klaviyo List ID
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
  constructor(form, options) {
    this.name = 'ajaxKlaviyoForm';
    this.namespace = `.${this.name}`;
    this.events = {
      SUBMIT: 'submit' + this.namespace
    };

    const defaults = {
      apiKey: null,
      listId: null,
      source: 'Shopify Form',
      onInit: noop,
      onBeforeSend: noop,
      onSubmitStart: noop,
      onSubmitFail: noop,
      onSubscribeSuccess: noop,
      onSubscribeFail: noop
    };

    if (form.length === 0) {
      return false;
    }

    this.$form = form instanceof $ ? form : $(form);
    this.$input = this.$form.find('input[type="email"]');
    this.$submit = this.$form.find('[type="submit"]');
    this.settings = $.extend({}, defaults, options);
    this.isSubmitting = false;

    this.klaviyoAPI = new KlaviyoAPI({ companyId: this.settings.apiKey })

    if (!this.settings.apiKey) {
      console.log(`[${this.name}] - Valid Klaviyo API Key required to initialize`) // eslint-disable-line no-console
      return false
    }

    if (!this.settings.listId) {
      console.log(`[${this.name}] - Valid Klaviyo List ID required to initialize`) // eslint-disable-line no-console
      return false
    }

    if (this.$input.length === 0) {
      console.warn(`[${this.name}] - Email input missing`) // eslint-disable-line no-console
      return false
    }    

    this.$form.on(this.events.SUBMIT, this.onFormSubmit.bind(this));

    this.settings.onInit();
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

    if (this.$input.val() && this.$input.val().length) {
      return true;
    }

    this.$input.parents('.form-group').addClass('alert-info');

    return false;
  }

  onSubmitDone(successful) {
    this.$submit.prop('disabled', false);

    if (successful) {
      this.settings.onSubscribeSuccess();
    }
    else {
      this.settings.onSubscribeFail();
    }
  }

  onSubmitFail(errors) {
    this.$submit.prop('disabled', false);

    this.logErrors(errors);
    this.settings.onSubmitFail(errors);
  }

  onFormSubmit(e) {
    e.preventDefault();

    if (this.onBeforeSend() === false) {
      return false
    }

    const email = this.$input.val()

    // This prop validation should probably be handled in a promise rejection from the KlaviyoAPI...?
    if (!email) {
      console.warn(`[${this.name}] - Email is required`) // eslint-disable-line no-console
      return
    }    

    this.isSubmitting = true;

    this.$submit.prop('disabled', true);

    this.settings.onSubmitStart();

    this.klaviyoAPI.createClientSubscription({
      email,
      source: this.settings.source,
      listId: this.settings.listId
    })
      .then(success => {
        this.onSubmitDone(success)
      })
      .catch(err => {
        console.log('error', err) // eslint-disable-line no-console
      })
      .always(() => {
        this.$submit.prop('disabled', false);

        this.isSubmitting = false
      })

    return false
  }
}