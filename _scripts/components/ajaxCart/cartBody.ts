import { slideUp } from '@/core/gsap'
import { getDomFromString } from '@/core/utils/dom'
import type { LiteCart, LiteLineItem } from '@/types/shopify'
import CartAPI, { type CartAPIEvent } from '@/core/cartAPI'

import BaseComponent from '@/components/base'
import CartItem from '@/components/ajaxCart/cartItem'

const selectors = {
  list: '[data-list]'
}

export default class CartBody extends BaseComponent {
  static TYPE = 'cart-body'

  #muteUpdateSync: boolean
  cartData: LiteCart
  list: HTMLElement
  itemInstances: CartItem[]

  constructor(el: HTMLElement, cartData: LiteCart) {
    super(el, {
      watchCartUpdate: true,
    })

    this.#muteUpdateSync = false

    this.cartData = cartData

    this.list = this.qs(selectors.list)

    this.onItemRemoveClick = this.onItemRemoveClick.bind(this)
    this.onItemQuantityAdjusterChange = this.onItemQuantityAdjusterChange.bind(this)

    this.itemInstances = this.qsa(CartItem.SELECTOR).map((el, i) => this.createCartItemInstance(el, this.cartData.items[i]))
  }

  createCartItemInstance(el: HTMLElement, itemData: LiteLineItem) {
    return new CartItem(el, itemData, {
      onRemoveClick: this.onItemRemoveClick,
      onQuantityAdjusterChange: this.onItemQuantityAdjusterChange
    })
  }

  cleanupItemInstance(item: CartItem) {
    item.destroy()
    item.el.remove()
  }

  performItemInstanceRemoval(removalInstance: CartItem) {
    if (!removalInstance) return

    // Remove from the itemInstances array
    this.itemInstances = this.itemInstances.filter(instance => instance !== removalInstance)
    
    // Animate the removal and then clean up the instance
    slideUp(removalInstance.el, {
      duration: 0.45,
      onInterrupt: () => {
        this.cleanupItemInstance(removalInstance)
      },
      onComplete: () => {
        this.cleanupItemInstance(removalInstance)
      }
    })    
  }

  performItemInstanceUpdate(updateInstance: CartItem, newItemData: LiteLineItem) {
    if (!updateInstance) return

    // Update the item instance with the new data
    updateInstance.update(newItemData)
  }

  performItemInstanceAddition(newItemData: LiteLineItem, newIndex: number) {
    if (!newItemData) return

    const newItemEl = getDomFromString(newItemData.item_html).querySelector(CartItem.SELECTOR) as HTMLElement
    const newItemInstance = this.createCartItemInstance(newItemEl, newItemData)
    
    // Insert to list DOM
    this.list.insertBefore(newItemInstance.el, this.itemInstances[newIndex]?.el || null)
    
    // Insert to array of cart item instances
    this.itemInstances.splice(newIndex, 0, newItemInstance)
  }

  onItemChangeSuccess(updatedItem: CartItem, newCartData: LiteCart) {
    // Item change success doesn't affect the order of the items so we can get the updated item data from the itemInstances array by index
    const itemIndex = this.itemInstances.indexOf(updatedItem)
    const newItemData = newCartData.items[itemIndex]

    if (newItemData) {
      this.performItemInstanceUpdate(updatedItem, newItemData)
    }
    
    this.cartData = newCartData
  }

  onItemRemoveSuccess(removedItem: CartItem, newCartData: LiteCart) {
    this.performItemInstanceRemoval(removedItem)

    this.cartData = newCartData
  }

  /**
   * Synchronizes the cart UI with new cart data received from an update event
   * @param e - Cart update event containing new cart data
   * @param e.detail.cart - The new cart data
   * @param e.detail.cart.items - Array of cart items
   * @param e.detail.cart.items[].id - Unique identifier for cart item
   * @param e.detail.cart.items[].item_html - HTML string representation of cart item
   */
  syncCart(e: CartAPIEvent) {
    const newCartData = e.detail.cart

    // First handle additions and updates
    newCartData.items.forEach((newItemData, newIndex) => {
      let found = false

      this.itemInstances.forEach(itemInstance => {
        if (newItemData.id === itemInstance.id) {
          found = true
          
          this.performItemInstanceUpdate(itemInstance, newItemData)
        }
      })

      // If item wasn't found, it's new - add it
      if (!found) {
        this.performItemInstanceAddition(newItemData, newIndex)
      }
    })

    // Then handle removals - find items that exist in current cart but not in new cart
    this.itemInstances.forEach(itemInstance => {
      const stillExists = newCartData.items.some(newItemData => newItemData.id === itemInstance.id)
      
      if (!stillExists) {
        this.performItemInstanceRemoval(itemInstance)
      }
    })

    this.cartData = newCartData
  }  

  onCartUpdate(e: CartAPIEvent) {
    if (this.#muteUpdateSync) return

    this.syncCart(e)
  }

  async onItemRemoveClick(item: CartItem) {
    item.state = 'removing'

    try {
      this.#muteUpdateSync = true

      const cart = await CartAPI.changeLineItemQuantity(item.key, 0)

      this.onItemRemoveSuccess(item, cart)
    }
    catch (error) {
      console.error('Error removing item', error)      
    }
    finally {
      this.#muteUpdateSync = false
    }
  }

  async onItemQuantityAdjusterChange(item: CartItem, q: number) {
    item.state = q === 0 ? 'removing' : 'updating'

    try {
      this.#muteUpdateSync = true

      const cart = await CartAPI.changeLineItemQuantity(item.key, q)

      if (q === 0) {
        this.onItemRemoveSuccess(item, cart)
      }
      else {
        this.onItemChangeSuccess(item, cart)
      }
    }
    catch (error) {
      item.state = undefined
      item.quantityAdjuster.value = item.itemData.quantity // Reset the quantity adjuster to the original quantity

      console.error('Error updating item quantity', error)
    }
    finally {
      if (q > 0) {
        item.state = undefined
      }
    
      this.#muteUpdateSync = false
    }
  }
}