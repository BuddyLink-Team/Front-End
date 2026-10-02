import axios from 'axios';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { API_ENDPOINTS } from '../constants/api.constants';
import store from '../app/store';
import { openPaywall } from '../modules/subscription/redux/subscriptionSlice';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isAuthEndpoint =
      requestUrl.includes(API_ENDPOINTS.AUTH.LOGIN) ||
      requestUrl.includes(API_ENDPOINTS.AUTH.ADMIN_LOGIN) ||
      requestUrl.includes(API_ENDPOINTS.AUTH.REGISTER);

    // Auto-intercept quota exceeded errors to open PaywallModal
    const errorCode = error.response?.data?.error?.code;
    const errorDetails = error.response?.data?.error?.details;
    const feature = errorDetails?.feature;
    const errorMessage = error.response?.data?.message;

    if (errorCode === 'CHILD_QUOTA_EXCEEDED' || feature === 'child_profiles') {
      store.dispatch(
        openPaywall({
          feature: 'child_profiles',
          title: 'Đã Đạt Hạn Mức 1 Hồ Sơ Bé',
          message:
            errorMessage ||
            'Gói Miễn phí chỉ hỗ trợ tối đa 1 hồ sơ bé. Nâng cấp Premium để quản lý không giới hạn số bé!',
        })
      );
    } else if (feature === 'discovery_swipes') {
      store.dispatch(
        openPaywall({
          feature: 'discovery_swipes',
          title: 'Đã Hết Lượt Quẹt Hôm Nay (5/5)',
          message:
            errorMessage ||
            'Bạn đã sử dụng hết 5 lượt quẹt tìm bạn hôm nay. Nâng cấp Premium để tìm bạn không giới hạn!',
        })
      );
    } else if (feature === 'playdates_created') {
      store.dispatch(
        openPaywall({
          feature: 'playdates_created',
          title: 'Đã Đạt Giới Hạn Playdate Tháng Này (3/3)',
          message:
            errorMessage ||
            'Bạn đã tạo 3 cuộc hẹn chơi trong tháng này. Nâng cấp Premium để tạo cuộc hẹn không giới hạn!',
        })
      );
    } else if (errorCode === 'QUOTA_EXCEEDED') {
      store.dispatch(
        openPaywall({
          feature: 'general',
          title: 'Đã Chạm Hạn Mức Gói Miễn Phí',
          message:
            errorMessage ||
            'Bạn đã sử dụng hết hạn mức cho tính năng này. Nâng cấp Premium để tiếp tục không giới hạn!',
        })
      );
    }

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
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

      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${baseURL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          {
            refreshToken,
          }
        );
        const newAccessToken = data.accessToken;
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(
      error.response?.data || {
        message: error.message || 'An unexpected network error occurred',
      }
    );
  }
);

export default apiClient;
