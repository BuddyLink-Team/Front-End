import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

export const safetyApi = {
  /**
   * Block a user
   * @param {Object} data - { blockedId, reason }
   */
  blockUser: (data) => apiClient.post(API_ENDPOINTS.SAFETY.BLOCK, data),

  /**
   * Unblock a user
   * @param {string} blockedId
   */
  unblockUser: (blockedId) => apiClient.delete(`${API_ENDPOINTS.SAFETY.BLOCK}/${blockedId}`),

  /**
   * Report a user or content
   * @param {Object} data - { reportedUserId, targetType, targetMessageId, targetPlaydateId, reason, description }
   */
  reportUser: (data) => apiClient.post(API_ENDPOINTS.SAFETY.REPORT, data),
};

export default safetyApi;
