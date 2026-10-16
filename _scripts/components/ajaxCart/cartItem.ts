import type { LiteLineItem } from '@/types/shopify'
import { isTouch, debounce } from '@/core/utils'
import { setAriaFlag } from '@/core/utils/a11y'

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

interface CartItemOptions {
  onRemoveClick?: (item: CartItem) => void,
  onQuantityAdjusterChange?: (item: CartItem, qty: number) => void
}

type CartItemAllowedState = 'removing' | 'updating' | undefined

export default class CartItem extends BaseComponent {
  static TYPE = 'cart-item'

  #state: CartItemAllowedState
  settings: CartItemOptions
  id: number
  itemData: LiteLineItem
  remove: HTMLButtonElement
  price: HTMLElement
  debouncedOnQuantityAdjusterChange: ReturnType<typeof debounce<(qty: number) => void>>
  quantityAdjuster: QuantityAdjuster

  constructor(el: HTMLElement, itemData: LiteLineItem, options: CartItemOptions = {}) {
    super(el)

    this.#state = undefined

    this.settings = {
      ...options
    }

    this.itemData = itemData
    this.id = this.itemData.id

    this.remove = this.qsRequired<HTMLButtonElement>(selectors.remove)
    this.price = this.qsRequired(selectors.price)

    this.debouncedOnQuantityAdjusterChange = debounce(this.onQuantityAdjusterChange.bind(this), (isTouch() ? 500 : 250)) // <- Longer debounce for touch devices since fast touches are taken as a double click which causes page zoom

    this.quantityAdjuster = new QuantityAdjuster(this.qsRequired(QuantityAdjuster.SELECTOR), {
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

  destroy() {
    this.debouncedOnQuantityAdjusterChange.cancel() // Prevent a pending quantity change from firing after the item is removed

    super.destroy()
  }

  get key() {
    return this.itemData.key
  }

  set state(state: CartItemAllowedState) {
    switch (state) {
      case 'removing':
        this.remove.disabled = true
        setAriaFlag(this.remove, 'aria-disabled', true)
        this.el.classList.add(classes.removing)
        break
      case 'updating':
        this.remove.disabled = true
        setAriaFlag(this.remove, 'aria-disabled', true)
        this.el.classList.add(classes.updating)
        break
      case undefined:
      default:
        this.remove.disabled = false
        setAriaFlag(this.remove, 'aria-disabled', false)
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

  async onQuantityAdjusterChange(q: number) {
    if (this.state !== undefined) return

    this.settings.onQuantityAdjusterChange?.(this, q)
  }

  async onRemoveClick(e: MouseEvent) {
    e.preventDefault()

    if (this.state !== undefined) return

    this.settings.onRemoveClick?.(this)
  }  
}
