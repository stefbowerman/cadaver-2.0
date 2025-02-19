import BaseComponent from '../base'

const selectors = {
  input: 'input[name="q"]',
  icon: '[data-icon]'
}

export default class SearchInline extends BaseComponent {
  static TYPE = 'search-inline'

  constructor(el, options = {}) {
    super(el)

    this.settings = {
      onSubmit: e => {},
      onKeyup: e => {},
      ...options
    }

    if (this.el.tagName !== 'FORM') {
      console.warn('SearchInline: Form element required')
      return
    }

    this.input = this.el.querySelector(selectors.input)
    this.icon = this.el.querySelector(selectors.icon)
    this.action = this.el.getAttribute('action')

    this.onSubmit = this.onSubmit.bind(this)
    this.onKeyup = this.onKeyup.bind(this)

    this.el.addEventListener('submit', this.onSubmit)
    this.input.addEventListener('keyup', this.onKeyup)
  }

  reset() {
    this.input.value = ''
  }

  onSubmit(e) {
    if (!window.app.taxi) {
      return
    }

    e.preventDefault()

    const data = new FormData(this.el)

    const q = data.get('q')
    const type = data.get('type') || 'product'

    window.app.taxi.navigateTo(`${this.action}?type=${type}&q=${q}`)

    this.settings.onSubmit(e)

    return false
  }


  onKeyup(e) {
    this.settings.onKeyup(e)
  }
}
