import BaseSection from '@/sections/base'

export default class BlogSection extends BaseSection {
  static TYPE = 'blog'

  constructor(container: HTMLElement) {
    super(container)
  }
}
