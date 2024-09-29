import BaseSection from './base'
import InfiniteScroll from '../core/infiniteScroll'

const selectors = {
  grid: '[data-grid]',
  gridItem: '[data-grid-item]'
}

export default class BlogSection extends BaseSection {
  static TYPE = 'blog'

  constructor(container) {
    super(container)

    this.$grid = $(selectors.grid, this.$container)

    this.infiniteScroll = new InfiniteScroll(this.$container, {
      selector: selectors.gridItem,
      onFetchComplete: this.onFetchComplete.bind(this)
    })
  }

  onUnload() {
    this.infiniteScroll.destroy()

    super.onUnload()    
  }

  onFetchComplete($selection) {
    this.$grid.append($selection)
  }
}
