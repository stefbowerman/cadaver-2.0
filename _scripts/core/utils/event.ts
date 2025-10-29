export const dispatch = (eventName: string, detail = {}): void => {
  const event = new CustomEvent(eventName, {
    bubbles: true,
    detail,
    cancelable: true
  })

  window.dispatchEvent(event)
}
