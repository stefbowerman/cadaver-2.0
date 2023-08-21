import BaseSection from './base'

import NewsletterForm, { selector as newsletterFormSelector }  from '../components/newsletterForm'
import AJAXKlaviyoForm from '../core/ajaxKlaviyoForm'

export default class FooterSection extends BaseSection {
  constructor(container) {
    super(container, 'footer')

    this.$newsletterForm = $(newsletterFormSelector, this.$container)

    if (this.$newsletterForm.length) {
      this.newsletterForm = new NewsletterForm(this.$newsletterForm)

      this.ajaxForm = new AJAXKlaviyoForm(this.$newsletterForm, {
        listId: this.$newsletterForm.data('list-id'),
        source: this.$newsletterForm.data('source'),
        onSubmitStart: () => this.newsletterForm.onSubmitStart(),
        onSubmitFail: errors => this.newsletterForm.onSubmitFail(errors),
        onSubscribeSuccess: response => this.newsletterForm.onSubscribeSuccess(response),
        onSubscribeFail: response => this.newsletterForm.onSubscribeFail(response)
      })
    }    
  }
}
