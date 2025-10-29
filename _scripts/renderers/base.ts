import { Renderer } from '@unseenco/taxi'
import type { RendererProps } from '@/types/taxi'

import SectionManager from '@/core/sectionManager'

import FeaturedProducts from '@/sections/featuredProducts'
import Addresses from '@/sections/addresses'
import Article from '@/sections/article'
import Blog from '@/sections/blog'
import Collection from '@/sections/collection'
import Product from '@/sections/product'
import ProductRelated from '@/sections/productRelated'
import Login from '@/sections/login'
import Search from '@/sections/search'
import PageHero from '@/sections/pageHero'

const redirect = (url: string) => {
  setTimeout(() => {
    window.app?.taxi ? window.app.taxi.navigateTo(url) : (window.location.href = url)
  }, 50)
}

export default class BaseRenderer extends Renderer {
  sectionManager: SectionManager | null

  constructor(properties: RendererProps) {
    super(properties)
  }

  // NOTE: If initialLoad is defined, "onEnter" will not be called for sections that exist on page load
  // initialLoad() {

  // }

  onEnter() {   
    // this.redirectIfNecessary() // <- Can't run this here or taxi will throw an error

    // Taxi re-uses renderer instances when navigating between cache'd pages
    // Create the section renderer onEnter rather than in the constructor to make sure we have a fresh one each time
    this.sectionManager = new SectionManager();

    [
      FeaturedProducts,
      Addresses,
      Article,
      Blog,
      Collection,
      Product,
      ProductRelated,
      Login,
      Search,
      PageHero
    ].forEach(section => {
      this.sectionManager.register(section)
    })    
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
      redirect('/?cart')
    }
  }  
}