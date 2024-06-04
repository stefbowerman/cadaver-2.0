import { Core as TaxiCore } from '@unseenco/taxi'
import { throttle } from 'throttle-debounce'
import 'lazysizes'
import 'swiper/css'
import 'swiper/css/effect-fade'

import { initialize as initializeBreakpoints } from './core/breakpoints'
import { initialize as initializeAnimations } from './core/animations'
import { pageLinkFocus } from './core/a11y'
import {
  userAgentBodyClass,
  isThemeEditor,
  setViewportHeightProperty,
  targetBlankExternalLinks
} from './core/utils'

// Renderers
import BaseRenderer from './renderers/base'
import CartRenderer from './renderers/cart'

// Transitions
import PageTransition from './transitions/page'

// Sections
import SectionManager from './core/sectionManager'
import HeaderSection from './sections/header'
import FooterSection from './sections/footer'
import MobileMenuSection from './sections/mobileMenu'
import AJAXCartSection from './sections/ajaxCart'

// Use this to expose anything needed throughout the rest of the app
window.app = window.app || {};
window.app.taxi = null;

window.lazySizes && window.lazySizes.init();

(($) => {
  if (typeof $ === undefined) {
    console.warn('jQuery must be loaded before app.js')
  }

  const $window = $(window)
  const $body = $(document.body)
  const $main = $('main#view-container')
  const TEMPLATE_REGEX = /(^|\s)template-\S+/g;  

  initializeBreakpoints()
  initializeAnimations()

  const sectionManager = new SectionManager()

  sectionManager.register('header', HeaderSection)
  sectionManager.register('footer', FooterSection)
  sectionManager.register('mobile-menu', MobileMenuSection)
  sectionManager.register('ajax-cart', AJAXCartSection)

  // START Taxi
  if (isThemeEditor()) {
    $('a').attr('data-taxi-ignore', true) // Prevent highway js from running inside the theme editor
  }

  const taxi = new TaxiCore({
    renderers: {
      default: BaseRenderer,
      index: BaseRenderer,
      collection: BaseRenderer,
      product: BaseRenderer,
      page: BaseRenderer,
      blog: BaseRenderer,
      article: BaseRenderer,
      search: BaseRenderer,
      addresses: BaseRenderer,
      login: BaseRenderer,
      password: BaseRenderer,
      'list-collections': BaseRenderer,
      account: BaseRenderer,
      register: BaseRenderer,
      order: BaseRenderer,
      'reset-password': BaseRenderer,
      error: BaseRenderer,

      cart: CartRenderer
    },
    transitions: {
      default: PageTransition
    },
    reloadJsFilter: (element) => {
      // Whitelist any scripts here that need to be reloaded on page change

      return element.dataset.taxiReload !== undefined || $main.has(element).length > 0
    }
  })


  // This event is sent before the `onLeave()` method of a transition is run to hide a `data-router-view`
  taxi.on('NAVIGATE_OUT', ({ from, trigger }) => {
    for (let [key] of taxi.cache) {
      if (key.split('/').includes('products') || key.split('/').includes('account')) {
        taxi.cache.delete(key)
      }
    }

    $window.trigger($.Event('taxi.navigateOut', { from, trigger }))
  })
  
  // This event is sent everytime a `data-taxi-view` is added to the DOM
  taxi.on('NAVIGATE_IN', ({ to, trigger }) => {
    $body.removeClass((i, currentClasses) => {
      return currentClasses.split(' ').map(c => c.match(TEMPLATE_REGEX)).join(' ');
    });

    $body.addClass(() => {
      return to.page.body.classList.value.split(' ').map(c => c.match(TEMPLATE_REGEX)).join(' ');
    })

    $window.trigger($.Event('taxi.navigateIn', { to, trigger }))
  })

  // This event is sent everytime the `done()` method is called in the `onEnter()` method of a transition
  taxi.on('NAVIGATE_END', ({ to, from, trigger }) => {
    targetBlankExternalLinks();

    $window.trigger($.Event('taxi.navigateEnd', { to, from, trigger }))
  })

  window.app.taxi = taxi
  // END Taxi

  // a11y
  $('[data-in-page-link]').on('click', e => pageLinkFocus($(e.currentTarget.hash)));
  pageLinkFocus($(window.location.hash));  
  
  // We might not need these at some point?  If we switch to dvh units
  window.addEventListener('resize', throttle(250, setViewportHeightProperty))
  document.addEventListener('scroll', throttle(100, setViewportHeightProperty))  

  setViewportHeightProperty();
  userAgentBodyClass(); 
  targetBlankExternalLinks(); // All external links open in a new tab  

  if (window.history && window.history.scrollRestoration) {
    // Prevents browser from restoring scroll position when hitting the back button
    window.history.scrollRestoration = 'manual'
  }

  $(() => {
    document.body.classList.add('is-loaded')
  })
})(window.jQuery)