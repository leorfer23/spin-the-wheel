import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { widgetAPIPlugin } from './src/api/devServer'
import { oauthAPIPlugin } from './src/api/oauthServer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Set environment variables to process.env so plugins can access them
  Object.assign(process.env, env)
  
  return {
    plugins: [react(), widgetAPIPlugin(), oauthAPIPlugin()],
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        tiendanubeWidget: fileURLToPath(new URL('./public/tiendanube-widget.js', import.meta.url))
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-slot', '@radix-ui/react-tabs', '@radix-ui/react-tooltip', '@radix-ui/react-switch', '@radix-ui/react-slider', '@radix-ui/react-collapsible', '@radix-ui/react-form'],
          'animation-vendor': ['framer-motion', 'canvas-confetti'],
          'supabase-vendor': ['@supabase/supabase-js', '@tanstack/react-query'],
          'chart-vendor': ['recharts'],
          'utils': ['clsx', 'tailwind-merge', 'class-variance-authority', 'lucide-react', 'date-fns']
        }
      }
    }
  }
  }
})
