// const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './_scripts/**/*.js',
    './_styles/**/*.scss',
    './templates/**/*.liquid',
    './snippets/**/*.liquid',
    './layout/**/*.liquid',
    './sections/**/*.liquid'
  ],
  future: {
    hoverOnlyWhenSupported: true
  },  
  theme: {
    extend: {
      fontFamily: {
        // sans: [
        //   'Helvetica Neue',
        //   ...defaultTheme.fontFamily.sans
        // ],
        // mono: [
        //   'courier'
        // ]        
      }
    },
  },
  variants: {
    extend: {
      // zIndex: {
      //   'header': 101
      // }      
    },
  },
  plugins: [],
}