import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { widgetAPIPlugin } from './src/api/devServer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), widgetAPIPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    hmr: {
      overlay: false
    },
    // Enable CORS for widget development
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    // Configure server to handle larger headers
    // Note: The headers config here doesn't control Node.js header size
    // For Vite 5+, we need to use the middleware approach
  },
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        widget: fileURLToPath(new URL('./public/widget.js', import.meta.url)),
        tiendanubeWidget: fileURLToPath(new URL('./public/tiendanube-widget.js', import.meta.url))
      }
    }
  }
})
