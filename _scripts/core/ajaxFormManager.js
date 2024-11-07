import CartAPI from './cartAPI'

const selectors = {
  form: 'form[action*="/cart/add"]',
  submit: '[type="submit"]'
}

const namespace = '.ajaxFormManager'

export const events = {
  ADD_START: `addStart${namespace}`,
  ADD_DONE: `addDone${namespace}`,
  ADD_SUCCESS: `addSuccess${namespace}`,
  ADD_FAIL: `addFail${namespace}`
}

export default class AJAXFormManager {
  constructor() {
    this.requestInProgress = false

    this.onBodySubmit = this.onBodySubmit.bind(this)

    document.body.addEventListener('submit', this.onBodySubmit)
  }

  destroy() {
    document.body.removeEventListener('submit', this.onBodySubmit)
  }

  onBodySubmit(e) {
    if (e.target.closest(selectors.form)) {
      e.preventDefault()
      return this.onFormSubmit(e.target.closest(selectors.form))
    }
  }

  onFormSubmit(form) {
    if (this.requestInProgress) return

    const submit = form.querySelector(selectors.submit)

    const startEvent = new CustomEvent(events.ADD_START, { detail: { relatedTarget: form } })
    window.dispatchEvent(startEvent)

    // Disable the button so the user knows the form is being submitted
    submit.setAttribute('disabled', true)

    this.requestInProgress = true

    const onDone = () => {
      submit.removeAttribute('disabled')
      this.requestInProgress = false

      const event = new CustomEvent(events.ADD_DONE, { detail: { relatedTarget: form }})
        
      window.dispatchEvent(event)      
    }
    
    CartAPI.addItemFromForm(form)
      .then((data) => {
        onDone()

        const event = new CustomEvent(events.ADD_SUCCESS, { detail: { cart: data, relatedTarget: form } })

        window.dispatchEvent(event)
      })
      .catch((data) => {
        onDone()

        const event = new CustomEvent(events.ADD_FAIL, { detail: {
          message: data.message,
          description: data.description,
          relatedTarget: form
        }})

        window.dispatchEvent(event)
      })
  }
}
