import BaseComponent from '@/components/base'

const selectors = {
  input: 'input[name="q"]',
  icon: '[data-icon]'
}

type SearchInlineOptions = {
  onSubmit?: (e: Event, url: string) => void | boolean;
  onKeyup?: (e: Event) => void;
}

export default class SearchInline extends BaseComponent {
  static TYPE = 'search-inline'

  declare el: HTMLFormElement;
  settings: SearchInlineOptions;
  input: HTMLInputElement;
  icon: HTMLElement;
  action: string;

  constructor(el: HTMLFormElement, options: SearchInlineOptions = {}) {
    super(el)

    this.settings = {
      ...options
    }

    if (this.el.tagName !== 'FORM') {
      console.warn('SearchInline: Form element required')
      return
    }

    this.input = this.el.querySelector(selectors.input)
    this.icon = this.el.querySelector(selectors.icon)
    this.action = this.el.getAttribute('action')

    this.onSubmit = this.onSubmit.bind(this)
    this.onKeyup = this.onKeyup.bind(this)

    this.el.addEventListener('submit', this.onSubmit)
    this.input.addEventListener('keyup', this.onKeyup)
  }

  reset() {
    this.input.value = ''
  }

  onSubmit(e: SubmitEvent) {
    const data = new FormData(this.el)

    const q = data.get('q')?.toString().trim()
    const type = data.get('type')?.toString() || 'product'

    if (!q) {
      return
    }

    const params = new URLSearchParams({
      type: type,
      q: encodeURIComponent(q)
    })

    const url = `${this.action}?${params.toString()}`

    if (this.settings.onSubmit?.(e, url) === false) {
      return
    }

    if (!window.app.taxi) {
      return
    }

    e.preventDefault()

    window.app.taxi.navigateTo(url)

    return false
  }


  onKeyup(e: KeyboardEvent) {
    this.settings.onKeyup?.(e)
  }
}
