/* eslint-disable no-unused-vars */

import { Transition } from '@unseenco/taxi'
import gsap from '../core/gsap'
import { prefersReducedMotion } from '../core/utils/a11y'

const DURATION_LEAVE = 0.2
const DURATION_ENTER = 0.5
const DELAY_ENTER = 0.15

/**
 * PageTransition handles smooth transitions between pages using GSAP animations.
 * It manages page exit and entry animations, handles scroll behavior, and maintains
 * proper document height during transitions to prevent layout jumps.
 * 
 * @extends {Transition}
 * @fires PageTransition#enter.transition - Fired when enter animation starts
 * @fires PageTransition#afterEnter.transition - Fired when enter animation completes
 * @fires PageTransition#leave.transition - Fired when leave animation starts
 * @fires PageTransition#afterLeave.transition - Fired when leave animation completes
 */
export default class PageTransition extends Transition {
  static events = {
    ENTER: 'enter.transition',
    AFTER_ENTER: 'afterEnter.transition',
    LEAVE: 'leave.transition',
    AFTER_LEAVE: 'afterLeave.transition'
  }

	constructor(args) {
		super(args)

    this.fromHeight = 0
    this.toHeight = 0

    this.autoScrollCompleteFlag = false
    this.autoScrollCleanup = null
    this.autoScrollTimeoutId = null
	}

  /**
   * Sets or removes height style on wrapper element
   * Only sets numeric height if autoScrollCompleteFlag is false
   * @param {number} [height] - Optional height in pixels. If omitted, height style is removed
   */
  setWrapperHeightIfNeeded(height) {   
    if (height !== undefined && !this.autoScrollCompleteFlag) {
      this.wrapper.style.height = `${height}px`
    }
    else {
      this.wrapper.style.height = ''
    }
  }

  /**
   * Smoothly scrolls the window to the top and returns a Promise that resolves when the scroll animation completes.
   * Uses the native scrollend event when available, otherwise falls back to a timeout-based approach.
   * 
   * @returns {Promise<void>} Resolves when the scroll animation completes
   */
  autoScrollToTop() {
    this.autoScrollCleanup?.()

    if (window.scrollY === 0) {
      this.autoScrollCompleteFlag = true
      return Promise.resolve()
    }

    const p = new Promise(resolve => {
      const onComplete = () => {
        this.autoScrollCompleteFlag = true
        resolve()
      }

      if ('onscrollend' in window) {
        // Modern browsers with scrollend support
        const handleScrollEnd = () => {
          window.removeEventListener('scrollend', handleScrollEnd)
          onComplete()
        }

        window.addEventListener('scrollend', handleScrollEnd, { once: true })

        this.autoScrollCleanup = () => {
          window.removeEventListener('scrollend', handleScrollEnd)
          this.autoScrollCompleteFlag = false
        }
      }
      else {
        // Fallback for browsers without scrollend support
        this.autoScrollTimeoutId = setTimeout(onComplete, 500)
        
        this.autoScrollCleanup = () => {
          clearTimeout(this.autoScrollTimeoutId)
          this.autoScrollCompleteFlag = false
        }
      }
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })

    return p
  }  

  /**
   * Handle the transition leaving the previous page.
   * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onLeave({ from, trigger, done }) { 
    this.fromHeight = from.clientHeight

    this.autoScrollCleanup?.()
    this.autoScrollToTop().then(() => {
      this.setWrapperHeightIfNeeded()
    })

    const onStart = () => {
      window.dispatchEvent(new CustomEvent(this.constructor.events.LEAVE))
    }

    const onComplete = () => {
      // If the scroll didn't complete yet, set the height of the wrapper to the height of the "from" element being removed
      // This is how we avoid the footer jump
      this.setWrapperHeightIfNeeded(this.fromHeight)

      window.dispatchEvent(new CustomEvent(this.constructor.events.AFTER_LEAVE)) 

      done()
    }     

    if (prefersReducedMotion()) {
      onStart()
      return onComplete()
    }

    gsap.killTweensOf(from)
    gsap.to(from, {
      duration: DURATION_LEAVE,
      ease: 'power1.out',
      opacity: 0,
      onStart,
      onComplete
    })
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onEnter({ to, trigger, done }) {   
    this.toHeight = to.clientHeight

    if (this.toHeight > this.fromHeight) {
      this.setWrapperHeightIfNeeded(this.toHeight)
    }

    const onStart = () => {
      window.dispatchEvent(new CustomEvent(this.constructor.events.ENTER))
    }    

    const onComplete = () => {
      this.autoScrollCleanup?.()

      gsap.set(to, {
        clearProps: true
      })

      this.wrapper.style.height = ''

      done()
    }    

    if (prefersReducedMotion()) {
      onStart()
      return onComplete()
    }

    gsap.killTweensOf(to)

    gsap.fromTo(to, { opacity: 0 }, {
      duration: DURATION_ENTER,
      delay: DELAY_ENTER,
      ease: 'power3.out',
      y: 0,
      opacity: 1,
      onStart,
      onComplete
    })
  }
}
