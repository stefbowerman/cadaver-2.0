import type { Core as TaxiCore } from '@unseenco/taxi'
import type BreakpointsController from '@/core/breakpointsController'
import type { BreakpointChangeEvent } from '@/core/breakpointsController'
import type LazyImageController from '@/core/lazyImageController'
import type { CartAPIEvent } from '@/core/cartAPI'
import type {
  ThemeEditorBlockSelectEvent,
  ThemeEditorBlockDeselectEvent,
} from '@/types/shopify'
import type {
  TaxiNavigateOutEvent,
  TaxiNavigateInEvent,
  TaxiNavigateEndEvent,
} from '@/types/taxi'

declare global {
  interface WindowEventMap {
    'change.breakpointsController': BreakpointChangeEvent
    'cartAPI.update': CartAPIEvent
    'cartAPI.add': CartAPIEvent
    'cartAPI.change': CartAPIEvent
    'cartAPI.remove': CartAPIEvent
    'shopify:block:select': ThemeEditorBlockSelectEvent
    'shopify:block:deselect': ThemeEditorBlockDeselectEvent
    'taxi.navigateOut': TaxiNavigateOutEvent
    'taxi.navigateIn': TaxiNavigateInEvent
    'taxi.navigateEnd': TaxiNavigateEndEvent
  }

  interface Window {
    Shopify?: {
      designMode?: boolean;
      CountryProvinceSelector: any
    }
    app: {
      strings?: Record<string, string>;
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
      taxi?: TaxiCore | null;
      klaviyo?: {
        companyId: string
        listId: string
      };
      breakpointsController?: BreakpointsController;
      lazyImageController?: LazyImageController;
    };
  }
}

export {}
