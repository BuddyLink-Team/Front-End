import { io } from 'socket.io-client';
import tokenStore from './tokenStore';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ADMIN_SOCKET_NAMESPACE } from '../modules/admin/constants/dashboard.constants';
import { createAdminMockSocket } from '../modules/admin/mock/adminMockSocket';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';

// Socket.io runs on the admin API itself: same origin as the REST calls
const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1/admin';
  return `${new URL(apiUrl).origin}${ADMIN_SOCKET_NAMESPACE}`;
};

class AdminSocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket) return this.socket;
    if (isMock) {
      this.socket = createAdminMockSocket();
      return this.socket;
    }

    this.socket = io(getSocketUrl(), {
      // Read the in-memory access token on every (re)connect
      auth: (cb) => {
        cb({
          token: tokenStore.getAccessToken(),
        });
      },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
    });

    // A rejected handshake is not retried by Socket.io, an expired token would stay offline until a reload.
    // One refresh attempt per connection: reset only once connected, so a rejected token cannot cause a loop.
    let hasRetriedAuth = false;

    this.socket.on('connect_error', async (err) => {
      const isAuthError = (err?.message || '').toLowerCase().includes('authentication error');
      if (!isAuthError || hasRetriedAuth) return;
      hasRetriedAuth = true;
      try {
        // Lazy import: apiClient loads the socket services
        const { default: apiClient } = await import('./apiClient');
        // Any authenticated call lets the interceptor refresh the token on 401
        await apiClient.get(API_ENDPOINTS.AUTH.ME);
        this.socket?.connect();
      } catch {
        // Refresh failure is handled by apiClient's endSession
      }
    });

    this.socket.on('connect', () => {
      hasRetriedAuth = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const adminSocketService = new AdminSocketService();
export default adminSocketService;
