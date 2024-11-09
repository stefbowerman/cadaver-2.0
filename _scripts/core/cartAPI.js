import { getSizedImageUrl } from './utils/image'

/**
 * Formats the cart object to be consumed by the handlebars template
 *
 * @param {object} cart - JSON representation of the cart.  See https://help.shopify.com/themes/development/getting-started/using-ajax-api#get-cart
 * @return {object} 
 */
export const formatCart = (cart) => {
  if (cart && cart.is_formatted) {
    return cart;
  }

  // Make adjustments to the cart object contents before we pass it off to the handlebars template
  cart.items.map((item) => {
    item.image = getSizedImageUrl(item.image, '500x');
    item.imageV2.url = getSizedImageUrl(item.imageV2.url, '500x');    
    item.multiple_quantities = item.quantity > 1;

    // Adjust the item's variant options to add "name" and "value" properties
    if (item.hasOwnProperty('product')) {
      const product = item.product;

      for (let i = item.variant_options.length - 1; i >= 0; i--) {
        const name  = product.options[i];
        const value = item.variant_options[i];

        item.variant_options[i] = { name, value };

        // Don't show this info if it's the default variant that Shopify creates
        if (value === 'Default Title') {
          delete item.variant_options[i];
        }
      }
    }
    else {
      delete item.variant_options; // skip it and use the variant title instead
    }

    // Adjust the properties to be an array of name + value pairs for easier templating
    const propertiesArray = []

    for (const key in item.properties) {
      // Hide underscore-prefixed properties
      if (key[0] !== '_') {
        propertiesArray.push({
          name: key,
          value: item.properties[key]
        })
      }
    }

    item.properties = propertiesArray

    if (item.variant_title === 'Default Title') {
      item.variant_title = null
    }

    return item
  })

  cart.is_formatted = true

  return cart
}

const CartAPI = {
  events: {
    UPDATE: 'cartAPI.update'
    // @TODO - Add fail event
  },

  routes: window.app.routes,

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

      return formatCart(cart)
    }
    catch (e) {
      throw new Error('Could not retrieve cart items');
    }
  },

  /**
   * AJAX submit an 'add to cart' form
   *
   * @param {HTMLFormElement} form - The form element
   * @return {Promise} - Resolve returns JSON cart | Reject returns an error message
   */
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

      // eslint-disable-next-line no-unused-vars
      const addedItem = await response.text() // @TODO - Merge this with the cart response somehow..
      const cart = await this.getCart() // Retrieve the updated cart

      const event = new CustomEvent(this.events.UPDATE, {
        bubbles: true,
        detail: { cart }
      })
    
      window.dispatchEvent(event)
      
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

      const event = new CustomEvent(this.events.UPDATE, {
        bubbles: true,
        detail: { cart }
      })
    
      window.dispatchEvent(event)      

      return cart
    }
    catch (error) {
      return Promise.reject({ message: error.message })
    }
  }
}

export default CartAPI