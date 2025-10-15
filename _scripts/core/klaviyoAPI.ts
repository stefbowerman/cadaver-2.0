import { type Core } from '@unseenco/taxi'

// @TODO - Move this to app.ts once that file gets converted to TypeScript
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

const companyId = window.app?.klaviyo?.companyId
const listId = window.app?.klaviyo?.listId

if (!companyId) {
  console.warn('[KlaviyoAPI] - Klaviyo company ID not found')
}

if (!listId) {
  console.warn('[KlaviyoAPI] - Klaviyo list ID not found')
}

const KlaviyoAPI = {
  async makeRequest(path: string, data: Record<string, unknown>) {
    try {
      const response = await fetch(`https://a.klaviyo.com${path}?company_id=${companyId}`, {
        method: 'POST',
        headers: {
          'revision': '2024-07-15',
          'content-type': 'application/json',
          'cache-control': 'no-cache'
        },
        body: JSON.stringify(data)
      })

      const success = response.ok || response.status === 202 // The new Klaviyo API endpoints don't return any data in the response

      return success
    }
    catch (error) {
      return {
        message: 'Something went wrong',
        errors: [error as string]
      }
    }
  },

  // See: https://developers.klaviyo.com/en/reference/create_client_subscription
  createClientSubscription({ email, source }: { email: string, source?: string }) {
    // Email and List ID are requred
    if (!email || !listId) {
      return 
    }

    const profileAttributes = {
      email
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
    
    return this.makeRequest('/client/subscriptions', data)
  },

  // see: https://developers.klaviyo.com/en/reference/create_client_back_in_stock_subscription
  createBackInStockSubscription({ email, variant, external_id }: { email: string, variant: string, external_id?: string }) {
    // Email and variant are requred
    if (!email || !variant) {
      return 
    }

    const channels = ['EMAIL']
    const profileAttributes: Record<string, string> = {
      email
    }

    if (external_id) {
      profileAttributes.external_id = external_id
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

    return this.makeRequest('/client/back-in-stock-subscriptions', data)
  }  
}

export default KlaviyoAPI