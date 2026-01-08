import { setAriaCurrent } from '@/core/utils/a11y'
import type { TaxiNavigateInEvent } from '@/types/taxi'
import AJAXKlaviyoForm from '@/core/ajaxKlaviyoForm'

import BaseSection from '@/sections/base'

import NewsletterForm from '@/components/newsletterForm'

const selectors = {
  navLink: 'nav a'
}

export default class FooterSection extends BaseSection {
  static TYPE = 'footer'

  navLinks: HTMLAnchorElement[]
  newsletterFormEl: HTMLElement
  newsletterForm: NewsletterForm | null
  ajaxForm: AJAXKlaviyoForm | null

  constructor(container: HTMLElement) {
    super(container)

    this.navLinks = this.qsa(selectors.navLink) as HTMLAnchorElement[]

    this.newsletterFormEl = this.qs(NewsletterForm.SELECTOR)
    this.newsletterForm = null
    this.ajaxForm = null

    if (this.newsletterFormEl) {
      this.newsletterForm = new NewsletterForm(this.newsletterFormEl)

      this.ajaxForm = new AJAXKlaviyoForm(this.newsletterFormEl, {
        onSubmitStart: () => this.newsletterForm.onSubmitStart(),
        onSubmitFail: errors => this.newsletterForm.onSubmitFail(errors),
        onSubscribeSuccess: () => this.newsletterForm.onSubscribeSuccess(),
        onSubscribeFail: () => this.newsletterForm.onSubscribeFail()
      })
    }
  }

  onUnload() {
    this.newsletterForm?.destroy()
    this.ajaxForm?.destroy()
  }

  onNavigateIn(e: TaxiNavigateInEvent) {
    const currentPath = new URL(e.detail.to.finalUrl).pathname

    this.navLinks.forEach(link => setAriaCurrent(link, currentPath))
  }  
}
