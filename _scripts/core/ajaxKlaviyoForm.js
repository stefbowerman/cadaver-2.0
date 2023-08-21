
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
 *   const listId = $form.data('list-id');
 *   const source = $form.data('source');
 *
 *   const options = {
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

  onSubmitDone(response) {
    this.$submit.prop('disabled', false);

    if (response.success) {
      this.settings.onSubscribeSuccess(response);
    }
    else {
      this.logErrors(response.errors);
      this.settings.onSubscribeFail(response);
    }
  }

  onSubmitFail(errors) {
    this.$submit.prop('disabled', false);

    this.logErrors(errors);
    this.settings.onSubmitFail(errors);
  }

  onFormSubmit(e) {
    e.preventDefault();

    $.ajax({
      async: true,
      crossDomain: true,
      url: '//manage.kmail-lists.com/ajax/subscriptions/subscribe',
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache'
      },
      data: {
        g: this.settings.listId,
        $fields: '$source',
        email: this.$input.val(),
        $source: this.settings.source
      },
      beforeSend: this.onBeforeSend.bind(this)
    })
      .done((response) => {
        this.onSubmitDone(response);
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