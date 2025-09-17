import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { performanceMonitor } from './utils/performanceMonitor.jsx';
import { handleError, logError } from './utils/djangoErrorHandler.js';

// Initialize global error handlers
const setupGlobalErrorHandlers = () => {
  // Global error handler
  window.addEventListener('error', (event) => {
    const errorInfo = handleError(event.error, 'Global Error Handler');
    logError(errorInfo);
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const errorInfo = handleError(event.reason, 'Unhandled Promise Rejection');
    logError(errorInfo);
  });
};

setupGlobalErrorHandlers();

// Initialize performance monitoring
performanceMonitor.observeCoreWebVitals();

// Unregister any existing service workers to fix workbox navigation issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Service Worker unregistered:', registration.scope);
    }
  }).catch(function(error) {
    console.error('Service Worker unregistration failed:', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


