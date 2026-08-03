import { fetchDom } from '@/core/utils/dom'
import BaseSection from '@/sections/base'

// Inspired by Horizon's section-renderer.js

/**
 * Builds a section rendering URL
 * @param {string} sectionId - The section ID
 * @param {URL} url - The URL to render the section for
 * @returns {string} The section rendering URL
 */
function buildFullUrl(sectionId: string, url: URL): string {
  // Clone the URL to avoid mutating the original
  const _url = new URL(url)
        _url.searchParams.set('section_id', sectionId)
        _url.searchParams.sort()

  return _url.toString()
}

/**
 * Returns a deep clone of the document so the original can stay in cache.
 * Appending nodes from the returned document to the live DOM won't mutate the cache.
 */
function cloneDocument(doc: Document): Document {
  return doc.cloneNode(true) as Document
}

interface PendingFetch {
  promise: Promise<Document | undefined>
  controller: AbortController
  waiters: Set<string>
}

class SectionRenderService {
  #cache = new Map<string, Document>()
  #pending = new Map<string, PendingFetch>()
  #abortKeyToUrl = new Map<string, string>()

  clearCache() {
    this.#cache.clear()
  }

  cacheSection(section: BaseSection) {
    const url = buildFullUrl(section.id, new URL(window.location.href))

    const dom =  new DOMParser().parseFromString(section.parent.outerHTML, 'text/html');

    this.#cache.set(url, dom)
  }

  /**
   * Fetches a section's DOM, using in-memory cache and promise deduplication.
   * Failure — abort or a real fetch error — always resolves to undefined; it
   * never falls back to a stale cached copy, so callers can't mistake old
   * data for a fresh result.
   *
   * @param url - The full URL to fetch (including search params)
   * @param abortKey - If provided, registers this key as a waiter on the in-flight fetch for `url`
   */
  async #fetch(url: string, useCache: boolean, abortKey?: string): Promise<Document | undefined> {
    const pending = this.#pending.get(url)

    if (pending) {
      if (abortKey) pending.waiters.add(abortKey)
      return pending.promise
    }

    if (useCache && this.#cache.has(url)) {
      return cloneDocument(this.#cache.get(url)!)
    }

    const controller = new AbortController()
    const waiters = new Set<string>(abortKey ? [abortKey] : [])

    const promise = fetchDom(url, controller.signal)
      .then(dom => {
        if (!dom) return undefined

        this.#cache.set(url, dom)
        return cloneDocument(dom)
      })
      .finally(() => {
        this.#pending.delete(url)
      })

    this.#pending.set(url, { promise, controller, waiters })

    return promise
  }

  /**
   * Fetches section DOM by full URL. Single code path for section DOM fetching:
   * cache key = URL, abort key = abortKey. Use for predictive search or any
   * URL that isn't "current page + section_id".
   *
   * A shared in-flight fetch is only actually cancelled once every abortKey
   * relying on it has moved on — one caller's supersession can't silently
   * cancel data another, unrelated caller is still waiting on.
   *
   * @param fullUrl - The full URL to fetch (including search params)
   * @param abortKey - Key for cancellation; a new call with the same key detaches from its previous URL
   * @param useCache - Whether to return cached result when available (default true)
   */
  async getSectionDomByUrl(
    fullUrl: string,
    abortKey: string,
    useCache = true
  ): Promise<Document | undefined> {
    const prevUrl = this.#abortKeyToUrl.get(abortKey)

    if (prevUrl && prevUrl !== fullUrl) {
      const prevEntry = this.#pending.get(prevUrl)

      if (prevEntry) {
        prevEntry.waiters.delete(abortKey)

        if (prevEntry.waiters.size === 0) {
          prevEntry.controller.abort()
        }
      }
    }

    this.#abortKeyToUrl.set(abortKey, fullUrl)

    return this.#fetch(fullUrl, useCache, abortKey)
  }

  /**
   * Fetches a section's DOM for the given page URL (section_id appended).
   * Delegates to getSectionDomByUrl so abort and fetch logic live in one place.
   */
  async getSectionDom(sectionId: string, url: URL, useCache = true): Promise<Document | undefined> {
    const fullUrl = buildFullUrl(sectionId, url)

    return this.getSectionDomByUrl(fullUrl, sectionId, useCache)
  }

  /**
   * Pre-fetches a URL and stores it in cache.
   * Useful for hover states on filters.
   */
  prefetch(sectionId: string, url: URL) {
    const fullUrl = buildFullUrl(sectionId, url)

    if (this.#cache.has(fullUrl) || this.#pending.has(fullUrl)) return

    this.#fetch(fullUrl, true).catch(() => {})
  }
}

export const sectionRenderService = new SectionRenderService()
