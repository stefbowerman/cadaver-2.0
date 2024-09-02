import { Core as TaxiCore } from '@unseenco/taxi'
import 'lazysizes'
import 'swiper/css'
import 'swiper/css/effect-fade'

import { initialize as initializeBreakpoints } from './core/breakpoints'
import { initialize as initializeAnimations } from './core/animations'
import { pageLinkFocus } from './core/a11y'
import {
  userAgentBodyClass,
  isThemeEditor,
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

  window.$window = $(window) // Create a global $window variable to trigger events through
  window.$body = $(document.body) // Global $body variable so we don't need to redefine it in every component

  const viewContainer = document.querySelector('main#view-container')
  const TEMPLATE_REGEX = /\btemplate-\w*/

  initializeBreakpoints()
  initializeAnimations()

  const sectionManager = new SectionManager()

  sectionManager.register('header', HeaderSection)
  sectionManager.register('footer', FooterSection)
  sectionManager.register('mobile-menu', MobileMenuSection)
  sectionManager.register('ajax-cart', AJAXCartSection)

  // START Taxi
  if (isThemeEditor()) {
    // Prevent taxi js from running
    Array.from(document.getElementsByTagName('a')).forEach(a => a.setAttribute('data-taxi-ignore', true))
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

      return element.dataset.taxiReload !== undefined || viewContainer.contains(element)
    },
    allowInterruption: true
  })


  // This event is sent before the `onLeave()` method of a transition is run to hide a `data-router-view`
  taxi.on('NAVIGATE_OUT', e => {
    // const { from, trigger } = e

    window.dispatchEvent(new CustomEvent('taxi.navigateOut', { detail: e }))
  })
  
  // This event is sent everytime a `data-taxi-view` is added to the DOM
  taxi.on('NAVIGATE_IN', e => {
    const { to } = e

    const body = document.body

    // Remove any body classes that match the template regex
    Array.from(body.classList).forEach(cn => {
      if (TEMPLATE_REGEX.test(cn)) {
        body.classList.remove(cn)
      }
    })

    // Add any body classes for the *new* page that match the template regex
    Array.from(to.page.body.classList).forEach(cn => {
      if (TEMPLATE_REGEX.test(cn)) {
        body.classList.add(cn)
      }
    })

    window.dispatchEvent(new CustomEvent('taxi.navigateIn', { detail: e }))
  })

  // This event is sent everytime the `done()` method is called in the `onEnter()` method of a transition
  taxi.on('NAVIGATE_END', e => {
    // const { to, from, trigger } = e

    taxi.cache.forEach((_, key) => {
      if (key.includes('products') || key.includes('account')) {
        taxi.cache.delete(key)
      }
    })

    targetBlankExternalLinks()

    window.dispatchEvent(new CustomEvent('taxi.navigateEnd', { detail: e }))
  })

  window.app.taxi = taxi
  // END Taxi

  // a11y
  $('[data-in-page-link]').on('click', e => pageLinkFocus($(e.currentTarget.hash)));
  pageLinkFocus($(window.location.hash));  

  userAgentBodyClass(); 
  targetBlankExternalLinks(); // All external links open in a new tab  

  if (window.history && window.history.scrollRestoration) {
    // Prevents browser from restoring scroll position when hitting the back button
    window.history.scrollRestoration = 'manual'
  }

  document.body.classList.add('is-loaded')
})(window.jQuery)