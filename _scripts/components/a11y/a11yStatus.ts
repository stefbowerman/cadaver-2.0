import BaseComponent from '@/components/base'

export default class A11yStatus extends BaseComponent {
  static TYPE = 'a11y-status'

  static generate(parent: HTMLElement): A11yStatus {
    const el = document.createElement('div')
    el.setAttribute('role', 'status')
    el.setAttribute('aria-live', 'polite')
    el.setAttribute('aria-atomic', 'true')
    el.setAttribute('data-component', A11yStatus.TYPE)
    el.classList.add('sr-only')

    parent.appendChild(el)

    return new A11yStatus(el)
  }

  #timeoutId: ReturnType<typeof setTimeout> | undefined

  // Clear first and set after a short delay so screen readers announce repeated identical messages
  set text(text: string) {
    clearTimeout(this.#timeoutId)

    this.el.textContent = ''

    this.#timeoutId = setTimeout(() => {
      this.el.textContent = text
    }, 100)
  }

  destroy() {
    clearTimeout(this.#timeoutId)

    super.destroy()
  }
}