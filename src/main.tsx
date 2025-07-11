
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import { registerSW } from './lib/pwa.ts'
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider'

// Register service worker for PWA functionality
registerSW();

createRoot(document.getElementById("root")!).render(
  <AccessibilityProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </AccessibilityProvider>
);
