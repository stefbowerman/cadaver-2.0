import BaseSection from './base'
import InfiniteScroll from '../core/infiniteScroll'

const selectors = {
  grid: '[data-grid]',
  gridItem: '[data-grid-item]'
}

export default class BlogSection extends BaseSection {
  constructor(container) {
    super(container, 'blog')

    this.$grid = $(selectors.grid, this.$container)

    this.infiniteScroll = new InfiniteScroll(this.$container, {
      selector: selectors.gridItem,
      onFetchComplete: this.onFetchComplete.bind(this)
    })
  }

  onUnload() {
    super.onUnload()
    
    this.infiniteScroll.destroy()
  }

  onFetchComplete($selection) {
    this.$grid.append($selection)
  }
}
