import { defineConfig } from 'vite'
import { resolve } from 'path'
import eslint from 'vite-plugin-eslint'
// import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve' || mode === 'development'

  return {
    root: __dirname,
    plugins: [
      eslint({
        include: ['_scripts/**/*.js'],
        exclude: ['node_modules/**', 'assets/**']
      }),
      // Uncomment to view bundle visualizer
      // visualizer({
      //   filename: 'dist/stats.html',
      //   open: true,
      //   gzipSize: true,
      //   brotliSize: true,
      //   template: 'treemap'
      // })      
    ],
    build: {
      outDir: 'assets',
      emptyOutDir: false, // Don't empty the output directory
      manifest: false,
      sourcemap: isDev,
      rollupOptions: {
        input: {
          app: resolve(__dirname, '_scripts/app.js')
        },
        output: {
          // Match your current naming convention
          entryFileNames: '[name].bundle.js',
          chunkFileNames: '[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            // Keep CSS files named consistently
            if (assetInfo.name?.endsWith('.css')) {
              return 'app.bundle.css'
            }
            return '[name]-[hash][extname]'
          }
        }
      },
      cssCodeSplit: false,
    },
    css: {
      devSourcemap: isDev,
      sourcemap: isDev,
      preprocessorOptions: {
        scss: {
          api: 'modern',
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, '_scripts'),
        '@styles': resolve(__dirname, '_styles')
      }
    },
    server: {
      watch: {
        ignored: ['**/node_modules/**', '**/assets/**']
      }
    }
  }
}) 