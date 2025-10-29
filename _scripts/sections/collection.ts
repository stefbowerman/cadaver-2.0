import ResultsSection from '@/sections/results'

export default class CollectionSection extends ResultsSection {
  static TYPE = 'collection'

  constructor(container: HTMLElement) {
    super(container)
  }
}
