 import BaseSection from './base'

const selectors = {
  loginForm: '#customer-login-form',
  recoverForm: '#recover-password-form',
  toggleRecover: '[data-toggle-recover]'
}

export default class LoginSection extends BaseSection {
  static TYPE = 'login'

  constructor(container) {
    super(container)

    this.loginForm = this.qs(selectors.loginForm)
    this.recoverForm = this.qs(selectors.recoverForm)
    
    this.container.addEventListener('click', this.onClick.bind(this))

    if (window.location.hash == '#recover') {
      this.showRecoverForm()
    }  
  }

  onClick(e) {
    if (e.target.closest(selectors.toggleRecover)) {
      e.target.dataset.toggleRecover === 'true' ? this.showRecoverForm() : this.hideRecoverForm()
    }
  }

  showRecoverForm() {
    this.loginForm.style.display = 'none'
    this.recoverForm.style.display = ''
  }

  hideRecoverForm() {
    this.loginForm.style.display = ''
    this.recoverForm.style.display = 'none'
  }
}
