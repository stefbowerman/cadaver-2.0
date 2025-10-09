import debounce from 'lodash.debounce'

import CartAPI from '../../core/cartAPI'
import { isTouch } from '../../core/utils'

import BaseComponent from '../base'
import QuantityAdjuster from '../quantityAdjuster'

const selectors = {
  remove: '[data-remove]',
  price: '[data-price]',
}

const classes = {
  removing: 'is-removing',
  updating: 'is-updating'
}

export default class CartItem extends BaseComponent {
  static TYPE = 'cart-item'

  static states = {
    REMOVING: 'removing',
    UPDATING: 'updating'
  }

  constructor(el, itemData) {
    super(el)

    this._state = undefined

    this.id = parseInt(this.el.dataset.id, 10)
    this.itemData = itemData

    this.remove = this.qs(selectors.remove)
    this.price = this.qs(selectors.price)

    this.debouncedOnQuantityAdjusterChange = debounce(this.onQuantityAdjusterChange.bind(this), (isTouch() ? 500 : 250)) // <- Longer debounce for touch devices since fast touches are taken as a double click which causes page zoom

    this.quantityAdjuster = new QuantityAdjuster(this.el.querySelector(QuantityAdjuster.SELECTOR), {
      onChange: qty => {
        // If the quantity is changed to 0, trigger change callback immediately
        if (qty === 0) {
          this.debouncedOnQuantityAdjusterChange?.cancel() // Cancel the debounced function so they don't overlap
          this.onQuantityAdjusterChange(qty)
          return
        }
        
        this.debouncedOnQuantityAdjusterChange(qty)
      }
    })

    this.remove.addEventListener('click', this.onRemoveClick.bind(this))
  }

  set state(state) {
    switch (state) {
      case CartItem.states.REMOVING:
        this.remove.disabled = true
        this.remove.setAttribute('aria-disabled', 'true')
        this.el.classList.add(classes.removing)
        break
      case CartItem.states.UPDATING:
        this.remove.disabled = true
        this.remove.setAttribute('aria-disabled', 'true')
        this.el.classList.add(classes.updating)
        break
      case undefined:
      default:
        this.remove.disabled = false
        this.remove.removeAttribute('aria-disabled')
        this.el.classList.remove(classes.removing, classes.updating)
        break
    }

    this._state = state
  }

  get state() {
    return this._state
  }

  /**
   * Updates the item with new data
   * @param {Object} item - The updated item data
   * @param {number} item.quantity - The new quantity of the item
   * @param {string} item.item_price_html - The HTML string representing the updated price
   */
  update(itemData) {
    if (!itemData || typeof itemData !== 'object') {
      console.error('Invalid item data provided to update method')
      return
    }

    if (itemData.quantity !== undefined) {
      this.quantityAdjuster.value = itemData.quantity // Make sure the quantity adjuster has the correct value
    }

    this.price.innerHTML = itemData.item_price_html

    this.itemData = itemData
  }

  async onQuantityAdjusterChange(q) {
    if (this.state !== undefined) return

    try {
      this.state = q === 0 ? CartItem.states.REMOVING : CartItem.states.UPDATING

      await CartAPI.changeLineItemQuantity(this.id, q)
    }
    catch (error) {
      this.state = undefined
      this.quantityAdjuster.value = this.itemData.quantity // Reset the quantity adjuster to the original quantity

      console.error('Error updating item quantity', error)
    }
    finally {
      if (q > 0) {
        this.state = undefined
      }
    }
  }

  async onRemoveClick(e) {
    e.preventDefault()

    try {
      this.state = CartItem.states.REMOVING

      await CartAPI.changeLineItemQuantity(this.id, 0)
    }
    catch (error) {
      console.warn('Error removing item', error)
      this.state = undefined
    }
  }  
}