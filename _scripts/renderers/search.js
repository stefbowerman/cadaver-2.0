import BaseRenderer from './base'
import SearchSection from '../sections/search'

export default class SearchRenderer extends BaseRenderer {
  onEnter() {
    super.onEnter()

    this.sectionManager.register('search', SearchSection)
  }
}