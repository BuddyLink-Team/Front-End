import { ADMIN_SOCKET_EVENTS } from '../constants/dashboard.constants';
import adminAnalyticsMockService from './adminAnalyticsMockService';

const CONNECT_DELAY_MS = 100;
const NOTIFICATION_INTERVAL_MS = 30000;

/**
 * Stand-in for the /admin socket in mock mode (`npm run dev:admin:mock`):
 * same events as the API, with a new notification every NOTIFICATION_INTERVAL_MS.
 * @returns {{ connected: boolean, on: Function, off: Function, disconnect: Function }}
 */
export const createAdminMockSocket = () => {
  const handlers = new Map();
  let sequence = 0;
  let intervalId = null;

  const emit = (event, payload) => {
    (handlers.get(event) || []).forEach((handler) => handler(payload));
  };

  const socket = {
    connected: false,
    on(event, handler) {
      handlers.set(event, [...(handlers.get(event) || []), handler]);
    },
    off(event, handler) {
      handlers.set(event, (handlers.get(event) || []).filter((item) => item !== handler));
    },
    disconnect() {
      clearTimeout(connectTimer);
      clearInterval(intervalId);
      socket.connected = false;
      emit('disconnect');
    },
  };

  const connectTimer = setTimeout(() => {
    socket.connected = true;
    emit('connect');
    intervalId = setInterval(() => {
      const { notification, counts } = adminAnalyticsMockService.pushRealtimeNotification(sequence);
      sequence += 1;
      emit(ADMIN_SOCKET_EVENTS.NOTIFICATION_NEW, notification);
      emit(ADMIN_SOCKET_EVENTS.UNREAD_COUNT, counts);
    }, NOTIFICATION_INTERVAL_MS);
  }, CONNECT_DELAY_MS);

  return socket;
};

export default createAdminMockSocket;
