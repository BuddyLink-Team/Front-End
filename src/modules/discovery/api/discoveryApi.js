import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

/**
 * Map Redux filter state to the query params expected by GET /discovery.
 * Personality filtering is not supported server-side and is applied in the discovery slice.
 */
const toQueryParams = (filters = {}) => {
  const params = {};
  if (filters.maxDistance) params.maxDistanceKm = filters.maxDistance;
  if (filters.minAge !== undefined) params.ageMin = filters.minAge;
  if (filters.maxAge !== undefined) params.ageMax = filters.maxAge;
  return params;
};

export const discoveryApi = {
  /**
   * Get discovery profiles with Smart Matching scores
   * @param {Object} filters - Redux filter state { maxDistance, minAge, maxAge, personalities }
   */
  getProfiles: (filters) =>
    apiClient.get(API_ENDPOINTS.DISCOVERY.BASE, { params: toQueryParams(filters) }),

  /**
   * Record a Like / Pass on a child profile
   * @param {Object} data - { targetChildId, isLike }
   */
  swipe: (data) => apiClient.post(API_ENDPOINTS.DISCOVERY.SWIPE, data),

  /**
   * Get the public profile of a child
   * @param {string} childId
   */
  getChildPublicProfile: (childId) =>
    apiClient.get(`${API_ENDPOINTS.CHILD.BASE}/${childId}/public-profile`),
};

export default discoveryApi;
