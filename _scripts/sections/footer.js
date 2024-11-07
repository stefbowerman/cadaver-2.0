import BaseSection from './base'

import NewsletterForm from '../components/newsletterForm'
import AJAXKlaviyoForm from '../core/ajaxKlaviyoForm'

export default class FooterSection extends BaseSection {
  static TYPE = 'footer'

  constructor(container) {
    super(container)

    this.newsletterFormEl = this.container.querySelector(NewsletterForm.SELECTOR)
    this.newsletterForm = null
    this.ajaxForm = null

    if (this.newsletterFormEl) {
      this.newsletterForm = new NewsletterForm(this.newsletterFormEl)

      this.ajaxForm = new AJAXKlaviyoForm(this.newsletterFormEl, {
        source: this.newsletterFormEl.dataset.source,
        onSubmitStart: () => this.newsletterForm.onSubmitStart(),
        onSubmitFail: errors => this.newsletterForm.onSubmitFail(errors),
        onSubscribeSuccess: () => this.newsletterForm.onSubscribeSuccess(),
        onSubscribeFail: () => this.newsletterForm.onSubscribeFail()
      })
    }
  }

  onUnload() {
    this.newsletterForm?.destroy()
  }
}
