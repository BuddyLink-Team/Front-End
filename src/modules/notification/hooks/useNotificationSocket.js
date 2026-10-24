import React, { useEffect, useRef } from 'react';
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
import { useOpenNotification } from './useOpenNotification';
import NotificationToast from '../components/NotificationToast';

const TOAST_DURATION_MS = 4000;

// Not built on useSocketEvent: that hook opens the socket on mount, while these listeners
// must only attach once the user is signed in
export const useNotificationSocket = () => {
  const dispatch = useDispatch();
  const openNotification = useOpenNotification();
  // openNotification can change on every route change; a ref keeps the socket listeners attached
  const openNotificationRef = useRef(openNotification);
  openNotificationRef.current = openNotification;
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userId = useSelector((state) => state.auth.user?.id || state.auth.user?._id);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    dispatch(fetchUnreadCount());

    const socket = socketService.getSocket();
    if (!socket) return;

    // The first connect is covered by the fetch above; later ones are reconnects that may
    // have missed notifications while the socket was down
    let hasConnected = socket.connected;
    const handleConnect = () => {
      if (hasConnected) {
        dispatch(fetchUnreadCount());
      }
      hasConnected = true;
    };

    const handleNewNotification = (notification) => {
      if (!notification) return;
      dispatch(receiveRealtimeNotification(notification));

      toast(
        (t) =>
          React.createElement(NotificationToast, {
            notification,
            onClick: () => {
              toast.dismiss(t.id);
              openNotificationRef.current(notification);
            },
          }),
        {
          duration: TOAST_DURATION_MS,
          position: 'top-right',
          className: 'rounded-2xl border border-hairline shadow-elevated',
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
  }, [dispatch, isAuthenticated, userId]);
};

export default useNotificationSocket;
