import BaseSection from '@/sections/base'

import { postLink } from '@/core/utils'

const selectors = {
  toggleNew: '[data-toggle-new]',
  newForm: '[data-new]',
  toggleForm: '[data-toggle-form]',
  deleteAddress: '[data-delete-address]'
}

function toggle(el) {
  if (el.style.display == 'none') {
    el.style.display = ''
  }
  else {
    el.style.display = 'none'
  }
}

export default class AddressesSection extends BaseSection {
  static TYPE = 'addresses'
  
  constructor(container) {
    super(container)

    this.newForm = this.qs(selectors.newForm)

    this.container.addEventListener('click', (e) => {
      if (e.target.matches(selectors.toggleNew)) {
        e.preventDefault()
        toggle(this.newForm)
        return
      }

      if (e.target.matches(selectors.toggleForm)) {
        e.preventDefault()
        toggle(this.qs(`#edit-address-${e.target.dataset.id}`))
        return
      }

      if (e.target.matches(selectors.deleteAddress)) {
        e.preventDefault()

        const id = e.target.dataset.id
  
        if (confirm('Are you sure you wish to delete this address?')) {
          postLink('/account/addresses/' + id, {'parameters': {'_method': 'delete'}})
        }

        return
      }
    })

    // Initialize observers on address selectors
    new Shopify.CountryProvinceSelector('address-country-new', 'address-province-new', {
      hideElement: 'address-province-container-new'
    })

    this.qsa('[data-address-form]').forEach(el => {
      const id = el.dataset.id

      new Shopify.CountryProvinceSelector(`address-country-${id}`, `address-province-${id}`, {
        hideElement: `address-province-container-${id}`
      })
    })
  }
}
