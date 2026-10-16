# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cadaver is a custom Shopify Online Store 2.0 theme boilerplate. It uses TypeScript compiled by Vite, Tailwind v4 for CSS, Taxi.js for SPA-like page transitions, and GSAP for animations.

## Commands

```bash
npm run dev      # Vite watch build in development mode (sourcemaps, no minification)
npm run build    # Production build (terser minification, drops console.log)

# Run alongside Shopify CLI:
shopify theme dev --store={store_id}
```

Build output goes to `assets/` as `app.bundle.js` and `app.bundle.css` (IIFE format, single CSS file).

## TypeScript Path Alias

`@/` maps to `_scripts/`. Use this alias for all internal imports.

## Application Architecture

### Initialization Flow (`_scripts/app.ts`)

1. `BreakpointsController` is instantiated and attached to `window.app.breakpointsController`
2. A `SectionManager` is created and global sections are registered (header, footer, mobile menu, AJAX cart)
3. Taxi.js is started with `BaseRenderer` as the default renderer
4. `window.app.taxi` is set on the Taxi instance for global access

### Two-tier Section System

**Global sections** (registered in `app.ts`) persist across page navigations — header, footer, mobile menu, AJAX cart.

**Page sections** (registered in `BaseRenderer.onEnter()`) are torn down on navigation and re-initialized for each new page — product, collection, article, blog, etc.

`SectionManager` handles both tiers identically. It queries for `[data-section-type="<TYPE>"]` elements on register and instantiates the matching class. In the theme editor, it also wires up all Shopify theme editor events (`shopify:section:load`, `shopify:section:unload`, `shopify:section:select`, etc.) and routes them to the correct section instance.

### Renderer Lifecycle (Taxi.js)

`BaseRenderer` (`_scripts/renderers/base.ts`) extends Taxi's `Renderer`:
- `onEnter()` — creates a new `SectionManager` and registers all page-level sections
- `onLeaveStart(duration)` — custom method called by `PageTransition`; awaits `section.onRendererLeaveStart()` on all instances so sections can run exit animations before the page transition begins
- `onLeaveCompleted()` — destroys the `SectionManager` and all its section instances

### BaseSection (`_scripts/sections/base.ts`)

All sections extend `BaseSection`. Key points:
- Requires `static TYPE: string` matching the `data-section-type` attribute in the Liquid template
- The Liquid element needs both `data-section-id="{{ section.id }}"` and `data-section-type="<TYPE>"`
- `this.container` is the section element; `this.id` and `this.type` are set automatically
- Listens to `taxi.navigateOut`, `taxi.navigateIn`, `taxi.navigateEnd` window events — override these methods for navigation-aware behavior
- `onRendererLeaveStart(transitionDuration)` — override to hook into the page leave animation
- `onUnload()` — called on destroy; calls `doComponentCleanup(this)` which recursively destroys all `BaseComponent` instances stored as properties or in arrays
- `GraphicCoverVideo` components are also initialized automatically from `BaseSection`

**Section constructor settings:**
```ts
{
  watchIntersection?: boolean;
  intersectionOptions?: IntersectionObserverInit;
}
```

### BaseComponent (`_scripts/components/base.ts`)

All components extend `BaseComponent`. Key points:
- Requires `static TYPE: string`; `static SELECTOR` is automatically derived as `[data-component="${TYPE}"]`
- The DOM element must have `data-component="<TYPE>"` attribute
- Constructor receives `(el: HTMLElement, options: BaseComponentSettings)`
- `doComponentCleanup(instance)` — exported helper that calls `destroy()` on all `BaseComponent` instances stored as properties or array properties of a given instance; called automatically by `BaseSection.onUnload()`

**Destroy method:** Only define `destroy()` in a subclass when the component has properties that aren't automatically cleaned up by `BaseComponent.destroy()`. Examples of things that require manual cleanup: event listeners attached to elements outside the component's `el` property, intersection/resize observers, GSAP timelines, timeouts, or any other resources that could cause memory leaks or delayed effects. If you do define `destroy()`, you **must always call `super.destroy()` at the bottom of the method**. Note that `destroy()` is called right before the component element is removed from the DOM, so event listeners attached to that element or its children are automatically garbage collected and do not need to be explicitly removed. See `_scripts/components/ajaxCart.ts` for a good example.

