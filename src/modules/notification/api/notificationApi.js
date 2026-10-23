import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

const { NOTIFICATION } = API_ENDPOINTS;

export const notificationApi = {
  /**
   * Get paginated notifications
   * @param {{ page?: number, limit?: number, type?: string, types?: string|string[], isRead?: boolean|string }} [params]
   */
  getNotifications: (params) => apiClient.get(NOTIFICATION.BASE, { params }),

  /**
   * Get total unread count
   */
  getUnreadCount: () => apiClient.get(NOTIFICATION.UNREAD_COUNT),

  /**
   * Mark a single notification as read
   * @param {string} id
   */
  markAsRead: (id) => apiClient.patch(NOTIFICATION.READ(id)),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () => apiClient.patch(NOTIFICATION.READ_ALL),
};

export default notificationApi;
