import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import socketService from '../../../services/socket';
import {
  receiveRealtimeNotification,
  updateRealtimeUnreadCount,
  realtimeNotificationRead,
  realtimeAllRead,
  fetchUnreadCount,
} from '../redux/notificationSlice';
import { NOTIFICATION_SOCKET_EVENTS } from '../constants/notification.constants';
import NotificationToast from '../components/NotificationToast';

export const useNotificationSocket = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Initial fetch of unread count when authenticated
    dispatch(fetchUnreadCount());

    const socket = socketService.getSocket();
    if (!socket) return;

    const handleConnect = () => {
      // Re-fetch unread count upon successful socket (re)connection
      dispatch(fetchUnreadCount());
    };

    const handleNewNotification = (notification) => {
      if (!notification) return;
      dispatch(receiveRealtimeNotification(notification));

      toast(
        (t) =>
          React.createElement(NotificationToast, {
            notification,
            onDismiss: () => toast.dismiss(t.id),
          }),
        {
          duration: 4000,
          position: 'top-right',
          style: {
            borderRadius: '1rem',
            background: '#ffffff',
            boxShadow: '0 8px 24px -4px rgba(45, 55, 72, 0.04), 0 2px 6px -2px rgba(45, 55, 72, 0.02)',
            border: '1px solid #edf2f0',
            padding: '10px 14px',
          },
        }
      );
    };

    const handleUnreadCount = (data) => {
      dispatch(updateRealtimeUnreadCount(data));
    };

    const handleNotificationRead = (data) => {
      dispatch(realtimeNotificationRead(data));
    };

    const handleNotificationReadAll = () => {
      dispatch(realtimeAllRead());
    };

    socket.on('connect', handleConnect);
    socket.on(NOTIFICATION_SOCKET_EVENTS.NEW_NOTIFICATION, handleNewNotification);
    socket.on(NOTIFICATION_SOCKET_EVENTS.UNREAD_COUNT, handleUnreadCount);
    socket.on(NOTIFICATION_SOCKET_EVENTS.READ, handleNotificationRead);
    socket.on(NOTIFICATION_SOCKET_EVENTS.READ_ALL, handleNotificationReadAll);

    return () => {
      socket.off('connect', handleConnect);
      socket.off(NOTIFICATION_SOCKET_EVENTS.NEW_NOTIFICATION, handleNewNotification);
      socket.off(NOTIFICATION_SOCKET_EVENTS.UNREAD_COUNT, handleUnreadCount);
      socket.off(NOTIFICATION_SOCKET_EVENTS.READ, handleNotificationRead);
      socket.off(NOTIFICATION_SOCKET_EVENTS.READ_ALL, handleNotificationReadAll);
    };
  }, [dispatch, isAuthenticated, user]);
};

export default useNotificationSocket;