**Component constructor settings (avoid reimplementing these manually):**
```ts
{
  watchResize?: boolean;        // ResizeObserver on this.el → onResize(entries)
  watchBreakpoint?: boolean;    // listens to BreakpointsController event → onBreakpointChange(e)
  watchScroll?: boolean;        // window scroll → onScroll()
  watchCartUpdate?: boolean;    // CartAPI.EVENTS.UPDATE → onCartUpdate(e)
  watchIntersection?: boolean;  // IntersectionObserver on this.el → onIntersection(entries)
  intersectionOptions?: IntersectionObserverInit;
}
```

Components with `data-shopify-editor-block` automatically receive `onSelfBlockSelect` / `onSelfBlockDeselect` callbacks.

### Options/Settings Typing Convention

Components and sections that take constructor config follow the `XOptions` (caller-facing, all optional) → `settings` (internal, defaulted) pattern used by `BaseComponent`/`BaseSection`. Rules:

- **`?:` is the only optionality marker for config fields.** Never type an `Options` field as `T | null` — omission already means `undefined`; there's no reason to make callers pass `null` explicitly.
- **Reserve `| null` for mutable instance state**, not config — e.g. `#resizeObserver: ResizeObserver | null` or `backdrop: Backdrop | null` in `_scripts/components/drawer/index.ts`. These start `null` and get explicitly (re)assigned later (including back to `null` on `destroy()`), so `null` carries real meaning there.
- **Picking how to derive the internal settings type** — three patterns are all valid, pick based on how many fields get defaults:
  1. Every field gets a default → `type XSettings = Required<XOptions>` (see `base.ts`, `tabs.ts`).
  2. Some fields get defaults, others (typically `onX?: () => void` callbacks) never do → hand-write `XSettings extends XOptions` and only redeclare the defaulted fields as required (see `backdrop.ts`, `drawer/index.ts`, `productDetailForm.ts`). Do not use `Required<>` here — it would wrongly force never-defaulted callback props to be non-optional.
  3. No field ever gets a default (e.g. an all-callbacks options bag) → skip the separate Settings type entirely; type `settings` directly as `XOptions` and assign `{ ...options }` (see `ajaxCart.ts`, `quantityAdjuster.ts`, `resultsDisplay.ts`, `searchInline.ts`).
- **Don't add a per-section Options/Settings type speculatively.** Most sections take no constructor options at all; only add one when a section actually needs to pass non-default settings to `super()` (see `_scripts/sections/productRelated.ts` for the one section that does).

### Scoped DOM Queries (`qs` / `qsa` / `qsRequired`)

Both `BaseSection` and `BaseComponent` provide `qs<T>(selector)`, `qsa<T>(selector)`, and `qsRequired<T>(selector)` helpers that filter results to the current section/component scope — they do not traverse into nested `[data-component]` elements. This means two sibling components can both contain `[data-title]` without conflict.

Use these instead of `document.querySelector` / `this.el.querySelectorAll` to maintain proper isolation.

All three take an optional generic `T extends HTMLElement` (defaulting to `HTMLElement`) to narrow the return type, e.g. `this.qs<HTMLInputElement>('[data-input]')`. `qsRequired<T>` additionally throws if no match is found — use it for elements the section/component's own template requires to function, instead of a `qs()` call followed by a manual null check.

### Selectors and CSS Classes Convention

At the top of every section and component file, define selectors and CSS class names as plain objects:

```ts
const selectors = {
  title: '[data-title]',
  button: '[data-button]'
}

const classes = {
  isActive: 'is-active',
  isOpen: 'is-open'
}
```

**CSS state management:** Prefer HTML attributes (especially ARIA attributes) as CSS hooks over creating new state classes. Use selectors like `[aria-hidden="false"]`, `:not([aria-expanded="true"])`, `:has([aria-current="page"])` instead of `.is-open`, `.is-active`, etc. This keeps state management centralized in the DOM and reduces duplication between JavaScript and CSS. Only create new classes for non-state styling purposes.

