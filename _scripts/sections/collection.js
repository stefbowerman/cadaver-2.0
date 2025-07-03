import ResultsSection from './results'

export default class CollectionSection extends ResultsSection {
  static TYPE = 'collection'

  constructor(container) {
    super(container)
  }
}
