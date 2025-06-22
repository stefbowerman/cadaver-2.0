import BaseComponent from './base'
import CartBody from './ajaxCart/cartBody'
import CartFooter from './ajaxCart/cartFooter'

const selectors = {
  close: '[data-ajax-cart-close]',
  toggle: '[data-ajax-cart-toggle][aria-controls]' // Not scoped to the component
}

const classes = {
  open: 'is-open',
  empty: 'is-empty',
  bodyCartOpen: 'ajax-cart-open',
  backdrop: 'ajax-cart-backdrop'
}

export default class AJAXCart extends BaseComponent {
  static TYPE = 'ajax-cart'

  constructor(el, cartData) {
    super(el, {
      watchCartUpdate: true,
    })

    this.isOpen = false
    this.requestInProgress = false

    this.cartBody = new CartBody(this.qs(CartBody.SELECTOR), cartData)
    this.cartFooter = new CartFooter(this.qs(CartFooter.SELECTOR))    

    this.onBodyClick = this.onBodyClick.bind(this)

    this.backdrop = document.createElement('div')
    this.backdrop.classList.add(classes.backdrop)
    this.backdrop.setAttribute('title', 'Close Cart')
    document.body.appendChild(this.backdrop)  

    this.backdrop.addEventListener('click', this.close.bind(this))
    document.body.addEventListener('click', this.onBodyClick)

    // Set empty state based on initial cart data
    this.setEmpty(cartData.item_count === 0)
  }

  destroy() {
    this.backdrop.remove()
    document.body.classList.remove(classes.bodyCartOpen)    
    document.body.removeEventListener('click', this.onBodyClick)

    super.destroy()
  }

  setEmpty(isEmpty) {
    this.el.classList.toggle(classes.empty, isEmpty)
  }  

  toggle() {
    return this.isOpen ? this.close() : this.open()
  }  

  open() {
    if (this.isOpen) return

    this.el.classList.add(classes.open)
    this.el.setAttribute('aria-hidden', 'false')

    document.body.classList.add(classes.bodyCartOpen)
    this.ariaControlElements.forEach(el => el.setAttribute('aria-expanded', 'true'))

    this.isOpen = true
  }

  close() {
    if (!this.isOpen) return

    this.el.classList.remove(classes.open)
    this.el.setAttribute('aria-hidden', 'true')
    
    document.body.classList.remove(classes.bodyCartOpen)
    this.ariaControlElements.forEach(el => el.setAttribute('aria-expanded', 'false'))

    this.isOpen = false
  }

  onCartUpdate(e) {
    const { cart } = e.detail

    this.setEmpty(cart.item_count === 0)
    
    this.open()
  }

  onBodyClick(e) {
    if (e.target.closest(selectors.close)) {
      return this.onCloseClick(e)
    }
    else if (e.target.closest(selectors.toggle)?.getAttribute('aria-controls') === this.el.id) {
      return this.onToggleClick(e)
    }
  }

  onToggleClick(e) {
    e.preventDefault()

    this.toggle()
  }

  onCloseClick(e) {
    e.preventDefault()
    this.close()
  }
}