import BaseRenderer from './base'

export default class CartRenderer extends BaseRenderer {
  initialLoad() {
    this.redirect()
  }

  onEnterCompleted() {
    this.redirect()
  }

  redirect() {
    const url = '/?cart'

    setTimeout(() => {
      window.app?.taxi ? app.taxi.navigateTo(url) : (window.location = url)
    }, 50)
  }
}