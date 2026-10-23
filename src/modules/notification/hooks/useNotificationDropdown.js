import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useClickOutside } from '../../../hooks/useClickOutside';
import {
  fetchDropdownNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../redux/notificationSlice';
import { getNotificationMeta } from '../constants/notification.constants';

export const useNotificationDropdown = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const {
    previewItems,
    items,
    unreadCount,
    isPreviewLoading,
    isLoading,
    isMarkingRead,
  } = useSelector((state) => state.notification);

  useClickOutside(dropdownRef, isOpen, () => setIsOpen(false));

  // Load preview notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchDropdownNotifications({ page: 1, limit: 6 }));
    }
  }, [isOpen, dispatch]);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleItemClick = useCallback((notification) => {
    if (!notification) return;
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification.id));
    }
    setIsOpen(false);
    const meta = getNotificationMeta(notification.type);
    const targetPath = meta.getActionPath(notification.data);
    if (targetPath) {
      navigate(targetPath);
    }
  }, [dispatch, navigate]);

  const handleMarkAllRead = useCallback((e) => {
    if (e?.stopPropagation) {
      e.stopPropagation();
    }
    if (unreadCount > 0 && !isMarkingRead) {
      dispatch(markAllNotificationsAsRead());
    }
  }, [dispatch, unreadCount, isMarkingRead]);

  const handleViewAll = useCallback(() => {
    setIsOpen(false);
    navigate('/notifications');
  }, [navigate]);

  // Backward-compatible fallback for tests or components with preloaded items
  const displayItems = previewItems && previewItems.length > 0
    ? previewItems.slice(0, 6)
    : (items || []).slice(0, 6);

  const loading = isPreviewLoading || (isLoading && displayItems.length === 0);

  return {
    isOpen,
    dropdownRef,
    previewItems: displayItems,
    unreadCount,
    isLoading: loading,
    isMarkingRead,
    toggleDropdown,
    closeDropdown,
    handleItemClick,
    handleMarkAllRead,
    handleViewAll,
  };
};

export default useNotificationDropdown;
