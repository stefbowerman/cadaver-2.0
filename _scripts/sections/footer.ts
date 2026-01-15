import { setAriaCurrent } from '@/core/utils/a11y'
import type { TaxiNavigateInEvent } from '@/types/taxi'
import { ThemeEditorSectionUnloadEvent } from '@/types/shopify'
import AJAXKlaviyoForm from '@/core/ajaxKlaviyoForm'

import BaseSection from '@/sections/base'

import NewsletterForm from '@/components/newsletterForm'

const selectors = {
  // 
}

export default class FooterSection extends BaseSection {
  static TYPE = 'footer'

  newsletterFormEl: HTMLElement
  newsletterForm: NewsletterForm | null
  ajaxForm: AJAXKlaviyoForm | null

  constructor(container: HTMLElement) {
    super(container)

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

  onUnload(e: ThemeEditorSectionUnloadEvent) {
    this.newsletterForm?.destroy()
    this.ajaxForm?.destroy()

    super.onUnload(e)
  }

  onNavigateIn(e: TaxiNavigateInEvent) {
    const currentPath = new URL(e.detail.to.finalUrl).pathname
    const links = this.container.querySelectorAll<HTMLAnchorElement>('a')

    links.forEach(link => setAriaCurrent(link, currentPath))
  }  
}