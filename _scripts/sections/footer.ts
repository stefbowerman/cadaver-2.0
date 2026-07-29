import type { TaxiNavigateInEvent } from '@/types/taxi'
import type { ThemeEditorSectionUnloadEvent } from '@/types/shopify'
import { setLinkAriaCurrent } from '@/core/utils/a11y'
import AJAXKlaviyoForm from '@/core/ajaxKlaviyoForm'

import BaseSection from '@/sections/base'

import NewsletterForm from '@/components/newsletterForm'

export default class FooterSection extends BaseSection {
  static TYPE = 'footer'

  newsletterFormEl: HTMLElement | null
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
        onSubmitStart: () => this.newsletterForm?.onSubmitStart(),
        onSubmitFail: errors => this.newsletterForm?.onSubmitFail(errors),
        onSubscribeSuccess: () => this.newsletterForm?.onSubscribeSuccess(),
        onSubscribeFail: () => this.newsletterForm?.onSubscribeFail()
      })
    }
  }

  onUnload(e: ThemeEditorSectionUnloadEvent) {
    this.ajaxForm?.destroy() // AJAXKlaviyoForm is not a BaseComponent, so doComponentCleanup won't catch it

    super.onUnload(e)
  }

  onNavigateIn(e: TaxiNavigateInEvent) {
    const currentPath = new URL(e.detail.to.finalUrl).pathname
    const links = this.container.querySelectorAll<HTMLAnchorElement>('a')

    links.forEach(link => setLinkAriaCurrent(link, currentPath))
  }  
}