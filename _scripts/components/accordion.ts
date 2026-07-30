import BaseComponent from '@/components/base'
import AccordionItem from '@/components/accordionItem'

const classes = {
  isActive: 'is-active'
}

export default class Accordion extends BaseComponent {
  static TYPE = 'accordion'

  #activeItems: AccordionItem[] // Private field so that doComponentCleanup can't access
  #multi: boolean

  items: AccordionItem[]

  constructor(el: HTMLElement) {
    super(el)

    this.#activeItems = []
    this.#multi = this.el.dataset.multi === 'true'

    this.items = this.qsa(AccordionItem.SELECTOR).map(el => {
      return new AccordionItem(el, {
        onOpen: (item: AccordionItem) => this.onItemOpen(item),
        onClose: (item: AccordionItem) => this.onItemClose(item)
      })
    })
  }

  #syncActiveClass() {
    this.el.classList.toggle(classes.isActive, this.#activeItems.length > 0)
  }

  changeToItem(to: AccordionItem) {
    if (!this.items.includes(to)) return

    to.open()
  }

  onItemOpen(item: AccordionItem) {
    if (!this.#multi) {
      for (const other of [...this.#activeItems]) {
        if (other !== item) other.close()
      }
    }

    // If they clicked an anchor link, close the other items and then follow the link
    // but don't change the active items
    if (item.isAnchor) return

    if (!this.#activeItems.includes(item)) {
      this.#activeItems.push(item)
    }

    this.#syncActiveClass()
  }

  onItemClose(item: AccordionItem) {
    this.#activeItems = this.#activeItems.filter(_itm => _itm !== item)

    this.#syncActiveClass()
  }
}
