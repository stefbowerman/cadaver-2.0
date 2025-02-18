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

  onNavigateOut() {
    this.mobileMenu.close()
  }
}
