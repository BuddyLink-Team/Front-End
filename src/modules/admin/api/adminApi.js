import apiClient from '../../../services/apiClient';

/**
 * Admin portal API callers.
 * The baseURL is configured via VITE_API_URL (e.g. http://localhost:5001/api/v1/admin).
 */
export const adminApi = {
  /**
   * Get paginated parent users list
   * @param {Object} [params] - { search, isActive, isVerified, page, limit }
   */
  getUsers: (params) => apiClient.get('/users', { params }),

  /**
   * Get full user detail by ID
   * @param {string} id
   */
  getUserDetail: (id) => apiClient.get(`/users/${id}`),

  /**
   * Update user status (lock / unlock)
   * @param {string} id
   * @param {{ isActive: boolean, reason?: string }} data
   */
  updateUserStatus: (id, { isActive, reason }) =>
    apiClient.patch(`/users/${id}/status`, { isActive, reason }),

  /**
   * Get paginated children list (read-only)
   * @param {Object} [params] - { search, gender, minAge, maxAge, isArchived, page, limit }
   */
  getChildren: (params) => apiClient.get('/children', { params }),

  /**
   * Get child profile detail with parent summary
   * @param {string} id
   */
  getChildDetail: (id) => apiClient.get(`/children/${id}`),

  /**
   * Get payment history for a parent
   * @param {{ parentId: string, page?: number, limit?: number }} params
   */
  getPayments: (params) => apiClient.get('/payments', { params }),
};

export default adminApi;
