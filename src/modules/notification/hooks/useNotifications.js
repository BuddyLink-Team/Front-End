import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  setActiveTab,
} from '../redux/notificationSlice';
import {
  TAB_DEFINITIONS,
  getNotificationMeta,
} from '../constants/notification.constants';

export const useNotifications = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    items,
    unreadCount,
    pagination,
    isLoading,
    isMarkingRead,
    activeTab,
  } = useSelector((state) => state.notification);

  const [unreadOnly, setUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Load notifications whenever activeTab, unreadOnly, or currentPage changes
  useEffect(() => {
    const currentTabDef = TAB_DEFINITIONS.find((t) => t.id === activeTab);
    const queryParams = {
      page: currentPage,
      limit: 10,
    };

    if (unreadOnly) {
      queryParams.isRead = false;
    }

    if (currentTabDef?.types && currentTabDef.types.length > 0) {
      queryParams.type = currentTabDef.types.join(',');
    }

    dispatch(fetchNotifications(queryParams));
  }, [dispatch, activeTab, unreadOnly, currentPage]);

  const handleTabChange = useCallback((tabId) => {
    dispatch(setActiveTab(tabId));
    setCurrentPage(1);
  }, [dispatch]);

  const handleUnreadToggle = useCallback(() => {
    setUnreadOnly((prev) => !prev);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleMarkAsRead = useCallback((e, notificationId) => {
    if (e?.stopPropagation) {
      e.stopPropagation();
    }
    dispatch(markNotificationAsRead(notificationId));
  }, [dispatch]);

  const handleMarkAllRead = useCallback(() => {
    if (unreadCount > 0 && !isMarkingRead) {
      dispatch(markAllNotificationsAsRead());
    }
  }, [dispatch, unreadCount, isMarkingRead]);

  const handleActionClick = useCallback((notification) => {
    if (!notification) return;
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification.id));
    }
    const meta = getNotificationMeta(notification.type);
    const targetPath = meta.getActionPath(notification.data);
    if (targetPath) {
      navigate(targetPath);
    }
  }, [dispatch, navigate]);

  return {
    items,
    unreadCount,
    pagination,
    isLoading,
    isMarkingRead,
    activeTab,
    unreadOnly,
    currentPage,
    handleTabChange,
    handleUnreadToggle,
    handlePageChange,
    handleMarkAsRead,
    handleMarkAllRead,
    handleActionClick,
  };
};

export default useNotifications;
