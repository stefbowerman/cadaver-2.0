// General
const path = require('path')

// Plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Directories
const rootDir = path.resolve(__dirname)

const nodeDir = path.join(rootDir, 'node_modules')
const scriptsDir = path.join(rootDir, '_scripts')
const stylesDir = path.join(rootDir, '_styles')


// Common configuration
module.exports = {
  entry: {
    app: [
      path.join(scriptsDir, 'app.js'),
      path.join(stylesDir, 'app.scss')
    ]
  },
  output: {
    filename: 'app.bundle.js',
    path: __dirname + '/assets'
  },
  mode: 'production',
  // devtool: 'source-map',
  plugins: [
    // Extract CSS to separate css file
    new MiniCssExtractPlugin({
      filename: '[name].bundle.css'
    })
  ],
  module: {
    rules: [
      // Bundling JS
      {
        test: /\.m?js$/,
        exclude: nodeDir,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },      
      // Bundling SCSS
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          // Creates `style` nodes from JS strings
          MiniCssExtractPlugin.loader,
          
          // Translates CSS into CommonJS
          'css-loader',

          // Postcss
          // @TODO - Look into this! -> https://www.npmjs.com/package/postcss-merge-rules
          // {
          //   loader: 'postcss-loader',
          //   options: {
          //     postcssOptions: require(path.join(
          //       configDir,
          //       'postcss.config.js'
          //     )),
          //   },
          // },
          
          // Compile to CSS
          'sass-loader'
        ]
      }
    ]
  }  
}