**ARIA attributes:** When adding code that sets aria- attributes, always review and use the pre-existing helper functions in `@/core/utils/a11y.ts` — `setAriaFlag()`, `setAriaState()`, `setAriaCurrent()`, and `setLinkAriaCurrent()`. These handle the correct behavior for different aria attribute types (flags vs. states vs. `aria-current`). Do not set aria attributes directly; use these functions instead.

### `_scripts` Directory Structure

| Directory | Purpose |
|-----------|---------|
| `app.ts` | Entry point — initializes global controllers, global sections, and Taxi |
| `sections/` | One file per Shopify section; minimal logic, mostly component initialization |
| `components/` | Reusable UI components extending `BaseComponent`; contain most interactive logic |
| `renderers/` | Taxi renderers — `base.ts` handles page-level section lifecycle |
| `transitions/` | Taxi page transitions — `page.ts` handles enter/leave animations |
| `core/` | App-wide utilities, controllers, and API tools |
| `types/` | Hand-maintained TypeScript type definitions (`window.d.ts`, `shopify.ts`, `taxi.ts`) |

### Core Utilities

- `@/core/utils` — general helpers (`isThemeEditor`, `debounce`, `clamp`, `getQueryParams`, `prefersPointer`, `isTouch`, etc.)
- `@/core/utils/event` — `dispatch(eventName, detail)` for firing window `CustomEvent`s
- `@/core/utils/a11y` — `setAriaFlag` (removes attr when false — for flags like `aria-hidden`), `setAriaState` (always writes `'true'`/`'false'` — for states like `aria-expanded`), `setAriaCurrent`, `prefersReducedMotion`
- `@/core/utils/dom`, `string`, `currency`, `image` — domain-specific helpers
- `@/core/breakpointsController` — fires `change.breakpointsController` events on breakpoint change; breakpoints match Tailwind defaults (xs/sm/md/lg/xl/xxl)
- `@/core/cartAPI` — Shopify AJAX cart API; fires `cartAPI.update`, `cartAPI.add`, `cartAPI.change`, `cartAPI.remove` window events
- `@/core/sectionManager` — manages section instances and theme editor event routing
- `@/core/lazyImageController` — IntersectionObserver-based lazy loading for `.lazy-image` elements
- `@/core/gsap` — GSAP configured with custom easings (`slideEnter`, `slideLeave`) and utilities (`slideDown`, `slideUp`, `fadeIn`, `fadeOut`, `slideToggle`, `fadeToggle`); import gsap from here, not directly from the `gsap` package

### `window.app` Global

Typed in `_scripts/types/window.d.ts`:
- `window.app.taxi` — Taxi.js Core instance
- `window.app.breakpointsController` — global breakpoints controller
- `window.app.lazyImageController` - global lazy image controller (lazy loads images matching the selector `img.lazy-image`)
- `window.app.routes` — Shopify route URLs (cart, search, account, etc.)
- `window.app.strings` — localized UI strings (addToCart, soldOut, etc.)
- `window.app.klaviyo` — Klaviyo config (companyId, listId)

### Page Transition Events

`PageTransition` fires window events that sections can listen to:
- `enter.transition` / `afterEnter.transition`
- `leave.transition` / `afterLeave.transition`

### Liquid Snippets

**`snippets/drawer.liquid`** — renders a drawer element. Accepts an `origin` parameter (`'left'` or `'right'`, defaults to `'left'`) which controls slide-in direction via the `drawer--left` / `drawer--right` CSS modifier class.

### Theme Editor Integration

`SectionManager` routes all Shopify theme editor events to section instances by matching `sectionId`. Sections receive: `onSectionSelect`, `onSectionDeselect`, `onSectionReorder`, `onBlockSelect`, `onBlockDeselect`, `onUnload`.

In the theme editor, Taxi.js navigation is disabled (all links get `data-taxi-ignore`).
