/* eslint-disable no-unused-vars */

import { Transition } from '@unseenco/taxi'
import { prefersReducedMotion } from '../core/utils/a11y'

export default class DefaultTransition extends Transition {
  /**
   * Handle the transition leaving the previous page.
   * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onLeave({ from, trigger, done }) {
    window.scrollTo && window.scrollTo(0, 0)

    if (prefersReducedMotion()) {
      // Disable transition animation ?
    }

    done()

    // $(from)
    //   .stop()
    //   .fadeOut({
    //     duration: 350,
    //     easing: 'easeOutQuart',
    //     complete: () => {
    //       window.scrollTo && window.scrollTo(0, 0);
    //       done()
    //     }
    //   })
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onEnter({ to, trigger, done }) {
    if (prefersReducedMotion()) {
      // Disable transition animation ?
    }

    done()

    // $(to)
    //   .stop()
    //   .hide()
    //   .fadeIn({
    //     duration: 450,
    //     easing: 'easeInCubic',
    //     complete: () => {
    //       done()
    //     }
    //   })  
  }
}
