import { changeLineItemQuantity } from '../core/cartAPI'

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

const namespace = '.ajaxCart'

export const selector = '[data-ajax-cart]'

export const events = {
  CLICK: `click${namespace}`,
  RENDER: `render${namespace}`
}

export default class AJAXCart {
  constructor(el) {
    this.isOpen = false
    this.hasBeenRendered = false
    this.requestInProgress = false

    this.callbacks = {
      bodyToggleClick: this.onToggleClick.bind(this),
      bodyCloseClick: this.onCloseClick.bind(this),
      itemRemoveClick: this.onItemRemoveClick.bind(this),
      itemIncrementClick: this.onItemIncrementClick.bind(this),
      itemDecrementClick: this.onItemDecrementClick.bind(this)
    }      

    this.$el = $(el)
    this.$body = $(selectors.body, this.$el)
    this.$totalPrice = $(selectors.totalPrice, this.$el)

    this.$backdrop = $(document.createElement('div')).addClass(classes.backdrop)
    this.$backdrop.attr('title', 'Close Cart')
    this.$backdrop.appendTo($body)    

    this.$el.on(events.CLICK, selectors.itemRemove, this.callbacks.itemRemoveClick)
    this.$el.on(events.CLICK, selectors.itemIncrement, this.onItemIncrementClick.bind(this))
    this.$el.on(events.CLICK, selectors.itemDecrement, this.onItemDecrementClick.bind(this))    
    this.$backdrop.on(events.CLICK, this.close.bind(this))
    $body.on(events.CLICK, selectors.toggle, this.callbacks.bodyToggleClick)
    $body.on(events.CLICK, selectors.close, this.callbacks.bodyCloseClick)
  }

  destroy() {
    this.$backdrop.remove()
    $body.off(events.CLICK, selectors.toggle, this.callbacks.bodyToggleClick)
    $body.off(events.CLICK, selectors.close, this.callbacks.bodyCloseClick)
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
      html += $.map(cart.items, this.itemTemplate.bind(this)).join('')
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
    const $target = $(target);
    const $el = $target.is(selectors.item) ? $target : $target.parents(selectors.item);

    return {
      $el: $el,
      key: $el.data('key'),
      qty: this.validateQty($el.data('qty'))
    };
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
      this.$el.addClass(classes.empty)
    }
    else {
      this.$el.removeClass(classes.empty)

      if (slot === 'body') {
        this.$body.html(this.bodyTemplate(cart))
      }
      else if (slot === 'price') {
        this.$totalPrice.html(cart.total_price_formatted)
      }
      else {
        this.$body.html(this.bodyTemplate(cart))
        this.$totalPrice.html(cart.total_price_formatted)
      }
    }    

    $window.trigger($.Event(events.RENDER, { cart }));

    this.hasBeenRendered = true;

    return this;
  }

  /**
   * Update the quantity for a single item in the cart
   *
   * @param {jQuery} $item - cart line item element
   * @param {integer} line - cart line item data object
   * @return this
   */
  renderItemInfo($el, line) {
    if (!line) return 

    $el.data('qty', line.quantity) // 
    $el.attr('data-qty', line.quantity)
    $el.find('.ajax-cart__item-info').html(this.itemInfoTemplate(line))
  }  

  toggle() {
    return this.isOpen ? this.close() : this.open()
  }  

  open() {
    if (this.isOpen) return

    this.$el.addClass(classes.open)
    $body.addClass(classes.bodyCartOpen)
    this.isOpen = true
  }

  close() {
    if (!this.isOpen) return

    this.$el.removeClass(classes.open)
    $body.removeClass(classes.bodyCartOpen)
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

    if ($(e.currentTarget).hasClass(classes.adjusterButtonDisabled)) {
      return
    }

    const { key, qty, $el } = this.getItemAttributes(e.target)
    
    this.adjustQuantity(key, qty+1, $el)    
  }

  onItemDecrementClick(e) {
    e.preventDefault();

    if ($(e.currentTarget).hasClass(classes.adjusterButtonDisabled)) {
      return
    }

    const { key, qty, $el } = this.getItemAttributes(e.target)
    
    this.adjustQuantity(key, qty-1, $el)
  }  

  /**
   * Remove the item from the cart.  Extract this into a separate method if there becomes more ways to delete an item
   *
   * @param {event} e - Click event
   */
  onItemRemoveClick(e) {
    e.preventDefault();

    const { key, $el } = this.getItemAttributes(e.target)

    this.adjustQuantity(key, 0, $el)
  }

  adjustQuantity(key, newQty, $item) {
    if (this.requestInProgress) {
      return
    }

    this.requestInProgress = true

    const itemClass = classes[newQty === 0 ? 'itemIsBeingRemoved' : 'itemRequestInProgress']

    $item.addClass(itemClass)

    if (newQty < 0) {
      newQty = 0
    }

    changeLineItemQuantity(key, newQty)
      .then((cart) => {
        if (cart.item_count > 0 && newQty === 0) {
          $item.slideUp({
            duration: 300,
            easing: 'easeOutQuart',
            
            // We only need to re-render the price and then remove the item
            start: () => {
              this.render(cart, 'price')
            },
            done: () => {
              $item.remove()
            }
          })
        }
        else {
          // Don't render the whole cart
          // Just render the price and the item details
          this.render(cart, 'price');
          this.renderItemInfo($item, cart.items.find(item => item.key === key))
          $item.removeClass(itemClass)
        }
      })
      .fail(() => {
        console.warn('something went wrong...');
      })
      .always(() => {
        this.requestInProgress = false
      })   
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