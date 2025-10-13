import type { Renderer } from '@unseenco/taxi'

// See: https://github.com/craftedbygc/taxi/blob/main/src/Core.js
type CacheEntry = {
  renderer: typeof Renderer | Renderer
  page: Document | Node
  scripts: string[]
  styles: HTMLLinkElement[]
  finalUrl: string
  skipCache: boolean
  title: string
  content: HTMLElement | Element
}

type Trigger = string | HTMLElement |false

export type TaxiNavigateOutEvent = CustomEvent<{
  from: CacheEntry | null
  trigger: Trigger
}>

export type TaxiNavigateInEvent = CustomEvent<{
  from: CacheEntry | null
  to: CacheEntry
  trigger: Trigger
}>

export type TaxiNavigateEndEvent = CustomEvent<{
  from: CacheEntry | null
  to: CacheEntry
  trigger: Trigger
}>

// See: https://github.com/craftedbygc/taxi/blob/main/src/Renderer.js
export type RendererProps = {
  content: HTMLElement|Element,
  page: Document|Node,
  title: string,
  wrapper: Element
}