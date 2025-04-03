import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import removeConsole from 'vite-plugin-remove-console'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
    ],
    css: {
      postcss: './postcss.config.js'
    },
    // Add Terser configuration for production builds
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          // Keep console.error and console.warn, remove other console methods
          pure_funcs: ['console.log', 'console.debug', 'console.info', 'console.trace', 'console.error', 'console.warn'],
        }
      }
    }
  }
})
