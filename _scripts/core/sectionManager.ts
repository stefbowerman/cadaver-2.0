import type {
  ThemeEditorGenericEvent,
  ThemeEditorSectionLoadEvent,
  ThemeEditorSectionUnloadEvent,
  ThemeEditorSectionSelectEvent,
  ThemeEditorSectionDeselectEvent,
  ThemeEditorSectionReorderEvent,
  ThemeEditorBlockSelectEvent,
  ThemeEditorBlockDeselectEvent,
} from '@/types/shopify'

import { isThemeEditor } from '@/core/utils'
import { startCase } from '@/core/utils/string'

import BaseSection from '@/sections/base'

const SECTION_TYPE_ATTR = 'data-section-type'

const THEME_EDITOR_EVENTS = [
  'shopify:section:load',
  'shopify:section:unload',
  'shopify:section:select',
  'shopify:section:deselect',
  'shopify:section:reorder',
  'shopify:block:select',
  'shopify:block:deselect',

  // Not hooking these up just yet....
  // 'shopify:inspector:activate',
  // 'shopify:inspector:deactivate',
]

/**
 * Converts en event name into and event handler name
 * 
 * @param eventName - Event name
 * @returns Event handler name
 *
 * @example
 * getEventHandlerName('shopify:section:load') => 'onSectionLoad'
 */
function getEventHandlerName(eventName: string): string {
  const name = eventName.split(':').splice(1).map(startCase).join('')

  return `on${name}`
}

export default class SectionManager {

  constructors: Record<string, typeof BaseSection>
  instances: BaseSection[]

  constructor() {
    this.constructors = {}
    this.instances = []

    // Bind all the theme editor event handlers
    THEME_EDITOR_EVENTS.forEach(ev => {
      const handlerName = getEventHandlerName(ev)

      if (this[handlerName]) {
        this[handlerName] = this[handlerName].bind(this)
      }
    })

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
      const handler = this[getEventHandlerName(ev)]

      if (handler) {
        window.document.addEventListener(ev, handler.bind(this))
      }
    })
  }

  removeEvents() {
    THEME_EDITOR_EVENTS.forEach(ev => {
      const handler = this[getEventHandlerName(ev)]

      if (handler) {
        window.document.removeEventListener(ev, handler)
      }
    })
  }

  getInstanceById(id: string) {
    return this.instances.find(instance => instance.id === id)
  }

  getSingleInstance(type: string) {
    return this.instances.find(instance => instance.type === type)
  }

  load(container: HTMLElement, constructor?: typeof BaseSection) {
    const type = container.getAttribute(SECTION_TYPE_ATTR)
    const Konstructor = constructor || this.constructors[type] // No param re-assignment

    if (typeof Konstructor === 'undefined') {
      return
    }

    const instance = new Konstructor(container)

    this.instances.push(instance)
  }

  unload(id: string) {
    const index = this.instances.findIndex(instance => instance.id === id)

    if (index !== -1) {
      this.instances.splice(index, 1)
    }
  }

  register(constructor: typeof BaseSection) {
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

    document.querySelectorAll(`[${SECTION_TYPE_ATTR}="${TYPE}"]`).forEach((container: HTMLElement) => {
      this.load(container, constructor)
    })
  }

  // Generic event is a non section:{load/unload} event
  // Simply triggers the appropriate instance method if available
  onGenericEvent(e: ThemeEditorGenericEvent, func: string) {
    const instance = this.getInstanceById(e.detail.sectionId)

    if (instance && typeof instance[func] === 'function') {
      instance[func].call(instance, e)
    }    
  }

  onSectionLoad(e: ThemeEditorSectionLoadEvent) {
    const container = (e.target as HTMLElement).querySelector(`[${SECTION_TYPE_ATTR}]`)

    if (container) {
      this.load(container as HTMLElement)
    }
  }

  onSectionUnload(e: ThemeEditorSectionUnloadEvent) {
    const instance = this.getInstanceById(e.detail.sectionId)

    if (!instance) {
      return
    }

    instance.onUnload(e)

    this.unload(e.detail.sectionId)
  }  

  onSectionSelect(e: ThemeEditorSectionSelectEvent) {
    this.onGenericEvent(e, 'onSectionSelect')
  }

  onSectionDeselect(e: ThemeEditorSectionDeselectEvent) {
    this.onGenericEvent(e, 'onSectionDeselect')
  }

  onSectionReorder(e: ThemeEditorSectionReorderEvent) {
    this.onGenericEvent(e, 'onSectionReorder')
  }

  onBlockSelect(e: ThemeEditorBlockSelectEvent) {
    this.onGenericEvent(e, 'onBlockSelect')
  }

  onBlockDeselect(e: ThemeEditorBlockDeselectEvent) {
    this.onGenericEvent(e, 'onBlockDeselect')
  } 
}
