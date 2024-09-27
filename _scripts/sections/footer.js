import BaseSection from './base'

import NewsletterForm from '../components/newsletterForm'
import AJAXKlaviyoForm from '../core/ajaxKlaviyoForm'

export default class FooterSection extends BaseSection {
  static TYPE = 'footer'

  constructor(container) {
    super(container, 'footer')

    this.$newsletterForm = $(NewsletterForm.selector, this.$container)

    if (this.$newsletterForm.length) {
      this.newsletterForm = new NewsletterForm(this.$newsletterForm)

      this.ajaxForm = new AJAXKlaviyoForm(this.$newsletterForm, {
        apiKey: this.$newsletterForm.data('api-key'),
        listId: this.$newsletterForm.data('list-id'),
        source: this.$newsletterForm.data('source'),
        onSubmitStart: () => this.newsletterForm.onSubmitStart(),
        onSubmitFail: errors => this.newsletterForm.onSubmitFail(errors),
        onSubscribeSuccess: () => this.newsletterForm.onSubscribeSuccess(),
        onSubscribeFail: () => this.newsletterForm.onSubscribeFail()
      })
    }    
  }
}
