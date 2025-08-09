import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Separate Vite config for building the widget bundle
export default defineConfig({
  plugins: [react()],
  publicDir: false, // Disable public directory for widget build
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/widget/index.tsx'),
      name: 'CoolPopsWidget',
      fileName: 'widget-bundle',
      formats: ['iife'] // Immediately Invoked Function Expression for browser
    },
    outDir: 'public',
    emptyOutDir: false, // Don't clear public directory
    rollupOptions: {
      external: [], // Bundle everything
      output: {
        // Ensure we don't pollute global scope
        format: 'iife',
        inlineDynamicImports: true,
        // Minimize the bundle
        compact: true,
        // CSS in separate file
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'widget-bundle.css';
          }
          return assetInfo.name || '';
        }
      }
    },
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging
        drop_debugger: true
      }
    },
    // Target modern browsers
    target: 'es2015',
    sourcemap: false
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});