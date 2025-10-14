import { isNumber, clamp } from '@/core/utils'
import BaseComponent from '@/components/base'

const selectors = {
  increment: 'button[data-increment]',
  decrement: 'button[data-decrement]'
}

const DEFAULT_MIN = 0
const DEFAULT_MAX = 999
const DEFAULT_STEP = 1

interface QuantityAdjusterSettings {
  onChange?: (value: number) => void
}

export default class QuantityAdjuster extends BaseComponent {
  static TYPE = 'quantity-adjuster'

  settings: QuantityAdjusterSettings
  changeEvent: Event
  input: HTMLInputElement
  increment: HTMLButtonElement
  decrement: HTMLButtonElement
  observer: MutationObserver

  constructor(el: HTMLElement, options: QuantityAdjusterSettings = {}) {
    super(el)

    this.settings = {
      onChange: (value: number) => {},
      ...options
    }

    this.changeEvent = new Event('change', { bubbles: true }) // stepUp / stepDown doesn't trigger input change

    this.input = this.el.querySelector('input[type="number"]')!
    this.increment = this.el.querySelector(selectors.increment)!
    this.decrement = this.el.querySelector(selectors.decrement)!

    this.input.addEventListener('change', this.onChange.bind(this))
    this.increment.addEventListener('click', this.onStepClick.bind(this))
    this.decrement.addEventListener('click', this.onStepClick.bind(this))

    this.observer = new MutationObserver(this.onInputMutation.bind(this))
    this.observer.observe(this.input, {
      attributes: true,
      attributeFilter: ['min', 'max', 'step']
    })

    this.validate()
  }

  destroy() {
    this.observer.disconnect()

    super.destroy()
  }

  parseAttribute(value: string, defaultValue: number): number {
    const parsed = parseInt(value, 10)
    
    return isNaN(parsed) ? defaultValue : parsed
  }

  get min(): number {
    return this.parseAttribute(this.input.min, DEFAULT_MIN)
  }

  get max(): number {
    return this.parseAttribute(this.input.max, DEFAULT_MAX)
  }
  
  get step(): number {
    return this.parseAttribute(this.input.step, DEFAULT_STEP)
  }

  set min(value: number) {
    isNumber(value) ? this.input.min = value.toString() : this.input.removeAttribute('min')
  }

  set max(value: number) {
    isNumber(value) ? this.input.max = value.toString() : this.input.removeAttribute('max')
  }

  set step(value: number) {
    isNumber(value) ? this.input.step = value.toString() : this.input.removeAttribute('step')
  }

  get value(): number {
    return parseInt(this.input.value, 10)
  }

  set value(q: number) {
    if (q === this.value) return // Prevent onChange

    this.input.value = q.toString()
  }
  
  get disabled(): boolean {
    return this.input.disabled
  }

  set disabled(isDisabled: boolean) {
    this.input.disabled = isDisabled
    this.increment.disabled = isDisabled
    this.decrement.disabled = isDisabled
  }

  validate() {
    this.decrement.disabled = this.value <= this.min
    this.increment.disabled = this.value >= this.max

    if (this.value < this.min) {
      this.value = this.min
    }
    else if (this.value > this.max) {
      this.value = this.max
    }
  }

  onChange() {
    if (this.value < this.min) {
      this.value = this.min
    }
    else if (this.value > this.max) {
      this.value = this.max
    }
    else if (this.value % this.step !== 0) {
      const v = Math.round(this.value / this.step) * this.step

      this.value = clamp(v, this.min, this.max)
    }
    
    this.validate()

    this.settings.onChange(this.value)
  }

  onStepClick(e: MouseEvent) {
    const previousValue = this.value

    if (e.currentTarget === this.increment) {
      if (this.min > this.step && previousValue == 0) {
        this.value = this.min
      }
      else {
        this.input.stepUp()
      }
    }
    else if (e.currentTarget === this.decrement) {
      if (this.min === previousValue) {
        this.value = this.min
      }
      else {
        this.input.stepDown()
      }
    }

    if (previousValue !== this.value) {
      this.input.dispatchEvent(this.changeEvent)
    }
  }

  onInputMutation() {
    this.validate()
  }
}
