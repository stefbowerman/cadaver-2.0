export default class BaseSection {
  constructor(container, name) {
    this.$container = container instanceof $ ? container : $(container); // @TODO - Eventually this will get converted to this.container
    this.id = this.$container.data('section-id');
    this.type = this.$container.data('section-type');
    this.name = name;
    this.namespace = `.${this.name}`; // @TODO - This should be camelCased just incase

    this.onNavigateOut = this.onNavigateOut.bind(this)
    this.onNavigateIn  = this.onNavigateIn.bind(this)
    this.onNavigateEnd = this.onNavigateEnd.bind(this)

    window.addEventListener('taxi.navigateOut', this.onNavigateOut)
    window.addEventListener('taxi.navigateIn', this.onNavigateIn)
    window.addEventListener('taxi.navigateEnd', this.onNavigateEnd) 
  }

  findWithin(selector) {
    return $(selector, this.$container) // Not implemented on any sections yet
  }  

  onUnload(e) {
    window.removeEventListener('taxi.navigateOut', this.onNavigateOut)
    window.removeEventListener('taxi.navigateIn', this.onNavigateIn)
    window.removeEventListener('taxi.navigateEnd', this.onNavigateEnd)

    // Testing section component autodestroy
    // for (let key in this) {
    //   console.log(this[key])
    //   if (this[key].destroy) {
    //     console.log('has destroy method!')
    //   }
    // }      
  }

  onSelect(e) {
    
  }

  onDeselect(e) {

  }

  onReorder(e) {

  }

  onBlockSelect(e) {

  }

  onBlockDeselect(e) {

  }

  onNavigateOut({ from, trigger }) {

  }

  onNavigateIn({ to, trigger }) {

  }

  onNavigateEnd({ to, from, trigger }) {

  }  
}
