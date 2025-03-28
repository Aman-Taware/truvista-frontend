import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode causes double rendering in development mode,
  // which makes it look like components are reloading multiple times.
  // Removing it for better performance.
  <App />
)

// Register the service worker for offline capabilities and caching
// This enables the property image caching functionality
serviceWorkerRegistration.register();
