import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import AppRoutes from './routes/appRoutes';

export function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" reverseOrder={false} />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
