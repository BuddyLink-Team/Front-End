import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import authReducer from '../../modules/auth/redux/authSlice';

/**
 * Custom render helper that wraps components with Redux Provider and Router.
 *
 * @param {React.ReactElement} ui - The component under test.
 * @param {object} [options]
 * @param {object} [options.preloadedState] - Initial Redux state.
 * @param {object} [options.store] - Custom store instance.
 * @param {string} [options.route] - Initial route path for MemoryRouter.
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState,
    }),
    route = '/',
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          {children}
        </MemoryRouter>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
