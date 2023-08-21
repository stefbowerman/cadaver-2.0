const classes = {
  ready: 'is-ready'
}

export default class AmbientVideo {
  constructor(video) {
    this.$video = $(video)
    this.video = this.$video.get(0)

    if (this.$video.length === 0) {
      return;
    }    

    this.$video.on('play playing', this.onVideoPlay.bind(this))

    setTimeout(() => {
      // Sometimes it loads too fast and we miss this event
      if (this.videoIsPlaying()) {
        this.onVideoPlay()
      }
      else {
        this.video.play()
      }
    }, 150)

    setTimeout(() => {
      // Autoplay failed, mark the video as loaded (fallback to a poster?)
      if (!this.videoIsPlaying()) {
        this.onVideoPlay();
      }
    }, 300)       
  }

  videoIsPlaying() {
    return !!(
      this.video.currentTime > 0 &&
      !this.video.paused &&
      !this.video.ended &&
      this.video.readyState > 2
    )
  }

  onVideoPlay() {
    this.$video.addClass(classes.ready)
  }   
}