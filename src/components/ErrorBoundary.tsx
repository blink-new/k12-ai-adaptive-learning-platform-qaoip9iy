import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log error info here if needed
    // console.error(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-700 mb-2">{this.state.error?.message}</p>
          <p className="text-gray-500 text-sm">Please try refreshing the page or contact support if the issue persists.</p>
        </div>
      )
    }
    return this.props.children
  }
}
