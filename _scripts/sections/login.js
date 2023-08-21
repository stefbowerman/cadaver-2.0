 import BaseSection from './base'

const selectors = {
  loginForm: '#customer-login-form',
  recoverForm: '#recover-password-form',

  hideRecoverForm: '[data-hide-recover]',
  showRecoverForm: '[data-show-recover]'
}

export default class LoginSection extends BaseSection {
  constructor(container) {
    super(container, 'login')

    this.resetSuccess = this.$container.data('reset-success')

    this.$loginForm = $(selectors.loginForm, this.$container)
    this.$recoverForm = $(selectors.recoverForm, this.$container)

    this.$container.on('click', selectors.hideRecoverForm, (e) => {
      e.preventDefault()
      this.hideRecoverForm()
    })

    this.$container.on('click', selectors.showRecoverForm, (e) => {
      e.preventDefault()
      this.showRecoverForm()
    })

    if (window.location.hash == '#recover') {
      this.showRecoverForm()
    }  

    if (this.resetSuccess) {
      document.getElementById('reset-success').style.display = 'block'
    }
  }

  showRecoverForm() {
    this.$loginForm.hide()
    this.$recoverForm.show()
  }

  hideRecoverForm() {
    this.$loginForm.show()
    this.$recoverForm.hide()
  }
}
