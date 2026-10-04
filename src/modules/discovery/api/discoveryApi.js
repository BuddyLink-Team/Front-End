import apiClient from '../../../services/apiClient';

export const getDiscoveryProfiles = (params) => {
  return apiClient.get('/discovery', { params });
};

export const swipeProfile = (targetChildId, isLike) => {
  return apiClient.post('/discovery/swipe', { targetChildId, isLike });
};

export const getChildPublicProfile = (childId) => {
  return apiClient.get(`/children/${childId}/public-profile`);
};
