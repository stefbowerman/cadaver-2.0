import BaseSection from '@/sections/base'

export default class PageHeroSection extends BaseSection {
  static TYPE = 'page-hero'
  
  constructor(container: HTMLElement) {
    super(container)    
  }
}