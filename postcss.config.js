import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    tailwindcss('./tailwind.config.js'),
    autoprefixer
  ]
}

export default config