/**
 * Animated tabs component with keyboard navigation and ARIA support.
 *
 * @example
 * <div data-component="tabs">
 *   <div role="tablist" aria-orientation="horizontal">
 *     {% render 'tabs-tab', tab_id: 'tab-1', panel_id: 'panel-1', label: 'Tab 1', selected: true %}
 *     {% render 'tabs-tab', tab_id: 'tab-2', panel_id: 'panel-2', label: 'Tab 2' %}
 *   </div>
 *
 *   <div data-tabpanels-wrapper>
 *     {% render 'tabs-tabpanel', tab_id: 'tab-1', panel_id: 'panel-1', content: 'Content 1', selected: true %}
 *     {% render 'tabs-tabpanel', tab_id: 'tab-2', panel_id: 'panel-2', content: 'Content 2' %}
 *   </div>
 * </div>
 *
 * Reference: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tab_role
 */

import BaseComponent from '@/components/base'
import gsap, { easings } from '@/core/gsap'
import { prefersReducedMotion, setAriaState } from '@/core/utils/a11y'

// @NOTE - Maybe move these to utils? as KEYS.ARROW_LEFT, etc..? 
const ARROW_LEFT_KEY = 'ArrowLeft'
const ARROW_RIGHT_KEY = 'ArrowRight'
const ARROW_UP_KEY = 'ArrowUp'
const ARROW_DOWN_KEY = 'ArrowDown'
const HOME_KEY = 'Home'
const END_KEY = 'End'

const selectors = {
  tabpanelsWrapper: '[data-tabpanels-wrapper]',
  tabList: '[role="tablist"]',
  tabs: 'button[role="tab"]',
  tabpanels: '[role="tabpanel"]'
}

// @NOTE - Maybe change this to "speed" so that we can calculate durations and clamp them to reasonable values?
interface TabsOptions {
  leaveDuration?: number
  enterDuration?: number
}

export default class Tabs extends BaseComponent {
  static TYPE = 'tabs'

  #transitionTl: gsap.core.Timeline | null
  settings: TabsOptions
  tablist: HTMLElement
  tabs: HTMLElement[]
  tabpanelsWrapper: HTMLElement
  tabpanels: HTMLElement[]
  currentTab: HTMLElement
  orientationVertical: boolean

  constructor(el: HTMLElement, options: TabsOptions = {}) {
    super(el)

    this.settings = {
      leaveDuration: 0.35,
      enterDuration: 0.5,
      ...options
    }

    this.#transitionTl = null

    this.tablist = this.qs(selectors.tabList)
    this.tabs = this.qsa(selectors.tabs)
    this.tabpanelsWrapper = this.qs(selectors.tabpanelsWrapper)
    this.tabpanels = this.qsa(selectors.tabpanels)
    this.currentTab = this.tabs.find(tab => tab.getAttribute('aria-selected') === 'true') as HTMLElement
    this.orientationVertical = this.tablist.getAttribute('aria-orientation') === 'vertical'

    if (!this.tabpanelsWrapper) {
      throw new Error('Tabpanels wrapper not found')
    }

    if (this.tabs.length === 0) {
      throw new Error('No tabs found')
    }

    this.onTabClick = this.onTabClick.bind(this)
    this.onTablistKeyDown = this.onTablistKeyDown.bind(this)

    this.tablist.addEventListener('keydown', this.onTablistKeyDown)
    this.tabs.forEach(tab => tab.addEventListener('click', this.onTabClick))

    if (!this.currentTab) {
      // Force the first tab+panel to be active
      this.setTabActive(this.tabs[0], true)
      this.currentTab = this.tabs[0]
      this.tabpanels[0].hidden = false
    }    
  }

  destroy() {
    this.#transitionTl?.kill()
    
    super.destroy()
  }

  setTabActive(tab: HTMLElement, active: boolean) {
    setAriaState(tab, 'aria-selected', active)
    tab.tabIndex = active ? 0 : -1
  }

  changeToTab(to: HTMLElement, immediate: boolean = false) {
    const currentPanel = this.tabpanels.find(panel => panel.getAttribute('aria-labelledby') === this.currentTab.id)
    const newPanel = this.tabpanels.find(panel => panel.getAttribute('aria-labelledby') === to.id)

    if (!currentPanel || !newPanel || currentPanel === newPanel) return

    this.setTabActive(this.currentTab, false)
    this.setTabActive(to, true)

    // Set currentTab immediately
    this.currentTab = to

    this.animatePanelChange(currentPanel, newPanel, { immediate })
  }

