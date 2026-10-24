import { io } from 'socket.io-client';
import tokenStore from './tokenStore';
import { API_ENDPOINTS } from '../constants/api.constants';

const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(socketURL, {
        // Read the in-memory access token on every (re)connect
        auth: (cb) => {
          cb({
            token: tokenStore.getAccessToken(),
          });
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // One refresh attempt per connection: reset only once the socket connects again,
      // so a server that keeps rejecting the token cannot cause a refresh loop
      let hasRetriedAuth = false;

      this.socket.on('connect_error', async (err) => {
        const message = (err?.message || '').toLowerCase();
        const isAuthError =
          message.includes('authentication error') ||
          message.includes('jwt expired') ||
          message.includes('token required');

        if (!isAuthError || hasRetriedAuth) return;
        hasRetriedAuth = true;
        try {
          // Lazy import: apiClient imports this file
          const { default: apiClient } = await import('./apiClient');
          // Any authenticated call lets the interceptor refresh the token on 401
          await apiClient.get(API_ENDPOINTS.AUTH.ME);
          this.updateToken();
        } catch {
          // Refresh failure is handled by apiClient's endSession
        }
      });

      this.socket.on('connect', () => {
        hasRetriedAuth = false;
      });
    }
    return this.socket;
  }

  /**
   * Call after the access token is refreshed. The auth callback already reads the
   * latest token from localStorage on every (re)connect, so it must not be replaced;
   * only reconnect if the server rejected the previous (expired) token.
   */
  updateToken() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket || this.connect();
  }
}

export const socketService = new SocketService();
export default socketService;
