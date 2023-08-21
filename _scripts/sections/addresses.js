import BaseSection from './base'

import { postLink } from '../core/utils'

const selectors = {
  toggleNew: '[data-toggle-new]',
  newForm: '[data-new]',
  toggleForm: '[data-toggle-form]',
  deleteAddress: '[data-delete-address]'
}

export default class AddressesSection extends BaseSection {
  constructor(container) {
    super(container, 'addresses')

    this.$toggleNew = $(selectors.toggleNew, this.$container)
    this.$newForm = $(selectors.newForm, this.$container)

    this.$toggleForm = $(selectors.toggleForm, this.$container)
    this.$deleteAddress = $(selectors.deleteAddress, this.$container)

    this.$toggleNew.on('click', (e) => {
      e.preventDefault()
      this.$newForm.toggle()
    })

    this.$toggleForm.on('click', e => {
      e.preventDefault()
      const id = $(e.currentTarget).data('id')

      $(`#edit-address-${id}`).toggle()
    })

    this.$deleteAddress.on('click', e => {
      e.preventDefault()

      const id = $(e.currentTarget).data('id')

      if (confirm('Are you sure you wish to delete this address?')) {
        postLink('/account/addresses/' + id, {'parameters': {'_method': 'delete'}})
      }
    })

    // Initialize observers on address selectors
    new Shopify.CountryProvinceSelector('address-country-new', 'address-province-new', {
      hideElement: 'address-province-container-new'
    })

    $('[data-address-form]', this.$container).each((i, el) => {
      const id = el.dataset.id

      new Shopify.CountryProvinceSelector(`address-country-${id}`, `address-province-${id}`, {
        hideElement: `address-province-container-${id}`
      })
    }) 
  }
}
