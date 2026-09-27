import { useEffect } from 'react';
import socketService from '../services/socket';

export function useSocketEvent(eventName, handler) {
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [eventName, handler]);
}
