import { Renderer } from '@unseenco/taxi'

import SectionManager from '../core/sectionManager'
import FeaturedProducts from '../sections/featuredProducts'
import Addresses from '../sections/addresses'
import Article from '../sections/article'
import Blog from '../sections/blog'
import Collection from '../sections/collection'
import Product from '../sections/product'
import Login from '../sections/login'
import Search from '../sections/search'
import PageHero from '../sections/pageHero'

export default class BaseRenderer extends Renderer {
  constructor(properties) {
    super(properties)

    this.sectionManager = new SectionManager()
  }

  onEnter() {
    // run after the new content has been added to the Taxi container
    this.sectionManager.register('featured-products', FeaturedProducts)
    this.sectionManager.register('addresses', Addresses)
    this.sectionManager.register('article', Article)
    this.sectionManager.register('blog', Blog)
    this.sectionManager.register('collection', Collection)
    this.sectionManager.register('product', Product)
    this.sectionManager.register('login', Login)
    this.sectionManager.register('search', Search)
    this.sectionManager.register('page-hero', PageHero)
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