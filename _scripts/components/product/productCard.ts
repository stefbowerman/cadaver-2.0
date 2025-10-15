import BaseComponent from '@/components/base'

export default class ProductCard extends BaseComponent {
  static TYPE = 'product-card'

  constructor(el: HTMLElement) {
    super(el)
  }
}
