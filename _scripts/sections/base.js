export default class BaseSection {
  constructor(container, name) {
    this.$container = container instanceof $ ? container : $(container);
    this.id = this.$container.data('section-id');
    this.type = this.$container.data('section-type');
    this.name = name;
    this.namespace = `.${this.name}`;

    // Commenting these out for now because I don't think we need them...
    
    // this.events = {
    //   SCROLL: `scroll${this.namespace}`,
    //   CLICK:  `click${this.namespace}`,
    //   RESIZE: `resize${this.namespace}`,
    //   MOUSEENTER: `mouseenter${this.namespace}`,
    //   MOUSELEAVE: `mouseleave${this.namespace}`
    // };


    $(window)
      .on('taxi.navigateOut', this.onNavigateOut.bind(this))
      .on('taxi.navigateIn', this.onNavigateIn.bind(this))
      .on('taxi.navigateEnd', this.onNavigateEnd.bind(this))    
  }

  onUnload(e) {
    
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
