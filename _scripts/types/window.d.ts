import type { Core as TaxiCore } from '@unseenco/taxi'
import type BreakpointsController from '@/core/breakpointsController'

declare global {
  interface Window {
    Shopify?: {
      designMode?: boolean;
    }
    app: {
      strings?: {
        addToCart: string
        soldOut: string
        unavailable: string
        adding: string
        added: string
      };
      routes?: {
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
      taxi?: TaxiCore;
      klaviyo?: {
        companyId: string
        listId: string
      };
      breakpointsController?: BreakpointsController;
    };
  }
}

export {}
