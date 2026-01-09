import debounce, { type DebouncedFunc } from 'lodash.debounce'

import CartAPI from '@/core/cartAPI'
import { isTouch } from '@/core/utils'
import type { LiteLineItem } from '@/types/shopify'

import BaseComponent from '@/components/base'
import QuantityAdjuster from '@/components/quantityAdjuster'

const selectors = {
  remove: 'button[data-remove]',
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

  #state: string | undefined // @TODO - Should "string" be one of the states?
  id: number
  itemData: LiteLineItem
  remove: HTMLButtonElement
  price: HTMLElement
  debouncedOnQuantityAdjusterChange: DebouncedFunc<(qty: number) => void>
  quantityAdjuster: QuantityAdjuster

  constructor(el: HTMLElement, itemData: LiteLineItem) {
    super(el)

    this.#state = undefined

    this.itemData = itemData
    this.id = this.itemData.id
    

    this.remove = this.qs(selectors.remove) as HTMLButtonElement
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

    this.#state = state
  }

  get state() {
    return this.#state
  }

  /**
   * Updates the item with new data
   * @param {Object} item - The updated item data
   * @param {number} item.quantity - The new quantity of the item
   * @param {string} item.item_price_html - The HTML string representing the updated price
   */
  update(itemData: LiteLineItem) {
    if (!itemData || typeof itemData !== 'object') {
      console.error('Invalid item data provided to update method')
      return
    }

    if (itemData.quantity !== undefined) {
      this.quantityAdjuster.value = itemData.quantity // Make sure the quantity adjuster has the correct value
    }

    // Update the price
    const temp = document.createElement('div')
          temp.innerHTML = itemData.item_price_html
    const newPrice = temp.firstElementChild as HTMLElement

    this.price.replaceWith(newPrice)
    this.price = newPrice

    this.itemData = itemData
  }

  // @TODO - This is broken if there are multiple items in the cart with the same ID
  // this can happen if there are multiple of the same variant but the line items have different properties
  // Changing the quantity adjuster will update all the items with that ID
  // We need to go off of the index or the key??
  async onQuantityAdjusterChange(q: number) {
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

  async onRemoveClick(e: MouseEvent) {
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