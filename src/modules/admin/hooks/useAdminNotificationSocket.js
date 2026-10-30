import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import adminSocketService from '../services/adminSocket';
import {
  fetchAdminNotifications,
  fetchAdminUnreadNotificationCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
} from '../redux/adminSlice';
import { ADMIN_ERROR_MESSAGES } from '../constants/admin.constants';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { useToast } from '../../../hooks/useToast';

const DEFAULT_UNREAD = {
  total: 0,
  byCategory: {
    users: 0,
    payments: 0,
    playdates: 0,
    connections: 0,
    safety: 0,
    system: 0,
  },
};

/**
 * Hook to manage admin realtime notifications via Socket.io /admin namespace
 * and Redux thunks.
 */
export const useAdminNotificationSocket = ({ autoFetch = true } = {}) => {
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [unreadCount, setUnreadCount] = useState(DEFAULT_UNREAD);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast, error: toastError } = useToast();
  const activeFiltersRef = useRef({ category: 'all', severity: 'all' });

  // Fetch unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await dispatch(fetchAdminUnreadNotificationCount()).unwrap();
      if (data) {
        setUnreadCount(data);
      }
    } catch {
      // Non-blocking
    }
  }, [dispatch]);

  // Fetch paginated notifications list
  const loadNotifications = useCallback(
    async ({ category = 'all', severity = 'all', isRead, page = 1, limit = 20 } = {}) => {
      setIsLoading(true);
      activeFiltersRef.current = { category, severity };
      try {
        const params = { page, limit };
        if (category && category !== 'all') params.category = category;
        if (severity && severity !== 'all') params.severity = severity;
        if (typeof isRead === 'boolean') params.isRead = isRead;

        const data = await dispatch(fetchAdminNotifications(params)).unwrap();
        if (data) {
          setNotifications(data.items || []);
          if (data.pagination) setPagination(data.pagination);
        }
      } catch (err) {
        toastError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không tải được danh sách thông báo.'));
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, toastError]
  );

  // Mark single item as read
  const markAsRead = useCallback(
    async (id) => {
      try {
        await dispatch(markAdminNotificationAsRead(id)).unwrap();
        setNotifications((prev) =>
          prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
        );
        setUnreadCount((prev) => {
          const item = notifications.find((n) => n._id === id);
          const cat = item?.category;
          const newCatCount = cat && prev.byCategory[cat] ? Math.max(0, prev.byCategory[cat] - 1) : 0;
          return {
            total: Math.max(0, prev.total - 1),
            byCategory: {
              ...prev.byCategory,
              ...(cat ? { [cat]: newCatCount } : {}),
            },
          };
        });
      } catch (err) {
        toastError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không thể cập nhật trạng thái thông báo.'));
      }
    },
    [dispatch, notifications, toastError]
  );

  // Mark all as read
  const markAllAsRead = useCallback(
    async (category) => {
      try {
        await dispatch(
          markAllAdminNotificationsAsRead(category && category !== 'all' ? category : undefined)
        ).unwrap();
        setNotifications((prev) =>
          prev.map((item) => {
            if (!category || category === 'all' || item.category === category) {
              return { ...item, isRead: true };
            }
            return item;
          })
        );
        if (!category || category === 'all') {
          setUnreadCount(DEFAULT_UNREAD);
        } else {
          setUnreadCount((prev) => ({
            total: Math.max(0, prev.total - (prev.byCategory[category] || 0)),
            byCategory: {
              ...prev.byCategory,
              [category]: 0,
            },
          }));
        }
      } catch (err) {
        toastError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không thể đánh dấu đã đọc tất cả thông báo.'));
      }
    },
    [dispatch, toastError]
  );

  // Socket initialization
  useEffect(() => {
    const socket = adminSocketService.connect();

    const handleConnect = () => {
      setIsConnected(true);
      loadUnreadCount();
      if (autoFetch) {
        loadNotifications(activeFiltersRef.current);
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleNewNotification = (notification) => {
      if (!notification) return;

      // Filter check
      const currentCat = activeFiltersRef.current.category;
      const currentSev = activeFiltersRef.current.severity;
      const matchesCat = !currentCat || currentCat === 'all' || notification.category === currentCat;
      const matchesSev = !currentSev || currentSev === 'all' || notification.severity === currentSev;

      if (matchesCat && matchesSev) {
        setNotifications((prev) => [notification, ...prev]);
      }

      // Update unread count
      setUnreadCount((prev) => {
        const cat = notification.category;
        const currCatCount = prev.byCategory[cat] || 0;
        return {
          total: prev.total + 1,
          byCategory: {
            ...prev.byCategory,
            ...(cat ? { [cat]: currCatCount + 1 } : {}),
          },
        };
      });

      // Toast alert
      if (notification.severity === 'critical') {
        toast.error(`[CẢNH BÁO KHẨN CẤP] ${notification.title}: ${notification.message}`, {
          duration: 7000,
          id: `notif-${notification._id || Date.now()}`,
        });
      } else if (notification.severity === 'warning') {
        toast(notification.title, {
          icon: '⚠️',
          duration: 4000,
        });
      }
    };

    const handleUnreadCountUpdate = (counts) => {
      if (counts) setUnreadCount(counts);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('admin:notification:new', handleNewNotification);
    socket.on('admin:notification:unread-count', handleUnreadCountUpdate);

    if (socket.connected) {
      setIsConnected(true);
    }

    loadUnreadCount();
    if (autoFetch) {
      loadNotifications();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('admin:notification:new', handleNewNotification);
      socket.off('admin:notification:unread-count', handleUnreadCountUpdate);
    };
  }, [autoFetch, loadNotifications, loadUnreadCount, toast]);

  return {
    notifications,
    pagination,
    unreadCount,
    isLoading,
    isConnected,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
  };
};

export default useAdminNotificationSocket;
