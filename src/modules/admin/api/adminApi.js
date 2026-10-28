import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

const { USERS, CHILDREN, PAYMENTS } = API_ENDPOINTS.ADMIN;

/**
 * Admin portal API callers.
 * The baseURL is configured via VITE_API_URL (e.g. http://localhost:5001/api/v1/admin).
 */
export const adminApi = {
  /**
   * Get paginated parent users list
   * @param {Object} [params] - { search, isActive, isVerified, page, limit }
   */
  getUsers: (params) => apiClient.get(USERS, { params }),

  /**
   * Parent accounts across the platform: { total, active, locked, premium }
   */
  getUserStats: () => apiClient.get(`${USERS}/stats`),

  /**
   * Get full user detail by ID
   * @param {string} id
   */
  getUserDetail: (id) => apiClient.get(`${USERS}/${id}`),

  /**
   * Update user status (lock / unlock)
   * @param {string} id
   * @param {{ isActive: boolean }} data
   */
  updateUserStatus: (id, { isActive }) => apiClient.patch(`${USERS}/${id}/status`, { isActive }),

  /**
   * Get paginated children list (read-only)
   * @param {Object} [params] - { search, gender, minAge, maxAge, isArchived, page, limit }
   */
  getChildren: (params) => apiClient.get(CHILDREN, { params }),

  /**
   * Child profiles across the platform: { total, active, archived, planLocked }
   */
  getChildStats: () => apiClient.get(`${CHILDREN}/stats`),

  /**
   * Get child profile detail with parent summary
   * @param {string} id
   */
  getChildDetail: (id) => apiClient.get(`${CHILDREN}/${id}`),

  /**
   * Get payment history for a parent
   * @param {{ parentId: string, page?: number, limit?: number }} params
   */
  getPayments: (params) => apiClient.get(PAYMENTS, { params }),
};

export default adminApi;
