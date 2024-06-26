import BaseSection from './base'

import AmbientVideo from '../components/ambientVideo'

export default class PageHeroSection extends BaseSection {
  constructor(container) {
    super(container, 'page-hero')
    
    this.ambientVideo = new AmbientVideo($(AmbientVideo.selector, this.$container).first())
  }
}