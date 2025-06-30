import { setAriaCurrent } from '../core/utils/a11y'

import BaseSection from './base'
import MobileMenu from '../components/mobileMenu'

export default class MobileMenuSection extends BaseSection {
  static TYPE = 'mobile-menu'

  constructor(container) {
    super(container)

    this.mobileMenu = new MobileMenu(this.qs(MobileMenu.SELECTOR))
  }

  onSectionSelect() {
    this.mobileMenu.open()
  }

  onSectionDeselect() {
    this.mobileMenu.close()
  }

  onNavigateIn(e) {
    const currentPath = new URL(e.detail.to.finalUrl).pathname

    this.mobileMenu.el.querySelectorAll('nav a').forEach(link => setAriaCurrent(link, currentPath))
  }

  onNavigateOut() {
    this.mobileMenu.close()
  }
}
