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

export type TaxiNavigateOutProps = {
  from: CacheEntry | null
  trigger: Trigger
}

export type TaxiNavigateInProps = {
  from: CacheEntry | null
  to: CacheEntry
  trigger: Trigger
}

export type TaxiNavigateEndProps = {
  from: CacheEntry | null
  to: CacheEntry
  trigger: Trigger
}

export type TaxiNavigateOutEvent = CustomEvent<TaxiNavigateOutProps>
export type TaxiNavigateInEvent = CustomEvent<TaxiNavigateInProps>
export type TaxiNavigateEndEvent = CustomEvent<TaxiNavigateEndProps>

// See: https://github.com/craftedbygc/taxi/blob/main/src/Renderer.js
export type RendererProps = {
  content: HTMLElement|Element,
  page: Document|Node,
  title: string,
  wrapper: Element
}

// https://github.com/craftedbygc/taxi/blob/main/src/Transition.js
export type TransitionProps = {
  wrapper: HTMLElement
}

export type TransitionOnLeaveProps = {
  from: HTMLElement | Element,
  trigger: string | HTMLElement | false,
  done: Function
}

export type TransitionOnEnterProps = {
  to: HTMLElement | Element,
  trigger: string | HTMLElement | false,
  done: Function
}