import { setAriaCurrent } from '@/core/utils/a11y'
import type { TaxiNavigateInEvent } from '@/types/taxi'

import BaseSection from '@/sections/base'
import HeaderCartControl from '@/components/header/headerCartControl'

const selectors = {
  primaryNav: '[data-primary-nav]'
}

export default class HeaderSection extends BaseSection {
  static TYPE = 'header'

  primaryNav: HTMLElement
  primaryNavLinks: NodeListOf<HTMLAnchorElement>
  headerCartControl: HeaderCartControl

  constructor(container: HTMLElement) {
    super(container)

    this.primaryNav = this.qs(selectors.primaryNav)
    this.primaryNavLinks = this.primaryNav.querySelectorAll('a')    

    this.headerCartControl = new HeaderCartControl(this.qs(HeaderCartControl.SELECTOR))
  }

  onNavigateIn(e: TaxiNavigateInEvent) {
    const currentPath = new URL(e.detail.to.finalUrl).pathname

    this.primaryNavLinks.forEach(link => setAriaCurrent(link, currentPath))
  }  
}
