import BaseSection from '@/sections/base'
import ProductCard from '@/components/product/productCard'

export default class FeaturedProductsSection extends BaseSection {
  static TYPE = 'featured-products'

  productCards: ProductCard[]

  constructor(container: HTMLElement) {
    super(container)

    this.productCards = this.qsa(ProductCard.SELECTOR).map((el: HTMLElement) => new ProductCard(el))
  }
}