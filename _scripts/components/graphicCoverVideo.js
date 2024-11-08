import { prefersReducedMotion } from '../core/utils/a11y'
import BaseComponent from './base'

const classes = {
  isReady: 'is-ready'
}

export default class GraphicCoverVideo extends BaseComponent {
  static TYPE = 'graphic-cover-video'

  constructor(el) {
    super(el)

    this.autoPlayEnabled = prefersReducedMotion() ? false : true

    this.video = this.qs('video')

    if (!this.video) {
      console.warn('No video found')
      return
    }

    this.video.addEventListener('play', this.onPlay.bind(this))
    this.video.addEventListener('playing', this.onPlay.bind(this))
    this.video.addEventListener('pause', this.onPause.bind(this))

    if (!this.autoPlayEnabled) {
      this.video.classList.add(classes.isReady) // <- Not sure what the best thing to do here is?  This displays the video but only shows the low-q poster image
    }

    this.observer = new IntersectionObserver(this.onIntersection.bind(this))

    this.observer.observe(this.el)
  }

  destroy() {
    this.observer?.disconnect()

    super.destroy()
  }

  get isPlaying() {
    return this.video && !this.video.paused
  }

  async attemptPlay() {
    if (this.isPlaying) {
      this.onPlay()

      return
    }

    try {
      await this.video.play()
    }
    catch (e) {
      console.warn(e)
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.video.pause()
    }
    else {
      this.attemptPlay()
    }
  }

  onPlay() {
    this.video.classList.add(classes.isReady)
  }

  onPause() {

  }

  async onVisibilityChange(visible = false) {
    if (visible) {
      if (!this.autoPlayEnabled) return

      await this.attemptPlay()
    }
    else {
      this.video.pause()
    }
  }

  onIntersection(entries) {
    this.onVisibilityChange(entries[0].isIntersecting)
  }
}
