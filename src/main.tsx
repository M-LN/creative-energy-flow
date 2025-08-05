import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, please refresh.')
    // You can show a refresh prompt here
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
  onRegistered(registration) {
    console.log('SW Registered: ', registration)
  },
  onRegisterError(error) {
    console.log('SW registration error', error)
  }
})

// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    // Monitor Core Web Vitals
    import('./utils/performance').then(({ reportWebVitals }) => {
      reportWebVitals()
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)