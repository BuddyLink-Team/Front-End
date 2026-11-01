import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { ADMIN_ERROR_MESSAGES } from '../constants/admin.constants';
import { ADMIN_NOTIFICATION_FILTER_ALL, ADMIN_NOTIFICATION_PAGE_LIMIT } from '../constants/dashboard.constants';
import {
  fetchAdminNotifications,
  fetchAdminUnreadNotificationCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  refreshAdminNotifications,
} from '../redux/adminSlice';

/**
 * Notification board: the list in the store, its filters and the read actions.
 * After an action the unread counts are read again, so the bell and the tabs show the server's figures.
 */
export const useAdminNotifications = () => {
  const dispatch = useDispatch();
  const { error: toastError } = useToast();
  const notifications = useSelector((state) => state.admin.notifications);
  const { pagination, filters, isLoading, isLoadingMore } = notifications;

  const fetchPage = useCallback(
    async (page, { category, severity }) => {
      try {
        await dispatch(
          fetchAdminNotifications({ category, severity, page, limit: ADMIN_NOTIFICATION_PAGE_LIMIT })
        ).unwrap();
      } catch (err) {
        toastError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không tải được danh sách thông báo.'));
      }
    },
    [dispatch, toastError]
  );

  const applyFilters = useCallback((nextFilters) => fetchPage(1, nextFilters), [fetchPage]);

  const hasMore = Boolean(pagination && pagination.page < pagination.totalPages);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || isLoadingMore) return;
    fetchPage(pagination.page + 1, filters);
  }, [fetchPage, filters, hasMore, isLoading, isLoadingMore, pagination]);

  const refresh = useCallback(() => dispatch(refreshAdminNotifications()), [dispatch]);

  const markAsRead = useCallback(
    async (id) => {
      try {
        await dispatch(markAdminNotificationAsRead(id)).unwrap();
        dispatch(fetchAdminUnreadNotificationCount());
      } catch (err) {
        toastError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không thể cập nhật trạng thái thông báo.'));
      }
    },
    [dispatch, toastError]
  );

  const markAllAsRead = useCallback(
    async (category) => {
      try {
        await dispatch(
          markAllAdminNotificationsAsRead(category === ADMIN_NOTIFICATION_FILTER_ALL ? undefined : category)
        ).unwrap();
        dispatch(fetchAdminUnreadNotificationCount());
      } catch (err) {
        toastError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không thể đánh dấu đã đọc tất cả thông báo.'));
      }
    },
    [dispatch, toastError]
  );

  return { ...notifications, hasMore, applyFilters, loadMore, refresh, markAsRead, markAllAsRead };
};

export default useAdminNotifications;
