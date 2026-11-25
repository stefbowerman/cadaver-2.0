import { prefersReducedMotion } from '@/core/utils/a11y'
import { getAppString } from '@/core/utils/string'
import BaseComponent from '@/components/base'

const classes = {
  isReady: 'is-ready',
  toggle: 'graphic-cover-video-toggle'
}

export default class GraphicCoverVideo extends BaseComponent {
  static TYPE = 'graphic-cover-video'

  #autoPlayEnabled: boolean // Doubles as user intent - false after the user pauses, so scrolling back into view won't resume
  #video: HTMLVideoElement | null
  #inView: boolean
  #toggleButton: HTMLButtonElement | null

  constructor(el: HTMLElement) {
    super(el, {
      watchIntersection: true,
      intersectionOptions: {
        rootMargin: '50px 0px 50px 0px',
      }
    })

    this.#autoPlayEnabled = prefersReducedMotion() ? false : true

    this.#video = this.qs<HTMLVideoElement>('video')
    this.#inView = false
    this.#toggleButton = null

    if (!this.#video) {
      console.warn('No video found')
      return
    }

    // The liquid renders the autoplay attribute, which would ignore reduced motion
    if (!this.#autoPlayEnabled) {
      this.#video.autoplay = false
      this.#video.pause()
    }

    this.#toggleButton = document.createElement('button')
    this.#toggleButton.type = 'button'
    this.#toggleButton.className = classes.toggle
    this.#toggleButton.addEventListener('click', this.#onToggleClick.bind(this))

    // Links and buttons are interactive elements, and a button can't be nested inside one.
    // If the component is wrapped in one, place the button after that wrapper instead
    const interactiveAncestor = this.el.closest('a, button')

    if (interactiveAncestor) {
      interactiveAncestor.after(this.#toggleButton)
    }
    else {
      this.el.after(this.#toggleButton)
    }

    this.#updateToggleButton()

    this.#video.addEventListener('canplay', this.#onCanPlay.bind(this))
    this.#video.addEventListener('play', this.#onPlay.bind(this))
    this.#video.addEventListener('playing', this.#onPlay.bind(this))
    this.#video.addEventListener('pause', this.#onPause.bind(this))
    this.#video.addEventListener('error', this.#onError.bind(this))
  }

  onDestroy() {
    // Button lives outside this.el, so it isn't removed with the component
    this.#toggleButton?.remove()
    this.#toggleButton = null
  }  

  get #isPlaying() {
    return this.#video && !this.#video.paused
  }

  // Text describes what pressing will do (media player convention)
  #updateToggleButton() {
    if (!this.#toggleButton) return

    if (this.#isPlaying) {
      this.#toggleButton.textContent = getAppString('pauseVideo', 'Pause video')
    }
    else {
      this.#toggleButton.textContent = getAppString('playVideo', 'Play video')
    }
  }

  async #attemptPlay() {
    if (!this.#video) return

    if (this.#isPlaying) {
      this.#onPlay()

      return
    }

    try {
      await this.#video.play()

      if (!this.#isPlaying) {
        throw new Error('Autoplay resolved but not advancing (likely blocked)')
      }
    }
    catch (e: unknown) {
      console.warn('Autoplay blocked or failed:', e)
    }
  }

  #onToggleClick() {
    if (!this.#video) return

    if (this.#isPlaying) {
      this.#autoPlayEnabled = false
      this.#video.pause()
    }
    else {
      this.#autoPlayEnabled = true
      this.#attemptPlay()
    }
  }

  #onCanPlay() {
    if (this.#inView && !this.#isPlaying && this.#autoPlayEnabled) {
      this.#attemptPlay()
    }
  }

  #onPlay() {
    if (!this.#video) return

    this.#video.classList.add(classes.isReady)
    this.#updateToggleButton()
  }

  #onPause() {
    this.#updateToggleButton()
  }

  #onError(e: ErrorEvent) {
    if (!this.#video) return

    console.warn('Video error', e)
    this.#video.style.display = 'none'
    this.#toggleButton?.remove()
    this.#toggleButton = null
  }

  async #onVisibilityChange(visible = false) {
    if (!this.#video) return

    this.#inView = visible

    if (this.#inView) {
      this.#video.preload = 'auto'
      
      if (!this.#autoPlayEnabled) return

      await this.#attemptPlay()
    }
    else {
      this.#video.pause()
      this.#video.preload = 'metadata'
    }
  }

  onIntersection(entries: IntersectionObserverEntry[]) {
    this.#onVisibilityChange(entries[0].isIntersecting)
  }
}
