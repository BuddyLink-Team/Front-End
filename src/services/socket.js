import { io } from 'socket.io-client';
import { STORAGE_KEYS } from '../constants/storage.constants';

const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      this.socket = io(socketURL, {
        auth: {
          token,
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected with ID:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
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

export const socketService = new SocketService();
export default socketService;
