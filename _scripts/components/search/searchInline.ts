import BaseComponent from '@/components/base'

const selectors = {
  input: 'input[name="q"]',
  clearButton: 'button[data-clear]'
}

type SearchInlineOptions = {
  onSubmit?: (e: SubmitEvent, url: string) => void | boolean
  onKeyup?: (e: KeyboardEvent) => void
  onInput?: (e: InputEvent) => void
}

export default class SearchInline extends BaseComponent {
  static TYPE = 'search-inline'

  declare el: HTMLFormElement

  settings: SearchInlineOptions
  input: HTMLInputElement
  clearButton?: HTMLButtonElement
  action: string

  constructor(el: HTMLFormElement, options: SearchInlineOptions = {}) {
    super(el)

    this.settings = {
      ...options
    }

    if (this.el.tagName !== 'FORM') {
      console.warn('SearchInline: Form element required')
      return
    }

    this.input = this.qs(selectors.input) as HTMLInputElement
    this.clearButton = this.qs(selectors.clearButton) as HTMLButtonElement | undefined
    this.action = this.el.getAttribute('action')

    this.onSubmit = this.onSubmit.bind(this)
    this.onKeyup = this.onKeyup.bind(this)
    this.onInput = this.onInput.bind(this)
    this.onClearButtonClick = this.onClearButtonClick.bind(this)    

    this.el.addEventListener('submit', this.onSubmit)
    this.input.addEventListener('keyup', this.onKeyup)
    this.input.addEventListener('input', this.onInput)
    this.clearButton?.addEventListener('click', this.onClearButtonClick)
  }

  private checkClearButton() {
    if (this.clearButton) {              
      this.clearButton.hidden = !this.input.value
    }
  }   

  reset() {
    this.input.value = ''
    this.checkClearButton()
  }

  onSubmit(e: SubmitEvent) {
    const data = new FormData(this.el)

    const q = data.get('q')?.toString().trim()
    const type = data.get('type')?.toString() || 'product'

    if (!q) {
      return
    }

    const url = `${this.action}?type=${encodeURIComponent(type)}&q=${encodeURIComponent(q)}`

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
    this.checkClearButton()
    this.settings.onKeyup?.(e)
  }

  onInput(e: InputEvent) {
    this.checkClearButton()
    this.settings.onInput?.(e)
  }

  onClearButtonClick() {
    this.reset()
  }
}
