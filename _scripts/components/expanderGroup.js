const selectors = {
  expander: '.expander',
  header: '.expander__header',
  body: '.expander__body'
}

const classes = {
  isOpen: 'is-open'
}

export const selector = '[data-expander-group]'

class Expander {
  constructor(el, options = {}) {
    this.$el = $(el)

    this.$header = $(selectors.header, this.$el)
    this.$body = $(selectors.body, this.$el)

    const defaults = {
      onClick: $.noop
    }

    this.settings = {
      ...defaults,
      ...options
    }

    this.isOpen = false

    if (this.$el.data('default') == 'open') {
      this.open(true)
    }

    this.$header.on('click', this.onClick.bind(this))
  }

  onClick() {
    this.settings.onClick(this)
  }

  open(immediate = false) {
    if (this.isOpen) return

    this.$body.stop()
    this.$body.slideDown({
      duration: immediate ? 50 : 400,
      easing: 'easeOutQuart',
      start: () => {
        this.$el.addClass(classes.isOpen)
      }
    })

    this.$header.attr('aria-expanded', true)
    this.isOpen = true
  }

  close() {
    if (!this.isOpen) return

    this.$body.stop()
    this.$body.slideUp({
      duration: 400,
      easing: 'easeOutQuart',
      start: () => {
        this.$el.removeClass(classes.isOpen)
      }
    })

    this.$header.attr('aria-expanded', false)
    this.isOpen = false
  }
}

export default class ExpanderGroup {
  constructor(el) {
    this.$el = $(el)

    this.expanders = $.map($(selectors.expander, this.$el), el => {
      return new Expander(el, {
        onClick: this.onClick.bind(this)
      })
    })

    this.activeExpander = this.expanders.find(ex => !!ex.isOpen)
  }

  onClick(expander) {
    if (expander.isOpen) {
      expander.close()
    }
    else {
      this.activeExpander && this.activeExpander.close()
      
      expander.open()
      this.activeExpander = expander
    }
  }
}
