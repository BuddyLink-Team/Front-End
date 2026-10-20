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
import { getNotificationMeta } from '../constants/notification.constants';

export const useNotificationSocket = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Initial fetch of unread count when authenticated
    dispatch(fetchUnreadCount());

    const socket = socketService.getSocket();
    if (!socket) return;

    const handleNewNotification = (notification) => {
      if (!notification) return;
      dispatch(receiveRealtimeNotification(notification));

      const meta = getNotificationMeta(notification.type);
      const Icon = meta.icon;

      // Toast notification for real-time alert
      toast(
        (t) => (
          <div
            onClick={() => toast.dismiss(t.id)}
            className="flex items-start gap-3 cursor-pointer py-1"
          >
            <div className={`p-2 rounded-xl shrink-0 ${meta.bgClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary line-clamp-1">
                {notification.title}
              </p>
              <p className="text-xs text-text-muted line-clamp-2 mt-0.5">
                {notification.body}
              </p>
            </div>
          </div>
        ),
        {
          duration: 4000,
          position: 'top-right',
          style: {
            borderRadius: '1rem',
            background: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
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

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:unread_count', handleUnreadCount);
    socket.on('notification:read', handleNotificationRead);
    socket.on('notification:read_all', handleNotificationReadAll);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:unread_count', handleUnreadCount);
      socket.off('notification:read', handleNotificationRead);
      socket.off('notification:read_all', handleNotificationReadAll);
    };
  }, [dispatch, isAuthenticated, user]);
};

export default useNotificationSocket;
