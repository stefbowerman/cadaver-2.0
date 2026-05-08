import gsap from 'gsap'
import CustomEase from 'gsap/CustomEase'

import { isVisible } from '@/core/utils/dom'
import { prefersReducedMotion } from '@/core/utils/a11y'

export const easings = {
  slideEnter: 'slideEnter',
  slideLeave: 'slideLeave',
  easeInOutCubic: 'easeInOutCubic'
}

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2
const RECIPROCAL_GR = 1 / GOLDEN_RATIO
const DURATION = RECIPROCAL_GR

gsap.config({
  autoSleep: 60,
  nullTargetWarn: false
})

gsap.registerPlugin(CustomEase)

CustomEase.create(easings.slideEnter, 'M0,0 C0.636,0.103 0.237,1 1,1')
CustomEase.create(easings.slideLeave, 'M0,0 C0.379,0.029 0.124,0.983 1,1')
CustomEase.create(easings.easeInOutCubic, 'M0,0 C0.636,0.103 0.237,1 1,1') // This is the same as slideEnter... maybe it should be different?

gsap.defaults({
  duration: DURATION
})

export default gsap

// Returns a duration based on the distance of the animation
export const getDuration = (distance: number): number => {
  const duration = distance / 4000

  return gsap.utils.clamp(0.3, 0.9, duration)
}

type SlideOptions = {
  duration?: number
  onStart?: () => void
  onInterrupt?: () => void
  onComplete?: () => void
  opacityTarget?: HTMLElement
}

export const slideDown = (el: HTMLElement, options: SlideOptions = {}): gsap.core.Timeline => {
  const duration = prefersReducedMotion() ? 0.01 : (options.duration || 0.5)
  const display = el.style.display
  const opacityTarget = options.opacityTarget || el

  gsap.killTweensOf(el, 'height')
  gsap.killTweensOf(opacityTarget, 'opacity')

  const tl = gsap.timeline({
    onStart: () => {
      opacityTarget.style.opacity = '0'
      el.style.height = '0'
      el.style.display = ''

      options.onStart?.()
    },
    onInterrupt: () => {
      opacityTarget.style.opacity = ''
      el.style.height = ''
      el.style.display = display
      options.onInterrupt?.()
    },    
    onComplete: () => {
      opacityTarget.style.opacity = ''
      el.style.height = ''

      options.onComplete?.()
    }
  })

  // If it's already visible, don't run the animation
  if (isVisible(el)) {
    return tl
  }   

  tl.to(el, {
    height: 'auto',
    ease: easings.slideEnter,
    duration,
    onStart: () => {
      el.style.overflow = 'hidden'
    },
    onInterrupt: () => {
      el.style.overflow = ''
    },    
    onComplete: () => {
      el.style.overflow = ''
    }
  })
  .to(opacityTarget, {
    opacity: 1,
    ease: 'power2.in',
    duration: duration * 0.85,
    delay: duration * 0.15,
    onComplete: () => {
      opacityTarget.style.opacity = ''
    }
  }, '<')  

  return tl
}

export const slideUp = (el: HTMLElement, options: SlideOptions = {}): gsap.core.Timeline => {
  const duration = prefersReducedMotion() ? 0.01 : (options.duration || 0.5)
  const opacityTarget = options.opacityTarget || el

  gsap.killTweensOf(el, 'height')
  gsap.killTweensOf(opacityTarget, 'opacity')
  
  const tl = gsap.timeline({
    onStart: () => {
      options.onStart?.()
    },
    onInterrupt: () => {
      options.onInterrupt?.()
    },
    onComplete: () => {
      el.style.display = 'none'
      options.onComplete?.()
    }
  })

  if (!isVisible(el)) {
    return tl
  } 

  tl.to(opacityTarget, {
    opacity: 0,
    ease: 'power2.out',
    duration: duration * 0.85
  })
  .to(el, {
    height: 0,
    ease: easings.slideLeave,
    duration,
    onStart: () => {
      el.style.overflow = 'hidden'
    },
    onComplete: () => {
      el.style.overflow = ''
      el.style.height = ''
    }
  }, '<')

  return tl
}

