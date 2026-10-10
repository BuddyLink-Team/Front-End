import apiClient from '../services/apiClient';
import playdateMockHandlers from '../modules/playdate/mock/playdateMockHandlers';
import subscriptionMockHandlers from '../modules/subscription/mock/subscriptionMockHandlers';
import { STORAGE_KEYS } from '../constants/storage.constants';
import {
  MOCK_CURRENT_USER,
  MOCK_CURRENT_PARENT,
} from '../modules/playdate/mock/playdateMockData';

/**
 * Centralized Mock Registry
 * Any developer can easily plug their module handlers here without touching production API code!
 */
const mockHandlers = [
  ...playdateMockHandlers,
  ...subscriptionMockHandlers,
  // Other developers can easily add their module mock handlers here:
  // ...chatMockHandlers,
  // ...authMockHandlers,
  // ...discoveryMockHandlers,
];

/**
 * Normalize request path by stripping origin, baseURL and query string
 */
const normalizePath = (url = '') => {
  return url
    .replace(/^https?:\/\/[^/]+/, '') // remove http://localhost:5000
    .replace(/^\/api\/v1/, '')        // remove /api/v1 prefix
    .replace(/\?.*$/, '');            // remove query string
};

/**
 * Parse query parameters from config.params and URL query string
 */
const parseQueryParams = (url = '', configParams = {}) => {
  const params = { ...configParams };
  if (url && url.includes('?')) {
    const search = url.split('?')[1];
    const urlParams = new URLSearchParams(search);
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
  }
  return params;
};

/**
 * Match route pattern (e.g. '/playdates/:id/reschedule') against actual path
 */
const matchRoute = (pattern, path) => {
  const paramNames = [];
  const regexPattern = pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  });
  const regex = new RegExp(`^${regexPattern}$`);
  const match = path.match(regex);
  if (!match) return null;

  const params = {};
  paramNames.forEach((name, idx) => {
    params[name] = match[idx + 1];
  });
  return params;
};

/**
 * Initialize centralized HTTP Mock Engine
 * Intercepts requests transparently at the Axios network adapter level
 */
export const initMockServer = () => {
  // Capture the original Axios network adapter
  const originalAdapter = apiClient.defaults.adapter;

  // Replace with mock intercepting adapter
  apiClient.defaults.adapter = async (config) => {
    const method = (config.method || 'GET').toUpperCase();
    const path = normalizePath(config.url);
    const query = parseQueryParams(config.url, config.params);

    let body = {};
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data || {};
    } catch {
      body = config.data || {};
    }

    // Search for a matching registered mock handler
    for (const item of mockHandlers) {
      if (item.method.toUpperCase() === method) {
        const routeParams = matchRoute(item.pattern, path);
        if (routeParams !== null) {
          try {
            const responseData = await item.handler({
              params: routeParams,
              query,
              body,
              config,
            });

            return {
              data: responseData,
              status: 200,
              statusText: 'OK',
              headers: { 'content-type': 'application/json' },
              config,
            };
          } catch (err) {
            const status = err.response?.status || err.status || 400;
            const errData = err.response?.data || {
              success: false,
              message: err.message || 'Mock Error',
              error: { code: 'MOCK_ERROR' },
            };
            return Promise.reject({
              response: {
                data: errData,
                status,
                statusText: 'Mock Error',
              },
            });
          }
        }
      }
    }

    // If no mock handler matched, pass through to the original network adapter
    if (typeof originalAdapter === 'function') {
      return originalAdapter(config);
    }

    return Promise.reject(
      new Error(`[MockServer] No mock handler matched for ${method} ${path}`)
    );
  };

  // Auto-seed mock authentication session in localStorage if not already authenticated
  if (typeof window !== 'undefined') {
    const existingToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!existingToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'mock-jwt-token-playdates');
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(MOCK_CURRENT_USER));
      localStorage.setItem(STORAGE_KEYS.PARENT_INFO, JSON.stringify(MOCK_CURRENT_PARENT));
    }
  }

  console.log(
    '%c🎭 BuddyLink Central Mock Engine Active (Axios Adapter)',
    'background: #10B981; color: #fff; font-size: 13px; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
  );
};

export default initMockServer;
