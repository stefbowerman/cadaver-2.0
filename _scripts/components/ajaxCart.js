import CartAPI from '../core/cartAPI'
import BaseComponent from './base'

const selectors = {
  body: '[data-body]',
  totalPrice: '[data-total-price]',
  close: '[data-ajax-cart-close]',
  item: '[data-item]',
  itemRemove: '[data-item-remove]',
  itemIncrement: '[data-item-increment]',
  itemDecrement: '[data-item-decrement]',  
  toggle: '[data-ajax-cart-toggle]'
}

const classes = {
  open: 'is-open',
  empty: 'is-empty',
  bodyCartOpen: 'ajax-cart-open',
  itemRequestInProgress: 'is-in-progress',
  itemIsBeingRemoved: 'is-being-removed',  
  adjusterButtonDisabled: 'is-disabled',
  backdrop: 'ajax-cart-backdrop'
}

export const events = {
  CLICK: `click.ajaxCart`,
  RENDER: `render.ajaxCart`
}

export default class AJAXCart extends BaseComponent {
  static TYPE = 'ajax-cart'

  constructor(el) {
    super(el)

    this.isOpen = false
    this.hasBeenRendered = false
    this.requestInProgress = false

    this.callbacks = {
      bodyClick: this.onBodyClick.bind(this),
      itemRemoveClick: this.onItemRemoveClick.bind(this),
      itemIncrementClick: this.onItemIncrementClick.bind(this),
      itemDecrementClick: this.onItemDecrementClick.bind(this)
    }      

    this.body = this.qs(selectors.body)
    this.totalPrice = this.qs(selectors.totalPrice)

    this.backdrop = document.createElement('div')
    this.backdrop.classList.add(classes.backdrop)
    this.backdrop.setAttribute('title', 'Close Cart')
    document.body.appendChild(this.backdrop)

    this.el.addEventListener('click', (e) => {
      const removeButton = e.target.closest(selectors.itemRemove)
      const incrementButton = e.target.closest(selectors.itemIncrement)
      const decrementButton = e.target.closest(selectors.itemDecrement)

      if (removeButton) {
        this.callbacks.itemRemoveClick(e)
      }
      else if (incrementButton) {
        this.onItemIncrementClick(e)
      }
      else if (decrementButton) {
        this.onItemDecrementClick(e)
      }
    })    

    this.backdrop.addEventListener('click', this.close.bind(this))
    document.body.addEventListener('click', this.callbacks.bodyClick)
  }

  destroy() {
    this.backdrop.remove()
    document.body.classList.remove(classes.bodyCartOpen)    
    document.body.removeEventListener('click', this.callbacks.bodyClick)

    super.destroy()
  }

  itemInfoTemplate(item) {
    const {
      product_title,
      price_formatted,
      handle,
      variant_options,
      properties,
      quantity,
      is_addable
    } = item

    return `
      <div>
        <div class="ajax-cart__item-header">
          <div class="ajax-cart__item-title">
            <a href="/products/${handle}">${product_title}</a>
          </div>
          <a href="#" class="ajax-cart__item-remove" data-item-remove>Remove</a>
        </div>

        <div>
          ${variant_options.map(option => `
              <div class="ajax-cart__item-detail">
                ${option.name} - ${option.value}
              </div>
            `).join('')
          }

          ${properties.map(property => `
              <div class="ajax-cart__item-detail">
                ${property.name} - ${property.value}
              </div>
            `).join('')
          }          
        </div>
      </div>  

      <div style="display: flex; justify-content: space-between">
        <div class="quantity-adjuster">
          <a href="#" class="quantity-adjuster__button" aria-label="Decrement Quantity" data-item-decrement>
            <i class="quantity-adjuster__icon minus"></i>
          </a>

          <div class="quantity-adjuster__value">
            ${quantity}
          </div>

          <a href="#" class="quantity-adjuster__button${ is_addable ? '' : ' is-disabled'}" aria-label="Increment Quantity" data-item-increment>
            <i class="quantity-adjuster__icon plus"></i>
          </a>
        </div>

        <div class="ajax-cart__item-price">${price_formatted}</div>
      </div>
    `
  }

  itemTemplate(item) {
    const { key, quantity, imageV2 } = item

    return `
      <div class="ajax-cart__item" data-key="${key}" data-qty="${quantity}" data-item>
        <div class="ajax-cart__item-inner">
          <div class="ajax-cart__item-image-frame">
            <div class="ajax-cart__item-image">
              <img src="${imageV2.url}" alt="${imageV2.alt}" height="${imageV2.height}" width="${imageV2.width}" />
            </div>
          </div>
          <div class="ajax-cart__item-info">
            ${this.itemInfoTemplate(item)}
          </div>
        </div>       
      </div>    
    `
  }

  bodyTemplate(cart) {
    let html = ''

    if (cart.items) {
      html += cart.items.map(item => this.itemTemplate(item)).join('')
    }

    return html
  }