export const slideToggle = (el: HTMLElement, options: SlideOptions = {}, force: boolean | undefined = undefined): gsap.core.Timeline => {
  if (force !== undefined) {
    return force ? slideDown(el, options) : slideUp(el, options)
  }
  else {
    return !isVisible(el) ? slideDown(el, options) : slideUp(el, options)
  }
}

type FadeOptions = {
  duration?: number
  ease?: string
  onStart?: () => void
  onInterrupt?: () => void
  onComplete?: () => void
}

export const fadeIn = (el: HTMLElement, options: FadeOptions = {}): gsap.core.Timeline => {
  const duration = prefersReducedMotion() ? 0.01 : (options.duration || 0.5)
  const display = el.style.display
  const ease = options.ease || 'power2.inOut'

  gsap.killTweensOf(el, 'opacity')

  const tl = gsap.timeline({
    onStart: () => {
      el.style.opacity = '0'
      el.style.display = ''
      options.onStart?.()
    },
    onInterrupt: () => {
      el.style.opacity = ''
      el.style.display = display
      options.onInterrupt?.()
    },
    onComplete: () => {
      el.style.opacity = ''
      options.onComplete?.()
    }
  })

  if (isVisible(el)) {
    return tl
  }

  tl.to(el, {
    opacity: 1,
    ease,
    duration
  })

  return tl
}

export const fadeOut = (el: HTMLElement, options: FadeOptions = {}): gsap.core.Timeline => {
  const duration = prefersReducedMotion() ? 0.01 : (options.duration || 0.5)
  const ease = options.ease || 'power2.inOut'

  gsap.killTweensOf(el, 'opacity')

  const tl = gsap.timeline({
    onStart: () => {
      options.onStart?.()
    },
    onInterrupt: () => {
      options.onInterrupt?.()
    },
    onComplete: () => {
      el.style.display = 'none'
      el.style.opacity = ''
      options.onComplete?.()
    }
  })

  if (!isVisible(el)) {
    return tl
  }  

  tl.to(el, {
    opacity: 0,
    ease,
    duration
  })

  return tl
}

export const fadeToggle = (el: HTMLElement, options: FadeOptions = {}, force: boolean | undefined = undefined): gsap.core.Timeline => {
  if (force !== undefined) {
    return force ? fadeIn(el, options) : fadeOut(el, options)
  }
  else {
    return !isVisible(el) ? fadeIn(el, options) : fadeOut(el, options)
  }
}

type SwapOptions = {
  disableAnimation?: boolean
  durationExit?: number
  durationEnter?: number
  delayEnter?: number
  onExitStart?: () => void
  onEnterStart?: () => void
  onExitComplete?: () => void
  onEnterComplete?: () => void,
  clearProps?: boolean
}

export const swap = (el: HTMLElement, options: SwapOptions = {}): gsap.core.Timeline => {
  const {
    disableAnimation = false,
    durationExit = 0.2,
    durationEnter = 0.5,
    delayEnter = 0.1,
    clearProps = true
  } = options

  const _disableAnimation = disableAnimation || prefersReducedMotion()
  const _durationExit = _disableAnimation ? 0.01 : durationExit
  const _durationEnter = _disableAnimation ? 0.01 : durationEnter

  gsap.killTweensOf(el)

  const tl = gsap.timeline({ paused: true })

  tl.to(el, {
    duration: _durationExit,
    opacity: 0,
    ease: 'power1.inOut',
    onStart: () => {
      options.onExitStart?.()
    },
    onComplete: () => {
      options.onExitComplete?.()
    }
  })
  .to(el, {
    duration: _durationEnter,
    delay: delayEnter,
    opacity: 1,
    ease: 'power1.out',
    onStart: () => {
      options.onEnterStart?.()
    },
    onComplete: () => {
      if (clearProps) {
        gsap.set(el, { clearProps: 'opacity' })
      }

      options.onEnterComplete?.()
    }
  })

  return tl.play()
}