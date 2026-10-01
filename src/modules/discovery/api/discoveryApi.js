import apiClient from '../../../services/apiClient';

export const getDiscoveryProfiles = (params) => {
  return apiClient.get('/discovery', { params });
};

export const swipeProfile = (targetChildId, isLike) => {
  return apiClient.post('/discovery/swipe', { targetChildId, isLike });
};