  animatePanelChange(currentPanel: HTMLElement, newPanel: HTMLElement, options: { immediate?: boolean } = {}) {
    this.#transitionTl?.kill()
    this.#transitionTl = null

    const immediate = options.immediate || prefersReducedMotion()
    const wrapperProps = 'height, overflow, position'
    const panelProps = 'opacity'

    // Reset inline styles GSAP may have set
    gsap.set(this.tabpanelsWrapper, { clearProps: wrapperProps })
    gsap.set(this.tabpanels, { clearProps: panelProps })

    // Reset to the initial state needed for this animation (leaving visible, entering hidden)
    // This is needed in case the tabs get changed quickly
    this.tabpanels.forEach(panel => {
      panel.hidden = panel !== currentPanel
    })

    // Animate panel change
    const wrapper = this.tabpanelsWrapper
    const leavingPanel = currentPanel
    const enteringPanel = newPanel
    const enterDuration = immediate ? 0.01 : this.settings.enterDuration
    const leaveDuration = immediate ? 0.01 : this.settings.leaveDuration
    const startDelay = leaveDuration * 0.75

    // Set the opacity of the entering panel to 0 but un-hide it so that we can measure it
    enteringPanel.hidden = false
    enteringPanel.style.opacity = '0'
    
    const fromHeight = leavingPanel.getBoundingClientRect().height
    const toHeight = enteringPanel.getBoundingClientRect().height

    // Freeze wrapper height
    gsap.set(wrapper, {
      height: fromHeight,
      overflow: 'hidden',
      position: 'relative'
    })
  
    // Position leaving panel absolutely so layout collapses to entering panel
    gsap.set(leavingPanel, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 1
    })

    const tl = gsap.timeline({
      paused: true,
      onStart: () => {
        wrapper.style.willChange = 'height'
      },
      onComplete: () => {
        wrapper.style.willChange = ''
        gsap.set(wrapper, { clearProps: wrapperProps })
        gsap.set(leavingPanel, { clearProps: panelProps })        
        leavingPanel.hidden = true
        enteringPanel.hidden = false
        enteringPanel.style.opacity = ''
      }
    })

    tl
      .to(leavingPanel, {
        opacity: 0,
        duration: leaveDuration,
        ease: 'power2.out'
      })
      .to(wrapper, {
        height: toHeight,
        duration: enterDuration,
        delay: startDelay * 0.5, // Start this a *little* bit earlier than the entering opacity
        ease: toHeight > fromHeight ? easings.slideEnter : easings.slideLeave,
      }, '<')
      .to(enteringPanel, {
        opacity: 1,
        duration: enterDuration,
        delay: startDelay,
        ease: 'power2.inOut'
      }, '<')

    this.#transitionTl = tl
    this.#transitionTl.play()
  }

  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tab_role#example
  onTabClick(e: MouseEvent) {
    const { target } = e

    if (!(target instanceof HTMLButtonElement) || target === this.currentTab) {
      return
    }

    this.changeToTab(target as HTMLElement)
  }

  onTablistKeyDown(e: KeyboardEvent) {
    if (!([ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, ARROW_DOWN_KEY, HOME_KEY, END_KEY].includes(e.key))) {
      return
    }

    let newIndex = 0
    const currentTabIndex = this.tabs.indexOf(this.currentTab)
 
    switch (e.key) {
      case this.orientationVertical ? ARROW_DOWN_KEY : ARROW_RIGHT_KEY:
        newIndex = (currentTabIndex + 1) % this.tabs.length
        break
      case this.orientationVertical ? ARROW_UP_KEY : ARROW_LEFT_KEY:
        newIndex = (currentTabIndex - 1 + this.tabs.length) % this.tabs.length
        break
      case HOME_KEY:
        newIndex = 0
        break
      case END_KEY:
        newIndex = this.tabs.length - 1
        break
      default:
        return // Exit if the key is not recognized
    }

    e.preventDefault()
    e.stopPropagation()
    
    const newTab = this.tabs[newIndex]

    this.changeToTab(newTab)

    newTab.focus({ preventScroll: true })
  }
}
