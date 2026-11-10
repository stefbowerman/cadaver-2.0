/**
 * Mailchimp API
 * -----------------------------------------------------------------------------
 *
 * Subscribes an email to a Mailchimp audience via JSONP.
 *
 * Mailchimp's subscribe endpoint sends no CORS headers, so it can't be
 * fetch()'d directly — JSONP (script tag + global callback) is the standard
 * workaround (same approach as Mailchimp's own mc-validate.js).
 *
 */
type MailchimpResponse = {
  result: 'success' | 'error'
  msg: string
}

type MailchimpConfig = {
  dc: string
  u: string
  id: string
}

// Parses a Mailchimp embedded-form action URL, e.g.
// https://example.us5.list-manage.com/subscribe/post?u=abc123&id=def456
function parseFormUrl(formUrl?: string): MailchimpConfig | null {
  if (!formUrl) return null

  try {
    // Mailchimp's own embed snippet writes the action URL with HTML-escaped "&amp;" separators,
    // which is an easy copy-paste trap into a plain-text setting - normalize before parsing.
    const url = new URL(formUrl.replace(/&amp;/g, '&'))
    const dc = url.hostname.match(/\.([^.]+)\.list-manage\.com$/)?.[1]
    const u = url.searchParams.get('u')
    const id = url.searchParams.get('id')

    return dc && u && id ? { dc, u, id } : null
  }
  catch {
    return null
  }
}

const config = parseFormUrl(window.app?.mailchimp?.formUrl)

if (!config) {
  console.warn('[MailchimpAPI] - Could not parse a valid Mailchimp form URL from theme settings')
}

const MailchimpAPI = {
  async subscribe(email: string, fields: Record<string, string> = {}): Promise<{ success: boolean, message?: string }> {
    if (!email || !config) {
      return { success: false }
    }

    const { dc, u, id } = config
    const params = new URLSearchParams({ u, id, EMAIL: email, [`b_${u}_${id}`]: '' }) // honeypot, kept empty

    for (const [key, value] of Object.entries(fields)) {
      if (value) params.set(key, value)
    }

    const response = await new Promise<MailchimpResponse>((resolve, reject) => {
      const callbackName = `mailchimpSubscribe_${Date.now()}_${Math.round(Math.random() * 1e6)}`
      const script = document.createElement('script')

      const win = window as unknown as Record<string, ((data: MailchimpResponse) => void) | undefined>

      const cleanup = () => {
        delete win[callbackName]
        script.remove()
      }

      win[callbackName] = (data: MailchimpResponse) => {
        cleanup()
        resolve(data)
      }

      script.onerror = () => {
        cleanup()
        reject(new Error('Mailchimp request failed'))
      }

      script.onload = () => {
        if (win[callbackName]) { // callback never ran
          cleanup()
          reject(new Error('Mailchimp returned an invalid response'))
        }
      }      

      params.set('c', callbackName)
      script.src = `https://${dc}.list-manage.com/subscribe/post-json?${params.toString()}`
      document.body.appendChild(script)
    })

    return { success: response.result === 'success', message: response.msg }
  }
}

export default MailchimpAPI
