import { dispatch } from '@/core/utils/event'

const CartAPI = {
  EVENTS: {
    UPDATE: 'cartAPI.update',
    ADD: 'cartAPI.add',
    CHANGE: 'cartAPI.change', // WHen a single item quantity is changed (not removed)
    REMOVE: 'cartAPI.remove'
  },

  routes: window.app.routes,

  dispatch(eventName, cart) {
    // Leaving this CartAPI.dispatch() here for backwards compatibility
    dispatch(eventName, { cart })
  },  

  /**
   * Retrieve a JSON respresentation of the users cart
   *
   * @return {Promise} - JSON cart
   */
  async getCart() {
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
      throw new Error('Could not retrieve cart items', e);
    }
  },

  /**
   * AJAX submit an 'add to cart' form
   *
   * @param {HTMLFormElement} form - The form element
   * @return {Promise} - Resolve returns JSON cart | Reject returns an error message
   */
  // @TODO - Add return value here
  async addItemFromForm(form) {
    try {
      const formData = new FormData(form)
      const body = new URLSearchParams([...formData].filter(([_, value]) => value !== '' && value != null)) // Remove empty values
  
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
   * @param {String} id - Cart line item id // https://shopify.dev/docs/api/liquid/objects/line_item#line_item-id
   * @param {Integer} qty - New quantity of the variant
   * @return {Promise} - JSON cart
   */
  async changeLineItemQuantity(id, qty) {
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