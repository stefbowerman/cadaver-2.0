import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  corePlugins: {
    container: false // Define our own in app.scss
  },
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
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        red: '#F00',
        blue: '#00F',
        grey: '#999'
      },      
      spacing: {
        container: '1rem',
      },      
      fontFamily: {
        sans: [
          'Helvetica Neue LT',
          ...defaultTheme.fontFamily.sans
        ],
        // mono: [
        //   'courier'
        // ]
      },
      zIndex: {
        '1': 1,
        '2': 2,
        'header': 100,
        'backdrop': 199,
        'ajax-cart': 200,
        'drawer': 200,
        // skipTo: 10000
      }
    },
  },
  plugins: [],
}