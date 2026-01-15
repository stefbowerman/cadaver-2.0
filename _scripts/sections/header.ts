import { setAriaCurrent } from '@/core/utils/a11y'
import type { TaxiNavigateInEvent } from '@/types/taxi'

import BaseSection from '@/sections/base'
import HeaderCartControl from '@/components/header/headerCartControl'

const selectors = {
  // 
}

export default class HeaderSection extends BaseSection {
  static TYPE = 'header'

  headerCartControl: HeaderCartControl

  constructor(container: HTMLElement) {
    super(container)

    this.headerCartControl = new HeaderCartControl(this.qs(HeaderCartControl.SELECTOR))
  }

  onNavigateIn(e: TaxiNavigateInEvent) {
    const currentPath = new URL(e.detail.to.finalUrl).pathname
    const links = this.container.querySelectorAll<HTMLAnchorElement>('nav a')

    links.forEach(link => setAriaCurrent(link, currentPath))
  }  
}
