import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppErrorBoundary } from './components/feedback/AppErrorBoundary';
import './styles/index.css';
import { initMockServer } from './mock';

// Activate centralized Mock Server when running in mock mode (npm run dev:mock)
if (import.meta.env.MODE === 'mock' || import.meta.env.VITE_USE_MOCK === 'true') {
  initMockServer();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
