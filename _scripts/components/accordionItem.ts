import { getUUID } from '@/core/utils'
import { setAriaState } from '@/core/utils/a11y'
import gsap, { slideDown, slideUp } from '@/core/gsap'

import BaseComponent from '@/components/base'

interface AccordionItemOptions {
  onOpen?: (instance: AccordionItem) => void
  onClose?: (instance: AccordionItem) => void
}

const selectors = {
  header: '[data-header]',
  body: '[data-body]'
}

export default class AccordionItem extends BaseComponent {
  static TYPE = 'accordion-item'

  settings: AccordionItemOptions
  header: HTMLElement
  body: HTMLElement

  #isAnchor: boolean

  constructor(el: HTMLElement, options: AccordionItemOptions = {}) {
    super(el)

    this.settings = {
      ...options
    }

    this.header = this.qsRequired(selectors.header)
    this.body = this.qsRequired(selectors.body)

    this.#isAnchor = this.header instanceof HTMLAnchorElement

    const id = `${AccordionItem.TYPE}-${getUUID()}`

    this.header.id = `${id}-header`
    this.body.id = `${id}-body`

    this.body.setAttribute('aria-labelledby', this.header.id)
    this.body.hidden = true // Default Closed

    if (!this.#isAnchor) {
      this.header.setAttribute('aria-controls', this.body.id)
      setAriaState(this.header, 'aria-expanded', false)
    }

    this.header.addEventListener('click', this.onHeaderClick.bind(this))
  }

  destroy() {
    gsap.killTweensOf(this.body)

    super.destroy()
  }

  get isAnchor() {
    return this.#isAnchor
  }

  get isOpen() {
    return this.header.getAttribute('aria-expanded') === 'true'
  }

  set isOpen(value: boolean) {
    setAriaState(this.header, 'aria-expanded', value)
  }

  open() {
    if (this.isOpen) return
    
    slideDown(this.body, {
      onStart: () => {
        this.isOpen = true
        this.body.hidden = false
      },
      onInterrupt: () => {
        this.isOpen = false
        this.body.hidden = true
      }
    })

    this.settings.onOpen?.(this)
  }

  close() {
    if (!this.isOpen) return
    
    slideUp(this.body, {
      onStart: () => {
        this.isOpen = false
      },
      onInterrupt: () => {
        this.isOpen = true
      },
      onComplete: () => {
        this.body.hidden = true
      }
    })

    this.settings.onClose?.(this)
  }  

  toggle() {
    this.isOpen ? this.close() : this.open()
  }

  onHeaderClick(e: MouseEvent) {
    if (this.#isAnchor) {
      // Anchor headers navigate away and have no expanded state, but should still fire onOpen
      // so a parent can react to the change.
      this.settings.onOpen?.(this)
      return
    }

    e.preventDefault()

    this.toggle()
  }

  // Theme editor events
  onSelfBlockSelect() {
    if (this.#isAnchor) return

    this.open()
  }

  onSelfBlockDeselect() {
    this.close()
  }

  onChildBlockSelect() {
    if (this.#isAnchor) return
    
    this.open()
  }  
}
