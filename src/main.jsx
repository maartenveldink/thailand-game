import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import { App } from './App'

// Maak base URL beschikbaar voor Phaser-scènes (vanilla JS, geen Vite-module)
window.ASSET_BASE = import.meta.env.BASE_URL

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
