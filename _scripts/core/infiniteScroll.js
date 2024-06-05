import { throttle } from 'throttle-debounce'
import { getScrollY } from './utils'

const selectors = {
  nextPageLink: '[data-next-page]'
}

export default class InfiniteScroll {
  constructor(el, options = {}) {
    this.isLoading = false
    this.settings = {
      threshold: 500, // Load pages when they come within this amount of pixels of the bottom of the screen
      selector: null,
      onFetchComplete: selection => {},
      ...options
    }

    if (this.settings.selector === null) {
      return console.log('[InfiniteScroll] - Selector required!') // eslint-disable-line no-console
    }

    this.$el = $(el)
    this.$nextPageLink = $(selectors.nextPageLink, this.$el)

    if (this.$nextPageLink.length === 0) {
      return // No link available
    }

    this.measurements = {}
    this.throttledOnScroll = throttle(150, this.onScroll.bind(this))
    this.throttledResize = throttle(150, this.onResize.bind(this))

    this.addEventListeners()
    this.setMeasurements()

    this.onScroll()
  }

  addEventListeners() {
    window.addEventListener('scroll', this.throttledOnScroll)
    window.addEventListener('resize', this.throttledResize)
  }

  removeEventListeners() {
    window.removeEventListener('scroll', this.throttledOnScroll)
    window.removeEventListener('resize', this.throttledResize)
  }

  destroy() {
    this.removeEventListeners()
  }

  setMeasurements() {
    this.measurements = {
      windowHeight: $window.height(),
      elTop: this.$el.offset().top,
      elHeight: this.$el.outerHeight()
    }
  }

  onResize() {
    this.setMeasurements()
  }

  onScroll() {
    if(this.isLoading) return

    const scrolledFarEnough = (getScrollY() + this.measurements.windowHeight + this.settings.threshold) > (this.measurements.elTop + this.measurements.elHeight)

    if(scrolledFarEnough) {
      // Keeping remove / add in this same block instead of separate methods (onBeforeFetch..) to make it easier to understand
      this.removeEventListeners()
      
      this.fetchNextPage(morePages => {
        if (morePages) {
          this.addEventListeners()
        }

        window.app.taxi?.updateCache() // Useful for things like blogs so we can store all of pages they've already seen
      })
    }
  }

  fetchNextPage(onFetchComplete) {
    const url  = this.$nextPageLink.attr('href')

    if (!url) {
      return console.log('[InfiniteScroll] - no URL found') // eslint-disable-line no-console
    }

    $.ajax({
      url,
      beforeSend: () => this.isLoading = true
    })
    .done(data => {
      const $dom = $(data)
      const $selection = $dom.find(this.settings.selector)
      const $newNextPageLink = $(selectors.nextPageLink, $dom)
      const morePages = $newNextPageLink.length > 0
      
      if (morePages) {
        this.$nextPageLink.replaceWith($newNextPageLink)
        this.$nextPageLink = $newNextPageLink
      }
      else {
        this.$nextPageLink.remove()
      }

      onFetchComplete(morePages)
      this.settings.onFetchComplete($selection)

      this.isLoading = false
    })
  }
}