  /**
   * Ensure we are working with a valid number
   *
   * @param {int|string} qty
   * @return {int} - Integer quantity.  Defaults to 1
   */
  validateQty(qty) {
    return (parseFloat(qty) === parseInt(qty)) && !Number.isNaN(qty) ? qty : 1;
  }  

  /**
   * Get data about the cart line item row
   *
   * @param {HTMLElement} target - cart line item or child element
   * @return {obj}
   */
  getItemAttributes(target) {
    // Find the closest item element
    const el = target.closest(selectors.item)
    const qty = parseInt(el.dataset.qty)
    
    return {
      el,
      key: el.dataset.key,
      qty: this.validateQty(qty)
    }
  }  

  /**
   * Builds the HTML for the ajax cart and inserts it into the container element
   *
   * @param {object} cart - JSON representation of the cart.  See https://help.shopify.com/themes/development/getting-started/using-ajax-api#get-cart
   * @param {string} slot - specific slot to re-render, otherwise the entire cart will be re-rendered
   * @return this
   */
  render(cart, slot) {
    if (!cart) return

    // If there's nothing in the cart, just add the empty class and cover up the contents
    if (cart.item_count === 0) {
      this.el.classList.add(classes.empty)
    }
    else {
      this.el.classList.remove(classes.empty)

      if (slot === 'body') {
        this.body.innerHTML = this.bodyTemplate(cart)
      }
      else if (slot === 'price') {
        this.totalPrice.innerHTML = cart.total_price_formatted
      }
      else {
        this.body.innerHTML = this.bodyTemplate(cart)
        this.totalPrice.innerHTML = cart.total_price_formatted
      }
    }    

    const event = new CustomEvent(events.RENDER, { detail: { cart } })
    window.dispatchEvent(event)

    this.hasBeenRendered = true

    return this
  }

  /**
   * Update the quantity for a single item in the cart
   *
   * @param {HTMLElement} el - cart line item element
   * @param {object} line - cart line item data object
   * @return this
   */
  renderItemInfo(el, line) {
    if (!line) return 

    el.dataset.qty = line.quantity
    el.querySelector('.ajax-cart__item-info').innerHTML = this.itemInfoTemplate(line)
  }  

  toggle() {
    return this.isOpen ? this.close() : this.open()
  }  

  open() {
    if (this.isOpen) return

    this.el.classList.add(classes.open)
    document.body.classList.add(classes.bodyCartOpen)
    this.isOpen = true
  }

  close() {
    if (!this.isOpen) return

    this.el.classList.remove(classes.open)
    document.body.classList.remove(classes.bodyCartOpen)
    this.isOpen = false
  }  

  onChangeSuccess(cart) {
    this.render(cart).open()
  }

  onChangeFail() {
    // 
  }

  onItemIncrementClick(e) {
    e.preventDefault();

    if (e.currentTarget.classList.contains(classes.adjusterButtonDisabled)) {
      return
    }

    const { key, qty, el } = this.getItemAttributes(e.target)
    
    this.adjustQuantity(key, qty+1, el)     
  }

  onItemDecrementClick(e) {
    e.preventDefault();

    if (e.currentTarget.classList.contains(classes.adjusterButtonDisabled)) {
      return
    }

    const { key, qty, el } = this.getItemAttributes(e.target)
    
    this.adjustQuantity(key, qty-1, el)
  }  

  /**
   * Remove the item from the cart.  Extract this into a separate method if there becomes more ways to delete an item
   *
   * @param {event} e - Click event
   */
  onItemRemoveClick(e) {
    e.preventDefault();

    const { key, el } = this.getItemAttributes(e.target)

    this.adjustQuantity(key, 0, el)
  }

  adjustQuantity(key, newQty, itemEl) {
    if (this.requestInProgress) {
      return
    }

    this.requestInProgress = true

    const itemClass = classes[newQty === 0 ? 'itemIsBeingRemoved' : 'itemRequestInProgress']

    itemEl.classList.add(itemClass)

    if (newQty < 0) {
      newQty = 0
    }

    CartAPI.changeLineItemQuantity(key, newQty)
      .then((cart) => {
        this.requestInProgress = false

        if (cart.item_count > 0 && newQty === 0) {
          // We only need to re-render the price and then remove the item
          this.render(cart, 'price')          
          itemEl.remove()
        }
        else {
          // Don't render the whole cart
          // Just render the price and the item details
          this.render(cart, 'price');
          this.renderItemInfo(itemEl, cart.items.find(item => item.key === key))
          itemEl.classList.remove(itemClass)
        }
      })
      .catch(() => {
        this.requestInProgress = false
        console.warn('something went wrong...');
      })  
  }

  onBodyClick(e) {
    if (e.target.closest(selectors.close)) {
      return this.onCloseClick(e)
    }
    else if (e.target.closest(selectors.toggle)) {
      return this.onToggleClick(e)
    }
  }

  onToggleClick(e) {
    e.preventDefault()

    // If we haven't rendered the cart yet, don't show it
    if (!this.hasBeenRendered) {
      return
    }

    this.toggle()
  }

  onCloseClick(e) {
    e.preventDefault()
    this.close()
  }
}