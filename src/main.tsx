import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './lib/api.ts';
import { testConnection } from './lib/firebase.ts';
import ErrorBoundary from './components/ErrorBoundary.tsx';

// Initialize connectivity test
testConnection();

// Register Service Worker for Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log('SW registered: ', registration);
      
      // Auto-register Median push if permission already exists
      if (Notification.permission === 'granted' && ((window as any).median || (window as any).gonative)) {
        const bridge = (window as any).median || (window as any).gonative;
        bridge.nativebridge.postMessage(JSON.stringify({ type: 'push', action: 'register' }));
      }
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>,
);
