import React, { ReactNode } from 'react'
import { Navigation } from './Navigation'

interface AppShellProps {
  children: ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="app-shell">
      <div className="app-container safe-area-top safe-area-bottom">
        {children}
        <Navigation />
      </div>
      
      <style jsx>{`
        .app-shell {
          min-height: 100vh;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
        }
        
        .app-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 100vw;
          overflow-x: hidden;
        }
        
        @media (min-width: 768px) {
          .app-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 var(--spacing-md);
          }
        }
        
        /* PWA display adjustments */
        @media (display-mode: standalone) {
          .app-shell {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
        
        /* Status bar integration for iOS */
        @supports (padding: max(0px)) {
          .app-shell {
            padding-top: max(env(safe-area-inset-top), 0px);
            padding-bottom: max(env(safe-area-inset-bottom), 0px);
          }
        }
      `}</style>
    </div>
  )
}