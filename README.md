# Cadaver 2.0

Cadaver is a custom architected, Shopify Online 2.0 theme boilerplate.


#### Features:
- Minimal JS framework for working with Shopify sections and DOM components.
- [Taxi.js](https://taxi.js.org/) with link pre-fetching built-in for fast, SPA like browsing experience
- [Tailwind V4](https://tailwindcss.com/) for styling
- Vite-powered typeScript and CSS bundling with sourcemaps in dev, minified builds in production
- 95+ scoring on all lighthouse speed tests out of the box.
- Lazy image loading
- Automatic section lifecycle management
- GSAP powered animations and page transitions
- A11y best practices throughout (ARIA attributes, focus management, reduced-motion support)
- Pre-built interactive components with animations, keyboard navigation, and ARIA support

#### JavaScript Architecture:

The frontend application is architected around three core concepts:

1. **Two-tier section system** — Layout level sections persist across page navigations. Template-level sections are torn down and re-initialized on each navigation via the Taxi.js
 [renderer](_scripts/renderers/base.ts). Both tiers are managed by [SectionManager](_scripts/core/sectionManager.ts) with full [Shopify theme editor
 event](https://shopify.dev/docs/storefronts/themes/best-practices/editor/integrate-sections-and-blocks) support.
2. **Nestable components with auto-cleanup** — UI logic lives in [BaseComponent](_scripts/components/base.ts) subclasses. Parent sections automatically destroy all child components on cleanup, preventing memory leaks.
3. **SPA-like page transitions** — [BaseRenderer](_scripts/renderers/base.ts) coordinates section lifecycle with Taxi.js [PageTransition](_scripts/transitions/page.ts), allowing sections to run exit animations before the page transition begins.

#### Note:
> This is a working theme that I use as a boilerplate for all production Shopify projects.  I continutally update it so that I can leverage all of the core e-commerce solutions that I have developed on previous projects.  It is not built as a production-ready theme, but rather a battle-tested foundation for quickly creating new themes.  It contains minimal styling on purpose.

> I do not "version" this theme as it is a constant work in progress.  Please note it is liable to change at any time.

## Real World Examples
Production examples of this project in action:
- [The GitHub Shop](https://thegithubshop.com/)
- [Fucking Awesome](https://faworldentertainment.com/)
- [Kartik Research](https://kartikresearch.com)
- [+44](https://plus44.world/)
- [SIHA](https://siha.com.au/) - by [@AllanPooley](https://github.com/AllanPooley)
- [Palantir Store](https://store.palantir.com/) - by [Doubleday & Cartwright
](https://www.doubledayandcartwright.com/)

## Pre-built Components

Ready-to-use, interactive components with ARIA compliance and theme editor integration.

| Component | Description | Source | Snippets |
|---|---|---|---|
| Tabs | Animated tab panels with keyboard navigation and GSAP-powered transitions. | [`tabs.ts`](_scripts/components/tabs.ts) | [`tabs-tab.liquid`](snippets/tabs-tab.liquid), [`tabs-tabpanel.liquid`](snippets/tabs-tabpanel.liquid) |
| Drawer | Slide-in drawer with focus trap, optional backdrop, and breakpoint-aware auto-close. | [`drawer/index.ts`](_scripts/components/drawer/index.ts) | [`drawer.liquid`](snippets/drawer.liquid) |
| Accordion | Collapsible content panels with animated expand/collapse, single or multi-open modes. | [`accordion.ts`](_scripts/components/accordion.ts), [`accordionItem.ts`](_scripts/components/accordionItem.ts) | [`accordion-item.liquid`](snippets/accordion-item.liquid) |
| Quantity Adjuster | Numeric input component with increment/decrement buttons, validation, and configurable min/max bounds. | [`quantityAdjuster.ts`](_scripts/components/quantityAdjuster.ts) | [`quantity-adjuster.liquid`](snippets/quantity-adjuster.liquid) |

## Project Structure

```
├── _scripts
│   └── Working typescript files.  Bundled as `app.bundle.js`.
├── _styles
│   └── Working css files.  Bundled as `app.bundle.css`.
├── assets
│   └── Javascript, CSS, Font Files, Images, SVGs, etc..
├── config
│   └── settings_data.json
│   └── settings_schema.json
├── layout
│   ├── theme.liquid
│   └── Alternate layouts (optional)
├── sections
│   ├── shopify sections
├── snippets
│   └── optional custom code snippets
├── templates
│   ├── customers/
│   ├── 404.json
│   ├── article.json
│   ├── blog.json
│   ├── cart.json.liquid
│   ├── cart.liquid
│   ├── collection.json
│   ├── index.json
│   ├── list-collections.json
│   ├── page.json
│   ├── password.json
│   ├── product.json
│   └── search.json
```

## Development


```bash
npm run dev      # Vite watch build (sourcemaps, no minification)
npm run build    # Production build (minified)

# Run alongside Shopify CLI in a separate terminal:
shopify theme dev --store={store_id}
```

## Manual Deployment
> __Note__: this process is only necessary for themes that do _not_ use the GitHub integration.  This is an entirely manual process that I use to push a single codebase to multiple stores.

Deploying updates to the site is a multi-step process as we need to push code changes while preserving the template settings on the live theme.

First, duplicate the live theme.  Name is appropriately (e.g. Cadaver - [Deploy])

Second, when pulling down changes, we *only* want to pull json template files as these contain all of the settings for the live site.  To do this, make sure that the `.shopifyignore` file contains the following:

```
# .shopifyignore

sections/
snippets/
assets/
layout/
blocks/
templates/cart.json.liquid
locales/en.default.json
config/settings_schema.json
```

Next:
```
# Checkout a separate branch for safety
$ git checkout -b deploy origin/main

# Pull down remote theme files
$ shopify theme pull

# Select the duplicated theme from earlier
$ > Cadaver - [Deploy] [unpublished]

# Verify that the previous command only affected json template files
$ git status
```
Note: `shopify theme pull` overrides files, it does not merge them.

Because of this, any code changes made to `.json` templates will be overwritten.  If the changes you are deploying added additional sections to any of these, they will need to be reconciled manually.  If not, you will likely see an error when pushing (e.g. `section does not exist`).

At this stage, we've pulled the settings from the (duplicated) live theme onto our local copy which contains the latest `main` branch code.  Since the `main` branch is ahead of the live theme, we now need to reverse the process and push our local changes.

First, update the `.shopifyignore` file to remove the lines added earlier.  It should be empty:

```
# .shopifyignore

```

Next:
```
# Compile assets for production deploy
$ npm run build

# Push the files up to the store
$ shopify theme push

# Select the duplicated theme from earlier
$ > Cadaver - [Deploy] [unpublished]
```

View the theme and verify that the update code is running and that no site settings have been lost.  Publish the duplicated theme through the Shopify Theme Admin.  Rename it to reflect the changes:

```
Cadaver - [Deploy] -> Cadaver - Live [hash] # Include git hash
```

🎉 Deployment Complete 🎉

Lastly, cleanup your git state by removing the local changes and deleting the deployment branch
```
$ git reset HEAD --hard
$ git checkout main
$ git branch -D deploy
```