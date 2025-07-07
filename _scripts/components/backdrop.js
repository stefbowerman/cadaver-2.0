import BaseComponent from './base'
import { toAriaBoolean } from '../core/utils/a11y'

const classes = {
  backdrop: 'backdrop',
  open: 'is-open'
}

export default class Backdrop extends BaseComponent {
  static TYPE = 'backdrop'

  static generate(parent, options = {}) {
    const el = document.createElement('button')
    
    const settings = {
      title: 'Close',
      ariaLabel: 'Close',
      ariaControls: null,
      ariaExpanded: false,
      ...options
    }

    el.classList.add(classes.backdrop)
    el.setAttribute('type', 'button')
    el.setAttribute('title', settings.title)
    el.setAttribute('aria-label', settings.ariaLabel)
    el.setAttribute('aria-expanded', toAriaBoolean(!!settings.ariaExpanded))
    
    if (settings.ariaControls) {
      el.setAttribute('aria-controls', settings.ariaControls)
    }

    el.setAttribute('data-component', Backdrop.TYPE)

    const appendTo = parent || document.body
    appendTo.appendChild(el)

    return new Backdrop(el)
  }

  constructor(el) {
    super(el)
  }

  destroy() {
    this.el.remove()

    super.destroy()
  }

  show() {
    this.el.classList.add(classes.open)
    this.el.setAttribute('aria-hidden', toAriaBoolean(false))
  }

  hide() {
    this.el.classList.remove(classes.open)
    this.el.setAttribute('aria-hidden', toAriaBoolean(true))
  }
}