import BaseComponent from './base'

const classes = {
  videoReady: 'is-ready'
}

export default class GraphicCover extends BaseComponent {
  static TYPE = 'graphic-cover'

  constructor(el) {
    super(el)

    this.video = this.el.querySelector('video')

    if (this.video) {
      this.video.addEventListener('play', this.onVideoPlay.bind(this))
      this.video.addEventListener('playing', this.onVideoPlay.bind(this))
    }

    this.observer = new IntersectionObserver(this.onIntersection.bind(this), {
      rootMargin: '0px 0px 0px 0px',
      threshold: 0
    })

    this.observer.observe(this.el)
  }

  destroy() {
    this.observer.disconnect()
    super.destroy()
  }

  get videoIsPlaying() {
    return this.video && !this.video.paused
  }

  async attemptVideoPlay() {
    if (!this.video) return

    if (this.videoIsPlaying) {
      this.onVideoPlay()

      return
    }

    try {
      await this.video.play()
    }
    catch (e) {
      console.warn(e) // @TODO - Show play button
    }
  }

  onVideoPlay() {
    this.video.classList.add(classes.videoReady)
  }

  async onVisibilityChange(visible = false) {
    if (this.video) {
      if (visible) {
        await this.attemptVideoPlay()
      }
      else {
          this.video.pause()
      }
    }
  }

  onIntersection(entries) {
    this.onVisibilityChange(entries[0].isIntersecting)
  }
}
