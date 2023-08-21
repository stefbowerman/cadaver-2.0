import { Transition } from '@unseenco/taxi'

export default class PageTransition extends Transition {
  /**
   * Handle the transition leaving the previous page.
   * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onLeave({ from, trigger, done }) {
    $(from).fadeOut({
      duration: 400,
      easing: 'easeInQuart',
      complete: () => {
        window.scrollTo && window.scrollTo(0, 0);
        done()
      }
    })  
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onEnter({ to, trigger, done }) {
    $(to)
      .hide()
      .fadeIn({
        duration: 500,
        easing: 'easeOutCubic',
        complete: () => {
          done()
        }
      })  
  }
}
