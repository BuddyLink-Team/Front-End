import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

export const playdateApi = {
  /**
   * Get playdates list with optional status filtering, search, pagination
   */
  getPlaydates: (params = {}) => apiClient.get(API_ENDPOINTS.PLAYDATE.BASE, { params }),

  /**
   * Get single playdate details
   */
  getPlaydateById: (id) => apiClient.get(`${API_ENDPOINTS.PLAYDATE.BASE}/${id}`),

  /**
   * Create a new playdate
   */
  createPlaydate: (payload) => apiClient.post(API_ENDPOINTS.PLAYDATE.BASE, payload),

  /**
   * Get connected friends that can be invited to a playdate
   */
  getFriends: () => apiClient.get(`${API_ENDPOINTS.PLAYDATE.BASE}/friends`),

  /**
   * Host marks playdate as completed
   */
  completePlaydate: (id) => apiClient.patch(`${API_ENDPOINTS.PLAYDATE.BASE}/${id}/complete`),

  /**
   * Host cancels playdate
   */
  cancelPlaydate: (id, payload = {}) =>
    apiClient.patch(`${API_ENDPOINTS.PLAYDATE.BASE}/${id}/cancel`, payload),
};

export default playdateApi;
