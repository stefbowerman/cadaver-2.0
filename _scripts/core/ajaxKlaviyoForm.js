
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

    if (!this.settings.apiKey) {
      console.log(`[${this.name}] - Valid Klaviyo API Key required to initialize`) // eslint-disable-line no-console
      return false
    }

    if (!this.settings.listId) {
      console.log(`[${this.name}] - Valid Klaviyo List ID required to initialize`) // eslint-disable-line no-console
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
      this.$submit.prop('disabled', true);
      this.isSubmitting = true;

      this.settings.onSubmitStart();

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

    // See: https://developers.klaviyo.com/en/reference/create_client_subscription
    const url = `https://a.klaviyo.com/client/subscriptions/?company_id=${this.settings.apiKey}`
    const data = JSON.stringify({
      data: {
        type: 'subscription',
        attributes: {
          custom_source: this.settings.source,
          profile: {
            data: {
              type: 'profile',
              attributes: {
                email: this.$input.val()
              }
            }
          }
        },
        relationships: {
          list: {
            data: {
              type: 'list',
              id: this.settings.listId
            }
          }
        }
      }
    })
 

    $.ajax({
      async: true,
      crossDomain: true,
      url,
      method: 'POST',
      headers: {
        'revision': '2024-02-15',
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      },
      data,
      beforeSend: this.onBeforeSend.bind(this)
    })
      .done((response, textStatus, jqXHR) => {
        // New Klaviyo API endpoints don't return any info in the response
        const success = textStatus === 'success' || jqXHR.status === 202

        this.onSubmitDone(success);
      })
      .fail((jqXHR, textStatus) => {
        let errors = [];

        if (jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.hasOwnProperty('errors')) {
          errors = jqXHR.responseJSON.errors;
        }

        this.onSubmitFail(errors);
      })
      .always(() => {
        this.isSubmitting = false;
      });

    return false;
  }
}