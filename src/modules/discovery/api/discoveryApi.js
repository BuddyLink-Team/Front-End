import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

export const discoveryApi = {
  /**
   * Get discovery profiles with Smart Matching scores
   * @param {Object} params - { lat, lng, maxDistanceKm, ageMin, ageMax, interests }
   */
  getProfiles: (params) => apiClient.get(API_ENDPOINTS.DISCOVERY.BASE, { params }),

  /**
   * Record a Like / Pass on a child profile
   * @param {Object} data - { targetChildId, isLike }
   */
  swipe: (data) => apiClient.post(API_ENDPOINTS.DISCOVERY.SWIPE, data),

  /**
   * Get the public profile of a child
   * @param {string} childId
   */
  getChildPublicProfile: (childId) => apiClient.get(`${API_ENDPOINTS.CHILD.BASE}/${childId}/public-profile`),
};

export default discoveryApi;
