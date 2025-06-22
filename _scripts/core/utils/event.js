export const dispatch = (eventName, detail = {}) => {
  const event = new CustomEvent(eventName, {
    bubbles: true,
    detail,
    cancelable: true
  })

  window.dispatchEvent(event)
}
