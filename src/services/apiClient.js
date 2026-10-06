import axios from 'axios';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { API_ENDPOINTS } from '../constants/api.constants';
import { CLIENT_ERROR_CODES } from '../constants/error.constants';
import socketService from './socket';
import tokenStore from './tokenStore';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Exchange the stored refresh token for a new token pair (the backend rotates the refresh token).
 * @returns {Promise<string>} New access token
 */
const refreshAccessToken = async () => {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const { data } = await axios.post(`${baseURL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, { refreshToken });
  const tokens = data?.data;
  if (!tokens?.accessToken || !tokens?.refreshToken) {
    throw new Error('Refresh response did not contain a token pair');
  }
  tokenStore.setTokens(tokens);
  return tokens.accessToken;
};

/**
 * Drop the local session (cached profile + tokens) and go to the login page.
 */
const endSession = () => {
  tokenStore.clear();
  socketService.disconnect();
  localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  localStorage.removeItem(STORAGE_KEYS.PARENT_INFO);
  window.location.href = '/login';
};

// Request interceptor: attach bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStore.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle automatic token refresh and global error formatting
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Endpoints whose 401 means "wrong credentials / no session", not "access token expired"
const NO_REFRESH_ENDPOINTS = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.ADMIN_LOGIN,
  API_ENDPOINTS.AUTH.REGISTER,
  API_ENDPOINTS.AUTH.REFRESH_TOKEN,
  API_ENDPOINTS.AUTH.LOGOUT,
];

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const skipRefresh = NO_REFRESH_ENDPOINTS.some((endpoint) => requestUrl.includes(endpoint));

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !skipRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        // Reconnect the socket if the server rejected the expired token
        socketService.updateToken();
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        socketService.disconnect();
        processQueue(refreshError, null);
        endSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }

    // No response from the server: give the error a code so hooks can map it
    const code = error.code === 'ECONNABORTED' ? CLIENT_ERROR_CODES.REQUEST_TIMEOUT : CLIENT_ERROR_CODES.NETWORK_ERROR;
    return Promise.reject({
      message: error.message || 'An unexpected network error occurred',
      error: { code, details: [] },
    });
  },
);

export default apiClient;
