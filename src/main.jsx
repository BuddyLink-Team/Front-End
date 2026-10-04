import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppErrorBoundary } from './components/feedback/AppErrorBoundary';
import './styles/index.css';
import { STORAGE_KEYS } from './constants/storage.constants';
import {
  MOCK_CURRENT_USER,
  MOCK_CURRENT_PARENT,
} from './modules/playdate/mock/playdateMockData';

// Auto-seed mock authentication session in mock mode
const isMock = import.meta.env.MODE === 'mock' || import.meta.env.VITE_USE_MOCK === 'true';
if (isMock && typeof window !== 'undefined') {
  const existingToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (!existingToken) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'mock-jwt-token-playdates');
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(MOCK_CURRENT_USER));
    localStorage.setItem(STORAGE_KEYS.PARENT_INFO, JSON.stringify(MOCK_CURRENT_PARENT));
  }
  // Console indicator for development convenience
  console.log(
    '%c🎭 BuddyLink MOCK MODE ACTIVE (Playdates)',
    'background: #4F46E5; color: #fff; font-size: 13px; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
