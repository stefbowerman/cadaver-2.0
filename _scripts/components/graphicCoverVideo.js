import { prefersReducedMotion } from '@/core/utils/a11y'
import BaseComponent from '@/components/base'

const classes = {
  isReady: 'is-ready'
}

export default class GraphicCoverVideo extends BaseComponent {
  static TYPE = 'graphic-cover-video'

  constructor(el) {
    super(el)

    this.autoPlayEnabled = prefersReducedMotion() ? false : true

    this.video = this.qs('video')
    this.inView = false

    if (!this.video) {
      console.warn('No video found')
      return
    }

    this.video.addEventListener('canplay', this.onCanPlay.bind(this))
    this.video.addEventListener('play', this.onPlay.bind(this))
    this.video.addEventListener('playing', this.onPlay.bind(this))
    this.video.addEventListener('pause', this.onPause.bind(this))
    this.video.addEventListener('error', this.onError.bind(this))

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

  onCanPlay() {
    if (this.inView && !this.isPlaying && this.autoPlayEnabled) {
      this.attemptPlay()
    }
  }

  onPlay() {
    this.video.classList.add(classes.isReady)
  }

  onPause() {

  }

  onError(e) {
    console.warn('Video error', e)
    this.video.style.display = 'none'
  }

  async onVisibilityChange(visible = false) {
    this.inView = visible

    if (this.inView) {
      this.video.preload = 'auto'
      
      if (!this.autoPlayEnabled) return

      await this.attemptPlay()
    }
    else {
      this.video.pause()
      this.video.preload = 'metadata'
    }
  }

  onIntersection(entries) {
    this.onVisibilityChange(entries[0].isIntersecting)
  }
}
