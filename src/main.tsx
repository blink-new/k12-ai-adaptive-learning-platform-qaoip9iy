import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <Toaster position="top-right" />
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)