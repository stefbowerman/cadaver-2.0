# Cadaver 2.0

Cadaver is a starter Shopify Online 2.0 Theme.

##### Node
`v20.8.0`

__Features:__
- Minimal JS framework for working with Shopify sections.
- [Taxi.js](https://taxi.js.org/) + [instantpage.js](https://instant.page/) built-in for fast, SPA like browsing experience
- Webpack configuration for bundling SCSS and JS files
- 95+ scoring on all lighthouse speed tests.

## NPM Scripts

- Start webpack watcher -> `npm run dev`
- Compile for production -> `npm run build`

## Project Structure

```
├── _js
│   └── Working javascript files.  Bundled by Webpack and exported to /assets directory.
├── _scss
│   └── Working scss files.  Bundled by Webpack and exported to /assets directory.
├── assets
│   └── Javascript, CSS, Font Files, Images, etc..
├── config
│   └── custom Theme Settings
├── layout
│   ├── theme.liquid
│   ├── password.liquid
│   └── optional alternate layouts
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

## Deployment
Deploying updates to the site is a multi-step process as we need to push code changes while preserving the template settings on the live theme.

First, duplicate the live theme.  Name is appropriately (e.g. GLCO - [Deploy])

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