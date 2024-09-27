import BaseSection from './base'

export default class ArticleSection extends BaseSection {
  static TYPE = 'article'
  
  constructor(container) {
    super(container, 'article')
  }
}