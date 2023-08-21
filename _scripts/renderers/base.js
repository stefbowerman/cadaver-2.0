import { Renderer } from '@unseenco/taxi'

import SectionManager from '../core/sectionManager'
import FeaturedProductsSection from '../sections/featuredProducts'

export default class BaseRenderer extends Renderer {
  constructor(properties) {
    super(properties)

    this.sectionManager = new SectionManager()
  }

  onEnter() {
    // run after the new content has been added to the Taxi container
    // Add any sections here that might show up on *any* page on the site
    this.sectionManager.register('featured-products', FeaturedProductsSection)
  }

  onEnterCompleted() {
     // run after the transition.onEnter has fully completed
  }

  onLeave() {
    // run before the transition.onLeave method is called
    this.sectionManager.destroy()
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
  }
}