import BaseRenderer from './base'

import AddressesSection from '../sections/addresses'

export default class AddressesRenderer extends BaseRenderer {
  onEnter() {
    super.onEnter()
    
    this.sectionManager.register('addresses', AddressesSection)
  }
}