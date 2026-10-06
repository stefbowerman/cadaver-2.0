import { resolve } from 'path'
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
    
  return {
    plugins: [
      visualizer({
        open: false //
      }),
      tailwindcss()
    ],


    resolve: {
      alias: {
        '@': resolve(__dirname, '_scripts')
      }
    },

    build: {
      watch: isDev ? {} : null,
      lib: {
        name: 'app',
        entry: resolve(__dirname, '_scripts/app.ts'),
        formats: ['iife'], 
        fileName: () => 'app.bundle.js'
      },
      outDir: 'assets',
      emptyOutDir: false,

      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.names[0].endsWith('.css')) {
              return 'app.bundle.css'
            }

            return '[name][extname]'
          }
        }
      },

      sourcemap: isDev ? true : false,
      minify: isDev ? false : 'terser',
      terserOptions: {
        compress: {
          drop_debugger: true,
          passes: 2
        }
      },

      cssCodeSplit: false
    }
  }
})