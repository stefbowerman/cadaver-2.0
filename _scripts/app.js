import { Core as TaxiCore } from '@unseenco/taxi'
import 'lazysizes'
import 'swiper/css'
import 'swiper/css/effect-fade'

import BreakpointsController from './core/breakpointsController'
import { initialize as initializeAnimations } from './core/animations'
import {
  userAgentBodyClass,
  isThemeEditor,
  targetBlankExternalLinks
} from './core/utils'

// Renderers
import BaseRenderer from './renderers/base'
import CartRenderer from './renderers/cart'

// Transitions
import DefaultTransition from './transitions/default'

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

function init() {
  if (typeof $ === undefined) {
    console.warn('jQuery must be loaded before app.js')
  }

  const viewContainer = document.querySelector('main#view-container')
  const TEMPLATE_REGEX = /\btemplate-\w*/

  window.app.breakpointsController = new BreakpointsController()
  initializeAnimations()

  const sectionManager = new SectionManager()

  sectionManager.register(HeaderSection)
  sectionManager.register(FooterSection)
  sectionManager.register(MobileMenuSection)
  sectionManager.register(AJAXCartSection)

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
      default: DefaultTransition
    },
    reloadJsFilter: (element) => {
      // Whitelist any scripts here that need to be reloaded on page change

      return element.dataset.taxiReload !== undefined || viewContainer.contains(element)
    },
    allowInterruption: true,
    enablePrefetch: true
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
      if (key.includes('products') || key.includes('account') || key.includes('cart')) {
        taxi.cache.delete(key)
      }
    })

    targetBlankExternalLinks()

    window.dispatchEvent(new CustomEvent('taxi.navigateEnd', { detail: e }))
  })

  window.app.taxi = taxi
  // END Taxi

  userAgentBodyClass(); 
  targetBlankExternalLinks(); // All external links open in a new tab  

  if (window.history && window.history.scrollRestoration) {
    // Prevents browser from restoring scroll position when hitting the back button
    window.history.scrollRestoration = 'manual'
  }

  document.body.classList.add('is-loaded')

  if (isThemeEditor()) {
    document.documentElement.classList.add('is-theme-editor')
  }  
}

document.addEventListener('DOMContentLoaded', init)