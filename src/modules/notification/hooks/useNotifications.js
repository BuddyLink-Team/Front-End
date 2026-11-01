import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  setActiveTab,
} from '../redux/notificationSlice';
import { useOpenNotification } from './useOpenNotification';
import {
  TAB_DEFINITIONS,
  NOTIFICATION_PAGE_LIMIT,
  NOTIFICATION_ERROR_MESSAGES,
} from '../constants/notification.constants';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const openNotification = useOpenNotification();

  const {
    items,
    unreadCount,
    pagination,
    isLoading,
    isMarkingRead,
    activeTab,
    error,
  } = useSelector((state) => state.notification);

  const [unreadOnly, setUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Load notifications whenever activeTab, unreadOnly, or currentPage changes
  useEffect(() => {
    const currentTabDef = TAB_DEFINITIONS.find((t) => t.id === activeTab);
    const queryParams = {
      page: currentPage,
      limit: NOTIFICATION_PAGE_LIMIT,
    };

    if (unreadOnly) {
      queryParams.isRead = false;
    }

    if (currentTabDef?.types && currentTabDef.types.length > 0) {
      queryParams.type = currentTabDef.types.join(',');
    }

    dispatch(fetchNotifications(queryParams))
      .unwrap()
      .catch((err) =>
        toast.error(getApiErrorMsg(NOTIFICATION_ERROR_MESSAGES, err, 'Không thể tải danh sách thông báo.')),
      );
  }, [dispatch, toast, activeTab, unreadOnly, currentPage]);

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
    e?.stopPropagation?.();
    dispatch(markNotificationAsRead(notificationId))
      .unwrap()
      .catch((err) => toast.error(getApiErrorMsg(NOTIFICATION_ERROR_MESSAGES, err, 'Không thể đánh dấu đã đọc.')));
  }, [dispatch, toast]);

  const handleMarkAllRead = useCallback(() => {
    if (unreadCount > 0 && !isMarkingRead) {
      dispatch(markAllNotificationsAsRead())
        .unwrap()
        .catch((err) =>
          toast.error(getApiErrorMsg(NOTIFICATION_ERROR_MESSAGES, err, 'Không thể đánh dấu tất cả là đã đọc.')),
        );
    }
  }, [dispatch, toast, unreadCount, isMarkingRead]);

  const handleActionClick = openNotification;

  return {
    items,
    unreadCount,
    pagination,
    isLoading,
    isMarkingRead,
    error: error ? getApiErrorMsg(NOTIFICATION_ERROR_MESSAGES, error, 'Không thể tải danh sách thông báo.') : null,
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
