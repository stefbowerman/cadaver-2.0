export default class KlaviyoAPI {
  constructor({ companyId, revision } = {}) {
    this.companyId = companyId
    this.revision = revision || '2024-02-15'

    if (!this.companyId) {
      console.warn(`[KlaviyoAPI] - Public API Key required`) // eslint-disable-line no-console
    }
  }

  phoneNumberIsValid(number) {
    if (!number) return false
  
    number = number.replace(/\D/g, '') // Remove non-numeric characters
  
    return number.length && number.length >= 10
  }
  
  sanitizePhoneNumber(number) {
    let sanitized = number.replace(/\D/g, '') // Remove non-numeric characters
  
    if (sanitized.length === 10) {
      sanitized = `1${sanitized}` // Add "1" if there's no country code, assume US
    }

    if (sanitized[0] !== '+') {
      sanitized = `+${sanitized}` // Add "+"
    }    
    
    return sanitized
  }  

  makeRequest(urlBase, data) {
    const promise = $.Deferred()

    $.ajax({
      async: true,
      crossDomain: true,
      url: `${urlBase}?company_id=${this.companyId}`,
      method: 'POST',
      headers: {
        'revision': this.revision,
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      },
      data: JSON.stringify(data)
    })
      .done((response, textStatus, jqXHR) => {
        // The new Klaviyo API endpoints don't return anything in the response
        const success = textStatus === 'success' || jqXHR.status === 202

        promise.resolve(success)
      })
      .fail((jqXHR, textStatus) => {
        let errors = [];

        if (jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.hasOwnProperty('errors')) {
          errors = jqXHR.responseJSON.errors;
        }

        promise.reject({
          message: 'Something went wrong',
          errors
        })
      })
      
    return promise
  }

  // See: https://developers.klaviyo.com/en/reference/create_client_subscription
  createClientSubscription({ email, phone, source, listId }) {
    // Email and List ID are requred
    if (!email || !listId) {
      return 
    }

    const urlBase = 'https://a.klaviyo.com/client/subscriptions/'
    const profileAttributes = {
      email
    }

    if (this.phoneNumberIsValid(phone)) {
      phone = this.sanitizePhoneNumber(phone)

      profileAttributes.phone_number = phone
    }

    const data = {
      data: {
        type: 'subscription',
        attributes: {
          custom_source: source || null,
          profile: {
            data: {
              type: 'profile',
              attributes: profileAttributes
            }
          }
        },
        relationships: {
          list: {
            data: {
              type: 'list',
              id: listId
            }
          }
        }
      }
    }
    
    return this.makeRequest(urlBase, data)
  }

  // see: https://developers.klaviyo.com/en/reference/create_client_back_in_stock_subscription
  createBackInStockSubscription({ email, phone, variant, external_id }) {
    // Email and variant are requred
    if (!email || !variant) {
      return 
    }

    const urlBase = 'https://a.klaviyo.com/client/back-in-stock-subscriptions/'

    const channels = ['EMAIL']
    const profileAttributes = {
      email
    }

    if (external_id) {
      profileAttributes.external_id = external_id
    }

    if (this.phoneNumberIsValid(phone)) {
      phone = this.sanitizePhoneNumber(phone)

      profileAttributes.phone_number = phone
      channels.push('SMS')
    }    

    const data = {
      data: {
        type: 'back-in-stock-subscription',
        attributes: {
          channels,
          profile: {
            data: {
              type: 'profile',
              attributes: profileAttributes
            }
          }
        },
        relationships: {
          variant: {
            data: {
              type: 'catalog-variant',
              id: `$shopify:::$default:::${variant}`
            }
          }
        }
      }
    }    

    return this.makeRequest(urlBase, data)
  }
}