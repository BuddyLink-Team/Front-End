import { io } from 'socket.io-client';
import tokenStore from './tokenStore';

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

      let isRefreshingAuth = false;

      this.socket.on('connect_error', async (err) => {
        const message = err?.message || '';
        const isAuthError =
          message.toLowerCase().includes('authentication error') ||
          message.toLowerCase().includes('jwt expired') ||
          message.toLowerCase().includes('token required');

        if (isAuthError && !isRefreshingAuth) {
          isRefreshingAuth = true;
          try {
            const { default: apiClient } = await import('./apiClient');
            await apiClient.get('/auth/me');
            this.updateToken();
          } catch (error) {
            // Token refresh failure is handled by apiClient's endSession
          } finally {
            isRefreshingAuth = false;
          }
        }
      });

      this.socket.on('connect', () => {
        isRefreshingAuth = false;
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
