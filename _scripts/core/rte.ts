export const formatTable = (table?: HTMLTableElement): void => {
  if (!table || !(table instanceof HTMLTableElement)) return
  
  const wrapper = document.createElement('div')
  wrapper.classList.add('rte-table-wrapper')

  const parent = table.parentNode
  
  if (parent) {
    parent.insertBefore(wrapper, table)
    wrapper.appendChild(table)
  }
}