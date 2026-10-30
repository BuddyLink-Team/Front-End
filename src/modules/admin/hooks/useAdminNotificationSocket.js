import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import adminSocketService from '../../../services/adminSocket';
import { useToast } from '../../../hooks/useToast';
import {
  ADMIN_NOTIFICATION_CRITICAL,
  ADMIN_NOTIFICATION_TOAST_DURATION_MS,
  ADMIN_SOCKET_EVENTS,
} from '../constants/dashboard.constants';
import {
  adminNotificationReceived,
  adminNotificationSocketStatusChanged,
  adminUnreadCountReceived,
  fetchAdminUnreadNotificationCount,
  refreshAdminNotifications,
  resetAdminNotifications,
} from '../redux/adminSlice';

/**
 * Keeps the /admin socket open while the admin portal is on screen and feeds the store:
 * the bell and the notification board read the same state. Mounted once, in AdminLayout.
 */
export const useAdminNotificationSocket = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    const socket = adminSocketService.connect();
    let hasConnectedBefore = socket.connected;

    const handleConnect = () => {
      dispatch(adminNotificationSocketStatusChanged(true));
      // Events sent while offline are lost: read the list again after a reconnection
      if (hasConnectedBefore) dispatch(refreshAdminNotifications());
      hasConnectedBefore = true;
    };

    const handleDisconnect = () => {
      dispatch(adminNotificationSocketStatusChanged(false));
    };

    const handleNewNotification = (notification) => {
      dispatch(adminNotificationReceived(notification));
      if (notification.severity === ADMIN_NOTIFICATION_CRITICAL) {
        toast.error(`${notification.title}: ${notification.message}`, {
          duration: ADMIN_NOTIFICATION_TOAST_DURATION_MS,
          id: `admin-notification-${notification.id}`,
        });
      }
    };

    const handleUnreadCount = (counts) => {
      dispatch(adminUnreadCountReceived(counts));
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(ADMIN_SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);
    socket.on(ADMIN_SOCKET_EVENTS.UNREAD_COUNT, handleUnreadCount);

    dispatch(adminNotificationSocketStatusChanged(socket.connected));
    dispatch(fetchAdminUnreadNotificationCount());

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(ADMIN_SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);
      socket.off(ADMIN_SOCKET_EVENTS.UNREAD_COUNT, handleUnreadCount);
      // Leaving the portal (logout): stop receiving events and forget them
      adminSocketService.disconnect();
      dispatch(resetAdminNotifications());
    };
  }, [dispatch, toast]);
};

export default useAdminNotificationSocket;
