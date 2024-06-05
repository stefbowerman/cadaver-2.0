// This is a WIP - Nothing extends from this base component just yet

export default class BaseComponent {
  constructor(el, name, ...args) {
    this.$el = el instanceof $ ? el : $(el)
    this.name = name
  }

  findWithin(selector) {
    return $(selector, this.$el)
  }

  destroy() {
    //
  }
}