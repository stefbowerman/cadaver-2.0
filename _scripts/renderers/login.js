import BaseRenderer from './base'

import LoginSection from '../sections/login'

export default class LoginRenderer extends BaseRenderer {
  onEnter() {
    super.onEnter()
    
    this.sectionManager.register('login', LoginSection)
  }
}