import { Core as TaxiCore } from '@unseenco/taxi'
import 'swiper/css'
import 'swiper/css/effect-fade'

import BreakpointsController from './core/breakpointsController'

import {
  isThemeEditor,
  targetBlankExternalLinks
} from './core/utils'
import { dispatch } from './core/utils/event'

// Renderers
import BaseRenderer from './renderers/base'

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

function init() {
  const viewContainer = document.querySelector('main#view-container')
  const TEMPLATE_REGEX = /\btemplate-\w*/

  // Initialize all global controllers before starting Taxi and registering sections
  window.app.breakpointsController = new BreakpointsController()

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
      default: BaseRenderer
    },
    transitions: {
      default: PageTransition
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

    dispatch('taxi.navigateOut', e)
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

    dispatch('taxi.navigateIn', e)
  })

  // This event is sent everytime the `done()` method is called in the `onEnter()` method of a transition
  taxi.on('NAVIGATE_END', e => {
    // const { to, from, trigger } = e

    taxi.clearCache('/cart')
    taxi.cache.forEach((_, key) => {
      if (key.includes('products') || key.includes('account') || key.includes('cart')) {
        taxi.cache.delete(key)
      }
    })

    targetBlankExternalLinks()

    dispatch('taxi.navigateEnd', e)
  })

  window.app.taxi = taxi
  // END Taxi

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