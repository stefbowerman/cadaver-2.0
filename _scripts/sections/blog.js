import BaseSection from './base'

export default class BlogSection extends BaseSection {
  static TYPE = 'blog'

  constructor(container) {
    super(container)
  }
}
