import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '../../modules/auth/redux/authSlice';
import childReducer from '../../modules/child/redux/childSlice';
import subscriptionReducer from '../../modules/subscription/redux/subscriptionSlice';
import playdateReducer from '../../modules/playdate/redux/playdateSlice';

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
        child: childReducer,
        subscription: subscriptionReducer,
        playdate: playdateReducer,
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

// Test helper module (never hot-reloaded): re-exports Testing Library next to renderWithProviders
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
