import apiClient from '../services/apiClient';
import adminMockHandlers from '../modules/admin/mock/adminMockHandlers';
import playdateMockHandlers from '../modules/playdate/mock/playdateMockHandlers';
import subscriptionMockHandlers from '../modules/subscription/mock/subscriptionMockHandlers';
import connectionMockHandlers from '../modules/connection/mock/connectionMockHandlers';
import notificationMockHandlers from '../modules/notification/mock/notificationMockHandlers';
import { STORAGE_KEYS } from '../constants/storage.constants';
import {
  MOCK_CURRENT_USER,
  MOCK_CURRENT_PARENT,
} from '../modules/playdate/mock/playdateMockData';

export const MOCK_ADMIN_USER = {
  id: 'user-admin-1',
  email: 'admin@buddylink.com',
  fullName: 'Quản trị viên Hệ thống',
  role: 'admin',
};

const adminLoginResponse = async () => ({
  success: true,
  data: {
    user: MOCK_ADMIN_USER,
    parent: null,
    tokens: {
      accessToken: 'mock-jwt-token-admin',
      refreshToken: 'mock-refresh-token-admin',
    },
  },
});

const adminMeResponse = async () => ({
  success: true,
  data: {
    user: MOCK_ADMIN_USER,
    parent: null,
  },
});

/**
 * Centralized Mock Registry
 * Any developer can easily plug their module handlers here without touching production API code!
 */
const authMockHandlers = [
  // Admin auth endpoints (handles when URL is prefixed with /admin)
  {
    method: 'GET',
    pattern: '/admin/auth/me',
    handler: adminMeResponse,
  },
  {
    method: 'POST',
    pattern: '/admin/auth/login',
    handler: adminLoginResponse,
  },
  {
    method: 'POST',
    pattern: '/admin/auth/logout',
    handler: async () => ({ success: true, message: 'Logged out successfully' }),
  },

  // Standard/Parent auth endpoints
  {
    method: 'GET',
    pattern: '/auth/me',
    handler: async () => ({
      success: true,
      data: {
        user: IS_ADMIN_PORTAL ? MOCK_ADMIN_USER : MOCK_CURRENT_USER,
        parent: IS_ADMIN_PORTAL ? null : MOCK_CURRENT_PARENT,
      },
    }),
  },
  {
    method: 'POST',
    pattern: '/auth/login',
    handler: async () => ({
      success: true,
      data: {
        user: IS_ADMIN_PORTAL ? MOCK_ADMIN_USER : MOCK_CURRENT_USER,
        parent: IS_ADMIN_PORTAL ? null : MOCK_CURRENT_PARENT,
        tokens: {
          accessToken: 'mock-jwt-token-playdates',
          refreshToken: 'mock-refresh-token-playdates',
        },
      },
    }),
  },
  {
    method: 'POST',
    pattern: '/auth/logout',
    handler: async () => ({ success: true, message: 'Logged out successfully' }),
  },
];

const mockHandlers = [
  ...adminMockHandlers,
  ...authMockHandlers,
  ...playdateMockHandlers,
  ...subscriptionMockHandlers,
  ...connectionMockHandlers,
  ...notificationMockHandlers,
  // Other developers can easily add their module mock handlers here:
  // ...chatMockHandlers,
  // ...authMockHandlers,
  // ...discoveryMockHandlers,
];

import { IS_ADMIN_PORTAL } from '../constants/app.constants';

/**
 * Normalize request path by stripping origin, baseURL and query string
 */
const normalizePath = (url = '', baseURL = '') => {
  let full = url;
  if (baseURL && !/^https?:\/\//i.test(url)) {
    full = baseURL.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '');
  }
  let path = full
    .replace(/^https?:\/\/[^/]+/, '') // remove origin e.g. http://localhost:5000 or http://localhost:5001
    .replace(/^\/api\/v1/, '')        // remove /api/v1 prefix -> leaving /admin/playdates or /playdates
    .replace(/\?.*$/, '');            // remove query string

  if (IS_ADMIN_PORTAL && !path.startsWith('/admin')) {
    path = '/admin' + (path.startsWith('/') ? path : '/' + path);
  }

  return path;
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
    const path = normalizePath(config.url, config.baseURL);
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
    const existingUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_INFO) || 'null');
    const isMismatch = IS_ADMIN_PORTAL ? existingUser?.role !== 'admin' : existingUser?.role === 'admin';

    if (!existingToken || isMismatch) {
      const isAdm = IS_ADMIN_PORTAL;
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, isAdm ? 'mock-jwt-token-admin' : 'mock-jwt-token-playdates');
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, isAdm ? 'mock-refresh-token-admin' : 'mock-refresh-token-playdates');
      localStorage.setItem(
        STORAGE_KEYS.USER_INFO,
        JSON.stringify(isAdm ? MOCK_ADMIN_USER : MOCK_CURRENT_USER)
      );
      if (isAdm) {
        localStorage.removeItem(STORAGE_KEYS.PARENT_INFO);
      } else {
        localStorage.setItem(STORAGE_KEYS.PARENT_INFO, JSON.stringify(MOCK_CURRENT_PARENT));
      }
    }
  }

  console.log(
    '%c🎭 BuddyLink Central Mock Engine Active (Axios Adapter)',
    'background: #10B981; color: #fff; font-size: 13px; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
  );
};

export default initMockServer;
