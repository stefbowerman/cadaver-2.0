import BaseComponent from '@/components/base'

export default class A11yStatus extends BaseComponent {
  static TYPE = 'a11y-status'

  static generate(parent) {
    if (!parent) {
      console.warn('A11yStatus: No parent element provided')
      return
    }

    const el = document.createElement('div')
    el.setAttribute('role', 'status')
    el.setAttribute('aria-live', 'polite')
    el.setAttribute('aria-atomic', 'true')
    el.setAttribute('aria-hidden', 'true')
    el.setAttribute('data-component', A11yStatus.TYPE)
    el.classList.add('sr-only')

    parent.appendChild(el)

    return new A11yStatus(el)
  }

  constructor(el) {
    super(el)
  }

  set text(text) {
    this.el.textContent = text
  }
}