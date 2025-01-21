import { Renderer } from '@unseenco/taxi'

import SectionManager from '../core/sectionManager'
import FeaturedProducts from '../sections/featuredProducts'
import Addresses from '../sections/addresses'
import Article from '../sections/article'
import Blog from '../sections/blog'
import Collection from '../sections/collection'
import Product from '../sections/product'
import ProductRelated from '../sections/productRelated'
import Login from '../sections/login'
import Search from '../sections/search'
import PageHero from '../sections/pageHero'

export default class BaseRenderer extends Renderer {
  constructor(properties) {
    super(properties)
  }

  // NOTE: If initialLoad is defined, "onEnter" will not be called for sections that exist on page load
  // initialLoad() {

  // }

  onEnter() {
    // run after the new content has been added to the Taxi container
    
    this.redirectIfNecessary()

    // Taxi re-uses renderer instances when navigating between cache'd pages
    // Create the section renderer onEnter rather than in the constructor to make sure we have a fresh one each time
    this.sectionManager = new SectionManager()

    this.sectionManager.register(FeaturedProducts)
    this.sectionManager.register(Addresses)
    this.sectionManager.register(Article)
    this.sectionManager.register(Blog)
    this.sectionManager.register(Collection)
    this.sectionManager.register(Product)
    this.sectionManager.register(ProductRelated)
    this.sectionManager.register(Login)
    this.sectionManager.register(Search)
    this.sectionManager.register(PageHero)
  }

  onEnterCompleted() {
     // run after the transition.onEnter has fully completed
     this.redirectIfNecessary()
  }

  onLeave() {
    // run before the transition.onLeave method is called
    if (this.sectionManager) {
      this.sectionManager.destroy()
      this.sectionManager = null
    }
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
  }

  redirectIfNecessary() {
    if (window.location.pathname === '/cart') {
      const url = '/?cart'

      setTimeout(() => {
        window.app?.taxi ? app.taxi.navigateTo(url) : (window.location = url)
      }, 50)
    }
  }  
}