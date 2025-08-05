import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { OfflineIndicator } from './components/OfflineIndicator'
import { AppShell } from './components/AppShell'
import { LoadingSpinner } from './components/LoadingSpinner'

// Lazy load components for code splitting
const Dashboard = lazy(() => import('./components/Dashboard'))
const EnergyLogger = lazy(() => import('./components/EnergyLogger'))
const Charts = lazy(() => import('./components/Charts'))
const SocialBattery = lazy(() => import('./components/SocialBattery'))
const AIInsights = lazy(() => import('./components/AIInsights'))
const Settings = lazy(() => import('./components/Settings'))
const Privacy = lazy(() => import('./components/Privacy'))

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppShell>
          <PWAInstallPrompt />
          <OfflineIndicator />
          
          <main role="main" className="flex-1">
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            
            <div id="main-content" tabIndex={-1}>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/log" element={<EnergyLogger />} />
                  <Route path="/charts" element={<Charts />} />
                  <Route path="/social" element={<SocialBattery />} />
                  <Route path="/insights" element={<AIInsights />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/privacy" element={<Privacy />} />
                </Routes>
              </Suspense>
            </div>
          </main>
        </AppShell>
      </Router>
    </ErrorBoundary>
  )
}

export default App