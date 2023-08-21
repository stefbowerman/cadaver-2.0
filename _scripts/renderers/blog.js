import BaseRenderer from './base'

import BlogSection from '../sections/blog'

export default class BlogRenderer extends BaseRenderer {
  onEnter() {
    super.onEnter()
    
    this.sectionManager.register('blog', BlogSection)
  }
}
