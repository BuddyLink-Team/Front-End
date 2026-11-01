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
  unblockUser: (blockedId) => apiClient.delete(API_ENDPOINTS.SAFETY.UNBLOCK(blockedId)),

  /**
   * Report a user or content
   * @param {Object} data - { reportedUserId, targetType, targetMessageId, targetPlaydateId, category, reason, description, evidenceUrls }
   */
  reportUser: (data) => apiClient.post(API_ENDPOINTS.SAFETY.REPORTS, data),

  /**
   * Get paginated list of blocked parents
   * @param {Object} [params] - { page, limit, search }
   */
  getBlockedUsers: (params = {}) => apiClient.get(API_ENDPOINTS.SAFETY.BLOCKED_USERS, { params }),

  /**
   * Upload an evidence image for a report to BuddyLink Cloud Storage
   * @param {File} file
   */
  uploadEvidence: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post(API_ENDPOINTS.SAFETY.REPORT_EVIDENCE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default safetyApi;
