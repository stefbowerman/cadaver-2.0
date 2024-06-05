export default class BaseSection {
  constructor(container, name) {
    this.$container = container instanceof $ ? container : $(container);
    this.id = this.$container.data('section-id');
    this.type = this.$container.data('section-type');
    this.name = name;
    this.namespace = `.${this.name}`; // @TODO - This should be camelCased just incase

    this.onNavigateOut = this.onNavigateOut.bind(this)
    this.onNavigateIn  = this.onNavigateIn.bind(this)
    this.onNavigateEnd = this.onNavigateEnd.bind(this)

    $(window)
      .on('taxi.navigateOut', this.onNavigateOut)
      .on('taxi.navigateIn',  this.onNavigateIn)
      .on('taxi.navigateEnd', this.onNavigateEnd)    
  }

  findWithin(selector) {
    return $(selector, this.$container) // Not implemented on any sections yet
  }  

  onUnload(e) {
    $(window)
      .off('taxi.navigateOut', this.onNavigateOut)
      .off('taxi.navigateIn',  this.onNavigateIn)
      .off('taxi.navigateEnd', this.onNavigateEnd)

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
