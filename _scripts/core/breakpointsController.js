export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 900,
  xl: 1280,
  xxl: 1480,
  xxxl: 1800,  
  
  // See: ./tailwind.config.js
  // xs: 0,
  // sm: 430,
  // md: 600,
  // lg: 1024,
  // xl: 1280,
  // xxl: 1512
}

// Use Map so order is preserved while iterating
// Sort the breakpoints from small -> large
const BREAKPOINTS_MAP = new Map(Object.entries(BREAKPOINTS).sort((a, b) => a[1] - b[1]));

export default class BreakpointsController {
  static events = {
    CHANGE: 'change.breakpointsController'
  }

  constructor() {
    this.currentKey = this.getKeyForWidth(window.innerWidth)
    this.mediaQueries = new Map()

    this.onChange = this.onChange.bind(this)

    // Initialize media queries
    BREAKPOINTS_MAP.forEach((minWidth, key) => {
      const query = window.matchMedia(`(min-width: ${minWidth}px)`)

      query.addEventListener('change', this.onChange)

      this.mediaQueries.set(key, { minWidth, query })
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
   * @param {int} w - width to search for
   * @return {undefined|string} foundKey
   */
  getKeyForWidth(w) {
    let foundKey

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
      const direction = window.innerWidth > this.mediaQueries.get(oldKey).minWidth ? 1 : -1

      const changeEvent = new CustomEvent(BreakpointsController.events.CHANGE, {
        detail: {
          breakpoint,
          direction
        }
      })

      window.dispatchEvent(changeEvent)
      this.currentKey = newKey
    }
  }
}