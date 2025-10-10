import { resolve } from 'path'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
    
  return {
    plugins: [
      eslint({
        include: ['_scripts/**/*.{js,ts}'],
        exclude: ['node_modules']
      }),
      visualizer({
        open: false //
      })
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
        entry: resolve(__dirname, '_scripts/app.js'),
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
          drop_console: true,
          drop_debugger: true,
          passes: 2
        }
      },

      cssCodeSplit: false
    },

    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern'
        }
      },
      postcss: './postcss.config.js',
    }    
  }
})