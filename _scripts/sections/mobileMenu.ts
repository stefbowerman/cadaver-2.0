import { setAriaCurrent } from '@/core/utils/a11y'
import type { TaxiNavigateInEvent } from '@/types/taxi'

import BaseSection from '@/sections/base'
import MobileMenuDrawer from '@/components/drawer/mobileMenuDrawer'

export default class MobileMenuSection extends BaseSection {
  static TYPE = 'mobile-menu'

  drawer: MobileMenuDrawer

  constructor(container: HTMLElement) {
    super(container)

    this.drawer = new MobileMenuDrawer(this.qs(MobileMenuDrawer.SELECTOR))
  }

  onSectionSelect() {
    this.drawer.open()
  }

  onSectionDeselect() {
    this.drawer.close()
  }

  onNavigateIn(e: TaxiNavigateInEvent) {
    const currentPath = new URL(e.detail.to.finalUrl).pathname
    const links = this.drawer.el.querySelectorAll<HTMLAnchorElement>('nav a')

    links.forEach((link: HTMLAnchorElement) => setAriaCurrent(link, currentPath))
  }

  onNavigateOut() {
    this.drawer.close()
  }
}
