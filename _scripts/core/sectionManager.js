import { isThemeEditor } from '../core/utils'
import { startCase } from '../core/utils/string'

import BaseSection from '../sections/base'

const SECTION_TYPE_ATTR = 'data-section-type'

const THEME_EDITOR_EVENTS = [
  'shopify:section:load',
  'shopify:section:unload',
  'shopify:section:select',
  'shopify:section:deselect',
  'shopify:section:reorder',
  'shopify:block:select',
  'shopify:block:deselect'
]

// Turns 'shopify:section:load' => 'onSectionLoad'
// Turns 'shopify:block:select' => 'onBlockSelect'
function getEventHandlerName(event) {
  let name = event.split(':').splice(1).map(startCase).join('')

  return `on${name}`
}

export default class SectionManager {
  constructor() {
    this.constructors = {}
    this.instances = []

    this.attachEvents()
  }

  destroy() {
    this.instances.forEach(section => section.onUnload?.call(section))

    this.instances = []

    this.removeEvents()
  }

  attachEvents() {
    if (!isThemeEditor()) return

    THEME_EDITOR_EVENTS.forEach(ev => {
      const handlerName = getEventHandlerName(ev)
      const handler = this[handlerName]

      if (handler) {
        window.document.addEventListener(ev, handler.bind(this))
      }
    })
  }

  removeEvents() {
    THEME_EDITOR_EVENTS.forEach(ev => {
      const handlerName = getEventHandlerName(ev)
      const handler = this[handlerName]

      if (handler) {
        window.document.removeEventListener(ev, handler)
      }
    })
  }

  getInstanceById(id) {
    return this.instances.find(instance => instance.id === id)
  }

  getSingleInstance(type) {
    return this.instances.find(instance => instance.type === type)
  }

  load(container, constructor) {
    const type = container.getAttribute(SECTION_TYPE_ATTR)
    const Konstructor = constructor || this.constructors[type] // No param re-assignment

    if (typeof Konstructor === 'undefined') {
      return
    }

    const instance = new Konstructor(container)

    this.instances.push(instance)
  }

  unload(id) {
    const index = this.instances.findIndex(instance => instance.id === id)

    if (index !== -1) {
      this.instances.splice(index, 1)
    }
  }

  register(constructor) {
    if (!(constructor.prototype instanceof BaseSection)) {
      return
    }

    const { TYPE } = constructor

    if (!TYPE) {
      console.warn('Missing static "TYPE" property for constructor ', constructor)
      return    
    }

    if (this.constructors[TYPE]) {
      console.warn(`Constructor of type "${TYPE}" has already been registered`)
      return
    }


    this.constructors[TYPE] = constructor

    document.querySelectorAll(`[${SECTION_TYPE_ATTR}="${TYPE}"]`).forEach(container => {
      this.load(container, constructor)
    })
  }

  // Generic event is a non section:{load/unload} event
  // Simply triggers the appropriate instance method if available
  onGenericEvent(e, func) {
    const instance = this.getInstanceById(e.detail.sectionId)

    if (instance && typeof instance[func] === 'function') {
      instance[func].call(instance, e)
    }    
  }

  onSectionLoad(e) {
    const container = e.target.querySelector(`[${SECTION_TYPE_ATTR}]`)

    if (container) {
      this.load(container)
    }
  }

  onSectionUnload(e) {
    const instance = this.getInstanceById(e.detail.sectionId)

    if (!instance) {
      return
    }

    instance.onUnload(e)

    this.unload(e.detail.sectionId)
  }  

  onSectionSelect(e) {
    this.onGenericEvent(e, 'onSectionSelect')
  }

  onSectionDeselect(e) {
    this.onGenericEvent(e, 'onSectionDeselect')
  }

  onSectionReorder(e) {
    this.onGenericEvent(e, 'onSectionReorder')
  }

  onBlockSelect(e) {
    this.onGenericEvent(e, 'onBlockSelect')
  }

  onBlockDeselect(e) {
    this.onGenericEvent(e, 'onBlockDeselect')
  } 
}
