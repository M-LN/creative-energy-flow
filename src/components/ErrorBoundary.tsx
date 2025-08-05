import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Report error to monitoring service
    if ('reportError' in window) {
      (window as any).reportError(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
            </details>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="retry-button"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="reload-button"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}