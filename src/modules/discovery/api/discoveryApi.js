import apiClient from '../../../services/apiClient';

/**
 * Map Redux filter state to the query params expected by GET /discovery.
 * Personality filtering is not supported server-side and is applied in useDiscovery.
 */
const toQueryParams = (filters = {}) => {
  const params = {};
  if (filters.maxDistance) params.maxDistanceKm = filters.maxDistance;
  if (filters.minAge !== undefined) params.ageMin = filters.minAge;
  if (filters.maxAge !== undefined) params.ageMax = filters.maxAge;
  return params;
};

export const getDiscoveryProfiles = (filters) => {
  return apiClient.get('/discovery', { params: toQueryParams(filters) });
};

export const swipeProfile = (targetChildId, isLike) => {
  return apiClient.post('/discovery/swipe', { targetChildId, isLike });
};

export const getChildPublicProfile = (childId) => {
  return apiClient.get(`/children/${childId}/public-profile`);
};
