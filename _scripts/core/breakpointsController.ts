import { dispatch } from '@/core/utils/event'

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536
}

// Use Map so order is preserved while iterating
// Sort the breakpoints from small -> large
const BREAKPOINTS_MAP = new Map(Object.entries(BREAKPOINTS).sort((a, b) => a[1] - b[1]));

type MediaQuery = {
  minWidth: number
  query: MediaQueryList
}

export type BreakpointChangeEvent = CustomEvent<{
  breakpoint: number
  fromBreakpoint: number
  direction: number
}>

export default class BreakpointsController {
  static EVENTS = {
    CHANGE: 'change.breakpointsController'
  }

  currentKey: string
  mediaQueries: Map<string, MediaQuery>

  constructor() {
    this.currentKey = this.getKeyForWidth(window.innerWidth)
    this.mediaQueries = new Map()

    this.onChange = this.onChange.bind(this)

    // Initialize media queries
    BREAKPOINTS_MAP.forEach((minWidth, key) => {
      const query = window.matchMedia(`(min-width: ${minWidth}px)`)

      query.addEventListener('change', this.onChange)

      this.mediaQueries.set(key, { minWidth, query } as MediaQuery)
    })
  }

  destroy() {
    this.mediaQueries.forEach(({ query }) => {
      query.removeEventListener('change', this.onChange)
    })
  }

  /**
   * Returns the key for one of the BREAKPOINTS_MAP, whichever has a value closest to but smaller to the passed in width
   * e.g. If we pass in a width between 'sm' and 'md', this will return 'sm'
   *
   * @param {number} w - width to search for
   * @return {undefined|string} foundKey
   */
  getKeyForWidth(w: number): string | undefined {
    let foundKey = undefined

    for (const [key, breakpoint] of BREAKPOINTS_MAP) {
      if (w >= breakpoint) {
        foundKey = key
      }
      else {        
        break // key found, we can stop iterating
      }
    }

    return foundKey
  }  

  onChange() {
    const oldKey = this.currentKey
    const newKey = this.getKeyForWidth(window.innerWidth)

    if (oldKey !== newKey) {
      const breakpoint = this.mediaQueries.get(newKey).minWidth
      const fromBreakpoint = this.mediaQueries.get(oldKey).minWidth
      const direction = window.innerWidth > this.mediaQueries.get(oldKey).minWidth ? 1 : -1

      dispatch(BreakpointsController.EVENTS.CHANGE, {
        breakpoint,
        fromBreakpoint,
        direction
      })
      
      this.currentKey = newKey
    }
  }
}