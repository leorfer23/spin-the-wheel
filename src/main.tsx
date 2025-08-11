import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import { Router } from './Router'

// Import debug utilities in development
if (import.meta.env.DEV) {
  import('./utils/supabaseDebug');
  import('./utils/testWheelCreation');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <Router />
    </HelmetProvider>
  </StrictMode>,
)
