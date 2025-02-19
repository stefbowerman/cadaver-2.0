# Cadaver 2.0

Cadaver is a starter Shopify Online 2.0 Theme.

__Features:__
- Minimal JS framework for working with Shopify sections and [dom components](_scripts/components/base.js).
- [Taxi.js](https://taxi.js.org/) with link pre-fetching built-in for fast, SPA like browsing experience
- [Tailwind CSS v3](https://v3.tailwindcss.com/) for styling
- Webpack configuration for bundling SCSS and JS files
- 95+ scoring on all lighthouse speed tests.

__Note:__

This is a working theme that I use as a boilerplate for all production Shopify projects.  I continutally update it so that I can leverage all of the core e-commerce solutions that I have developed on previous projects.  It is not built as a production-ready theme, but rather a battle-tested foundation for quickly creating new themes.  It contains minimal styling on purpose.

I do not "version" this theme as it is a constant work in progress.  Please note it is liable to change at any time.

##### Node
`v22.7.0`

## Project Structure

```
├── _js
│   └── Working javascript files.  Bundled as `app.bundle.js`.
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

- Start webpack watcher -> `npm run dev`
- Compile for production -> `npm run build`

## Getting Started
If setting this up for the first time via the CLI, be sure to remove all the contents of the `.shopifyignore` file.  This will ensure that all required files are copied to the uploadedtheme.


## Development

```
# Start the webpack watcher
$ npm run dev

# Start the theme watcher in another terminal
$ shopify theme dev --store={store_id} --theme={theme_id}
```

> Note: I prefer to develop against normal, [non-development themes](https://shopify.dev/docs/storefronts/themes/tools/cli#development-themes), this is why I specify the theme ID when running the watcher.  With this, the default contents of `.shopifyignore` contains all JSON templates and JSON settings data.  

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
templates/cart.json.liquid
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