import BaseSection from '../sections/base'

const SECTION_TYPE_ATTR = 'data-section-type'
const SECTION_ID_ATTR = 'data-section-id'

const $document = $(document)

export default class SectionManager {
  constructor() {
    this.constructors = {}
    this.instances = []

    this.handlers = {
      sectionLoad: this.onSectionLoad.bind(this),
      sectionUnload: this.onSectionUnload.bind(this),
      select: this.onSelect.bind(this),
      deselect: this.onDeselect.bind(this),
      reorder: this.onReorder.bind(this),
      blockSelect: this.onBlockSelect.bind(this),
      blockDeselect: this.onBlockDeselect.bind(this)
    };

    if (window.Shopify && window.Shopify.designMode) {
      $document
        .on('shopify:section:load', this.handlers.sectionLoad)
        .on('shopify:section:unload', this.handlers.sectionUnload)
        .on('shopify:section:select', this.handlers.select)
        .on('shopify:section:deselect', this.handlers.deselect)
        .on('shopify:section:reorder', this.handlers.reorder)
        .on('shopify:block:select', this.handlers.blockSelect)
        .on('shopify:block:deselect', this.handlers.blockDeselect)
    }
  }

  destroy() {
    this.instances.forEach(section => {
      section.onUnload && section.onUnload()
    })

    this.instances = []

    $document
      .off('shopify:section:load', this.handlers.sectionLoad)
      .off('shopify:section:unload', this.handlers.sectionUnload)
      .off('shopify:section:select', this.handlers.select)
      .off('shopify:section:deselect', this.handlers.deselect)
      .off('shopify:section:reorder', this.handlers.reorder)
      .off('shopify:block:select', this.handlers.blockSelect)
      .off('shopify:block:deselect', this.handlers.blockDeselect)
  }  

  getInstanceById(id) {
    let instance

    for (let i = 0; i < this.instances.length; i++) {
      if (this.instances[i].id === id) {
        instance = this.instances[i]
        break
      }
    }
    return instance
  }

  getSingleInstance(type) {
    let instance

    for (let i = 0; i < this.instances.length; i++) {
      if (this.instances[i].type === type) {
        instance = this.instances[i]
        break;
      }
    }

    return instance
  }  

  load(container, constructor) {
    const $container = $(container)
    const id = $container.attr(SECTION_ID_ATTR)
    const type = $container.attr(SECTION_TYPE_ATTR)
    const Konstructor = constructor || this.constructors[type] // No param re-assignment

    if (typeof Konstructor === 'undefined') {
      return
    }

    const instance = $.extend(new Konstructor(container), { id, type, container })

    this.instances.push(instance)
  }

  unload(id) {
    let i = this.instances.length

    while (i--) {
      if (this.instances[i].id === id) {
        this.instances.splice(i, 1)
        break
      }
    }
  }

  onSectionLoad(e) {
    const container = $(`[${SECTION_ID_ATTR}]`, e.target)[0]

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

  // Generic event is a non section load/unload
  // Simply triggers the appropriate instance method if available
  onGenericEvent(e, func) {
    const instance = this.getInstanceById(e.detail.sectionId)

    if (instance && typeof instance[func] === 'function') {
      instance[func].call(instance, e)
    }
  }

  onSelect(e) {
    this.onGenericEvent(e, 'onSelect')
  }

  onDeselect(e) {
    this.onGenericEvent(e, 'onDeselect')
  }

  onReorder(e) {
    this.onGenericEvent(e, 'onReorder')
  }

  onBlockSelect(e) {
    this.onGenericEvent(e, 'onBlockSelect')
  }

  onBlockDeselect(e) {
    this.onGenericEvent(e, 'onBlockDeselect')
  }

  register(type, constructor) {
    // Need to make sure we're working with actual sections here..
    if (!(constructor.prototype instanceof BaseSection)) {
      return
    }

    this.constructors[type] = constructor

    $(`[${SECTION_TYPE_ATTR}=${type}]`).each((index, container) => {
      this.load(container, constructor)
    })
  }
}
