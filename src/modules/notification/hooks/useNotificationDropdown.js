import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useClickOutside } from '../../../hooks/useClickOutside';
import {
  fetchDropdownNotifications,
  markAllNotificationsAsRead,
} from '../redux/notificationSlice';
import { NOTIFICATION_PREVIEW_LIMIT } from '../constants/notification.constants';
import { useOpenNotification } from './useOpenNotification';

export const useNotificationDropdown = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const openNotification = useOpenNotification();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Only the preview state: the history page keeps its own filtered list
  const { previewItems, unreadCount, isPreviewLoading, isMarkingRead } = useSelector(
    (state) => state.notification
  );

  useClickOutside(dropdownRef, isOpen, () => setIsOpen(false));

  // Load preview notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchDropdownNotifications({ page: 1, limit: NOTIFICATION_PREVIEW_LIMIT }));
    }
  }, [isOpen, dispatch]);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleItemClick = useCallback((notification) => {
    setIsOpen(false);
    openNotification(notification);
  }, [openNotification]);

  const handleMarkAllRead = useCallback((e) => {
    e?.stopPropagation?.();
    if (unreadCount > 0 && !isMarkingRead) {
      dispatch(markAllNotificationsAsRead());
    }
  }, [dispatch, unreadCount, isMarkingRead]);

  const handleViewAll = useCallback(() => {
    setIsOpen(false);
    navigate('/notifications');
  }, [navigate]);

  return {
    isOpen,
    dropdownRef,
    previewItems,
    unreadCount,
    isLoading: isPreviewLoading,
    isMarkingRead,
    toggleDropdown,
    closeDropdown,
    handleItemClick,
    handleMarkAllRead,
    handleViewAll,
  };
};

export default useNotificationDropdown;
