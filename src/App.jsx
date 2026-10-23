import React, { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './app/store';
import { ScrollToTop } from './components';
import { LoadingOverlay } from './components/feedback/LoadingOverlay';
import { IS_ADMIN_PORTAL } from './constants/app.constants';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// One portal per build: the parent app never ships admin pages and the admin build never ships parent pages
const PortalRoutes = lazy(() =>
  IS_ADMIN_PORTAL ? import('./routes/AdminAppRoutes') : import('./routes/appRoutes'),
);

export function App() {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<LoadingOverlay show fullPage message="Đang tải giao diện..." />}>
            <PortalRoutes />
          </Suspense>
          <Toaster position="top-right" reverseOrder={false} />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </Provider>
  );
}

export default App;
