import { io } from 'socket.io-client';
import tokenStore from '../../../services/tokenStore';

const socketBaseURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const adminSocketURL = `${socketBaseURL}/admin`;

class AdminSocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(adminSocketURL, {
        auth: (cb) => {
          cb({
            token: tokenStore.getAccessToken(),
          });
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        // Successfully connected to /admin namespace
      });

      this.socket.on('connect_error', (_err) => {
        // Reconnection is automatically attempted
      });
    }
    return this.socket;
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

export const adminSocketService = new AdminSocketService();
export default adminSocketService;
