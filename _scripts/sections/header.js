import BaseSection from './base'
import HeaderCartControl from '../components/header/headerCartControl'

export default class HeaderSection extends BaseSection {
  static TYPE = 'header'

  constructor(container) {
    super(container)

    this.headerCartControl = new HeaderCartControl(container.querySelector(HeaderCartControl.SELECTOR))
  }
}
