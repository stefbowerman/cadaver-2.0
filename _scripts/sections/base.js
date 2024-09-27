export default class BaseSection {
  constructor(container) {
    this.container = container
    this.id = this.container.dataset.sectionId
    this.type = this.constructor.TYPE
    this.parent = this.container.parentElement // Automatically generated wrapper element
    this.parentId = this.parent.id

    this.$container = $(container); // @TODO - this needs to get removed

    this.onNavigateOut = this.onNavigateOut.bind(this)
    this.onNavigateIn  = this.onNavigateIn.bind(this)
    this.onNavigateEnd = this.onNavigateEnd.bind(this)

    window.addEventListener('taxi.navigateOut', this.onNavigateOut)
    window.addEventListener('taxi.navigateIn', this.onNavigateIn)
    window.addEventListener('taxi.navigateEnd', this.onNavigateEnd) 
  }

  onUnload(e) {
    window.removeEventListener('taxi.navigateOut', this.onNavigateOut)
    window.removeEventListener('taxi.navigateIn', this.onNavigateIn)
    window.removeEventListener('taxi.navigateEnd', this.onNavigateEnd)

    // @TODO do component cleanup
  }

  onSectionSelect(e) {
    
  }

  onSectionDeselect(e) {

  }

  onSectionReorder(e) {

  }

  onBlockSelect(e) {

  }

  onBlockDeselect(e) {

  }

  onNavigateOut(e) {
    // const { from, trigger } = e.detail
  }

  onNavigateIn(e) {
    // const { to, trigger } = e.detail
  }

  onNavigateEnd(e) {
    // const { to, from, trigger } = e.detail
  }    
}
