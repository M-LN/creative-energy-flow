import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  return (
    <div 
      className={`loading-spinner loading-spinner--${size}`}
      role="status"
      aria-label={text}
    >
      <div className="spinner" aria-hidden="true">
        <svg viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="31.416"
            strokeDashoffset="31.416"
          >
            <animate
              attributeName="stroke-dasharray"
              dur="2s"
              values="0 31.416;15.708 15.708;0 31.416"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-dashoffset"
              dur="2s"
              values="0;-15.708;-31.416"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
      <span className="loading-text">{text}</span>
      
      <style jsx>{`
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          padding: var(--spacing-xl);
        }
        
        .loading-spinner--sm .spinner {
          width: 24px;
          height: 24px;
        }
        
        .loading-spinner--md .spinner {
          width: 40px;
          height: 40px;
        }
        
        .loading-spinner--lg .spinner {
          width: 64px;
          height: 64px;
        }
        
        .spinner {
          color: var(--color-primary);
        }
        
        .loading-text {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .spinner svg circle {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}