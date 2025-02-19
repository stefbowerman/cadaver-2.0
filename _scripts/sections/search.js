import BaseSection from './base'
import SearchInline from '../components/search/searchInline'
import ProductCard from '../components/product/productCard'

export default class SearchSection extends BaseSection {
  static TYPE = 'search'

  constructor(container) {
    super(container)

    this.searchInline = new SearchInline(this.qs(SearchInline.SELECTOR))
    this.productCards = this.qsa(ProductCard.SELECTOR).map(el => new ProductCard(el))
  }
}