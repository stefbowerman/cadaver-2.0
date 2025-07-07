const tailwindcss = require('tailwindcss')('./tailwind.config.js');
// const autoprefixer = require('autoprefixer');

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    tailwindcss,
    // autoprefixer
  ]
}

module.exports = config