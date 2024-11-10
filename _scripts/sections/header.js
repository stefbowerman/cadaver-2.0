import { setAriaCurrent } from '../core/utils/a11y'

import BaseSection from './base'
import HeaderCartControl from '../components/header/headerCartControl'

const selectors = {
  primaryNav: '[data-primary-nav]'
}

export default class HeaderSection extends BaseSection {
  static TYPE = 'header'

  constructor(container) {
    super(container)

    this.primaryNav = this.qs(selectors.primaryNav)
    this.primaryNavLinks = this.primaryNav.querySelectorAll('a')    

    this.headerCartControl = new HeaderCartControl(this.qs(HeaderCartControl.SELECTOR))
  }

  onNavigateIn(e) {
    const currentPath = new URL(e.detail.to.finalUrl).pathname

    this.primaryNavLinks.forEach(link => setAriaCurrent(link, currentPath))
  }  
}
