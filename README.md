# Cadaver 2.0

Cadaver is a custom architected, Shopify Online 2.0 theme boilerplate.

__In Action__ - Used as the starter theme for the official [GitHub Shop](https://thegithubshop.com/).

__Features:__
- Minimal JS framework for working with Shopify sections and DOM components.
- [Taxi.js](https://taxi.js.org/) with link pre-fetching built-in for fast, SPA like browsing experience
- [Tailwind](https://v3.tailwindcss.com/) for styling
- Webpack configuration for bundling SCSS and JS files
- 95+ scoring on all lighthouse speed tests.
- Lazy image loading
- GSAP powered animations and page transitions
- A11y best practices

__JavaScript Architecture:__
The frontend application is architected with three primary goals:
1. SPA-like browsing experience via Taxi.js.
2. First-class section elements via [BaseSection](_scripts/sections/base.ts) class combined with a [SectionManager](_scripts/core/sectionManager.ts) class to handle all Shopify [theme editor events](https://shopify.dev/docs/storefronts/themes/best-practices/editor/integrate-sections-and-blocks) along with initialization and clean up during the Taxi.js [renderer lifecycle](https://taxi.js.org/renderers/).
3. Nestable components with auto-cleanup via [BaseComponent](_scripts/components/base.ts) class.

> Note: This is a working theme that I use as a boilerplate for all production Shopify projects.  I continutally update it so that I can leverage all of the core e-commerce solutions that I have developed on previous projects.  It is not built as a production-ready theme, but rather a battle-tested foundation for quickly creating new themes.  It contains minimal styling on purpose.

> I do not "version" this theme as it is a constant work in progress.  Please note it is liable to change at any time.

## Project Structure

```
├── _js
│   └── Working typescript files.  Bundled as `app.bundle.ts`.
├── _styles
│   └── Working scss files.  Bundled as `app.bundle.css`.
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

## NPM Scripts

- Start vite dev process -> `npm run dev`
- Compile for production -> `npm run build`

## Development

- Node version - `v22.XX`

```
$ npm run dev

# Start the theme watcher in another terminal
$ shopify theme dev --store={store_id}
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