import Drawer from './'
import SearchInline from '../search/searchInline'
import { BREAKPOINTS } from '../../core/breakpointsController'

export default class MobileMenuDrawer extends Drawer {
  static TYPE = 'mobile-menu-drawer'

  constructor(el) {
    super(el, {
      maxBreakpoint: BREAKPOINTS.md
    })

    this.searchInline = new SearchInline(this.qs(SearchInline.SELECTOR))
  }
}