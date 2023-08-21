import BaseRenderer from './base'
import ArticleSection from '../sections/article'

export default class ArticleRenderer extends BaseRenderer {
  onEnter() {
    super.onEnter()

    this.sectionManager.register('article', ArticleSection)
  }
}