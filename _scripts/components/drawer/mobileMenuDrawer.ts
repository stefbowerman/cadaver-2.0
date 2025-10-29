import Drawer from '@/components/drawer'
import SearchInline from '@/components/search/searchInline'
import { BREAKPOINTS } from '@/core/breakpointsController'

export default class MobileMenuDrawer extends Drawer {
  static TYPE = 'mobile-menu-drawer'

  searchInline: SearchInline

  constructor(el: HTMLElement) {
    super(el, {
      maxBreakpoint: BREAKPOINTS.md
    })

    this.searchInline = new SearchInline(this.qs(SearchInline.SELECTOR) as HTMLFormElement)
  }
}