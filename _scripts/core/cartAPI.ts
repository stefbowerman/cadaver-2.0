import { type Core } from '@unseenco/taxi'
import { dispatch } from '@/core/utils/event'
import type { LiteCart } from '@/types/shopify'

declare global {
  interface Window {
    app?: {
      strings: {
        addToCart: string
        soldOut: string
        unavailable: string
        adding: string
        added: string
      };
      routes: {
        root_url: string
        predictive_search_url: string
        cart_add_url: string
        cart_change_url: string
        cart_update_url: string
        cart_clear_url: string
        cart_url: string
        account_addresses_url: string
        account_url: string
      };      
      taxi?: Core & {
        navigateTo: (url: string) => void;
      };
      klaviyo?: {
        companyId: string
        listId: string
      };      
    };
  }
}

export type CartAPIEvent = CustomEvent<{
  cart: LiteCart
}>

const CartAPI = {
  EVENTS: {
    UPDATE: 'cartAPI.update',
    ADD: 'cartAPI.add',
    CHANGE: 'cartAPI.change', // WHen a single item quantity is changed (not removed)
    REMOVE: 'cartAPI.remove'
  },

  routes: window.app.routes,

  dispatch(eventName: string, cart: LiteCart) {
    dispatch(eventName, { cart }) // Leaving this CartAPI.dispatch() here for backwards compatibility
  },

  /**
   * Retrieve a JSON respresentation of the users cart
   *
   */
  async getCart(): Promise<LiteCart> {
    try {
      const response = await fetch(`${this.routes.cart_url}?view=json`, {
        method: 'GET',
      })

      let data = await response.text()

      // Theme editor adds HTML comments to JSON response, strip these
      data = data.replace(/<\/?[^>]+>/gi, '')

      const cart = JSON.parse(data)

      return cart
    }
    catch (e) {
      throw new Error(`Could not retrieve cart items: ${e.message}`);
    }
  },

  /**
   * AJAX submit an 'add to cart' form
   *
   */
  async addItemFromForm(form: HTMLFormElement): Promise<LiteCart> {
    try {
      const formData = new FormData(form)
      const body = new URLSearchParams(
        [...formData].filter(([_, value]) => value !== '' && value != null)
          .map(([key, value]) => [key, value.toString()])
      )
  
      const response = await fetch(`${this.routes.cart_add_url}.js`, {
        method: 'POST',
        body,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
  
      if (!response.ok) {
        throw new Error('The quantity you entered is not available.')
      }

      // const addedItem = await response.text() // @TODO - Merge this with the cart response somehow... ? is it needed?
      const cart = await this.getCart() // Retrieve the updated cart

      this.dispatch(CartAPI.EVENTS.UPDATE, cart)
      this.dispatch(CartAPI.EVENTS.ADD, cart)
      
      return cart
    }
    catch (error) {
      throw new Error(error.message || 'An error occurred while adding the item to the cart.');

      /*
        @TODO - Add fail event - something like this:
        
        const event = new CustomEvent(events.ADD_FAIL, { detail: {
          message: data.message,
          description: data.description,
          relatedTarget: form
        }})

        window.dispatchEvent(event)
      */
    }
  },

  /**
   * Change the quantity of an item in the users cart
   * Item is specified by line_item key
   * https://shopify.dev/api/ajax/reference/cart#post-locale-cart-change-js
   *
   * @param id - Cart line item id // https://shopify.dev/docs/api/liquid/objects/line_item#line_item-id
   * @param qty - New quantity of the variant
   */
  async changeLineItemQuantity(id: number, qty: number): Promise<LiteCart> {
    try {
      const response = await fetch(`${this.routes.cart_change_url}.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `quantity=${qty}&id=${id}`,
      })

      if (!response.ok) {
        throw new Error('Something went wrong.')
      }

      const cart = await this.getCart() // Retrieve the updated cart

      const EVENT = qty === 0 ? CartAPI.EVENTS.REMOVE : CartAPI.EVENTS.CHANGE
      
      this.dispatch(EVENT, cart)
      this.dispatch(CartAPI.EVENTS.UPDATE, cart)  

      return cart
    }
    catch (error) {
      return Promise.reject({ message: error.message })
    }
  }
}

export default CartAPI