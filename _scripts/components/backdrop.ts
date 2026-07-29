import { setAriaFlag } from '@/core/utils/a11y'
import BaseComponent from '@/components/base'

const classes = {
  backdrop: 'backdrop'
}

export interface BackdropOptions {
  title?: string
  ariaLabel?: string
  ariaControls?: string
}

interface BackdropSettings extends BackdropOptions {
  title: string
  ariaLabel: string
}

export default class Backdrop extends BaseComponent {
  static TYPE = 'backdrop'

  settings: BackdropSettings

  static generate(parent: Element | undefined, options: BackdropOptions = {}) {
    const el = document.createElement('button')

    el.classList.add(classes.backdrop)
    el.setAttribute('type', 'button')
    el.setAttribute('tabindex', '-1')
    setAriaFlag(el, 'aria-hidden', true)
    el.setAttribute('data-component', Backdrop.TYPE)

    const appendTo = parent || document.body
    appendTo.appendChild(el)

    return new Backdrop(el, options)
  }

  constructor(el: HTMLElement, options: BackdropOptions = {}) {
    super(el)

    this.settings = {
      title: 'Close',
      ariaLabel: 'Close',
      ...options
    }

    el.setAttribute('title', this.settings.title)
    el.setAttribute('aria-label', this.settings.ariaLabel || this.settings.title)

    if (this.settings.ariaControls) {
      el.setAttribute('aria-controls', this.settings.ariaControls)
    }
  }

  destroy() {
    this.el.remove()

    super.destroy()
  }

  show() {
    setAriaFlag(this.el, 'aria-hidden', false)
  }

  hide() {
    setAriaFlag(this.el, 'aria-hidden', true)
  }
}
