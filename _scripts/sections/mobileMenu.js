import { setAriaCurrent } from '@/core/utils/a11y'

import BaseSection from '@/sections/base'
import MobileMenuDrawer from '@/components/drawer/mobileMenuDrawer'

export default class MobileMenuSection extends BaseSection {
  static TYPE = 'mobile-menu'

  constructor(container) {
    super(container)

    this.drawer = new MobileMenuDrawer(this.qs(MobileMenuDrawer.SELECTOR))
  }

  onSectionSelect() {
    this.drawer.open()
  }

  onSectionDeselect() {
    this.drawer.close()
  }

  onNavigateIn(e) {
    const currentPath = new URL(e.detail.to.finalUrl).pathname

    this.drawer.el.querySelectorAll('nav a').forEach(link => setAriaCurrent(link, currentPath))
  }

  onNavigateOut() {
    this.drawer.close()
  }
}
