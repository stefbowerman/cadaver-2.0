import CartAPI from '../../core/cartAPI'
import { slideUp } from '../../core/gsap'
import { getDomFromString } from '../../core/utils/dom'

import BaseComponent from '../base'
import CartItem from './cartItem'

const selectors = {
  list: '[data-list]'
}

export default class CartBody extends BaseComponent {
  static TYPE = 'cart-body'

  constructor(el, cartData) {
    super(el)

    this.cartData = cartData

    this.list = this.el.querySelector(selectors.list)

    // @TODO - This should be a map over the cartData.items array
    // this.cartData.items.map(item => ... )
    this.cartItemInstances = this.qsa(CartItem.SELECTOR).map(el => new CartItem(el))

    this.syncCart = this.syncCart.bind(this)

    window.addEventListener(CartAPI.events.UPDATE, this.syncCart)
  }

  destroy() {
    window.removeEventListener(CartAPI.events.UPDATE, this.syncCart)

    super.destroy()
  }

  cleanupItemInstance(item) {
    item.destroy()
    item.el.remove()
  }

  /**
   * Synchronizes the cart UI with new cart data received from an update event
   * @param {CustomEvent} e - Cart update event containing new cart data
   * @param {Object} e.detail.cart - The new cart data
   * @param {Array} e.detail.cart.items - Array of cart items
   * @param {string} e.detail.cart.items[].id - Unique identifier for cart item
   * @param {string} e.detail.cart.items[].item_html - HTML string representation of cart item
   */
  syncCart(e) {
    const newCartData = e.detail.cart

    // First handle additions and updates
    newCartData.items.forEach((newItemData, newIndex) => {
      let found = false

      this.cartItemInstances.forEach(itemInstance => {
        if (newItemData.id === itemInstance.id) {
          found = true
          
          itemInstance.update(newItemData)
        }
      })

      // If item wasn't found, it's new - add it
      if (!found) {
        const newItemEl = getDomFromString(newItemData.item_html).querySelector(CartItem.SELECTOR)
        const newItemInstance = new CartItem(newItemEl)
        
        // Insert to list DOM
        this.list.insertBefore(newItemInstance.el, this.cartItemInstances[newIndex]?.el || null)
        
        // Insert to array of cart item instances
        this.cartItemInstances.splice(newIndex, 0, newItemInstance)
      }
    })

    // Then handle removals - find items that exist in current cart but not in new cart
    this.cartItemInstances.forEach(itemInstance => {
      const stillExists = newCartData.items.some(newItemData => newItemData.id === itemInstance.id)
      
      if (!stillExists) {
        // Remove from the cartItemInstances array
        this.cartItemInstances = this.cartItemInstances.filter(({ id }) => id !== itemInstance.id)
        
        // Animate the removal and then clean up the instance
        slideUp(itemInstance.el, {
          duration: 0.45,
          onInterrupt: () => {
            this.cleanupItemInstance(itemInstance)
          },
          onComplete: () => {
            this.cleanupItemInstance(itemInstance)
          }
        })
      }
    })

    // Update the stored cart data
    this.cartData = newCartData
  }
}