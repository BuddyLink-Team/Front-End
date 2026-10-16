import apiClient from '../../../services/apiClient';

export const ratingFeedbackApi = {
  getPending: () => apiClient.get('/playdates/ratings/pending'),
  getByPlaydate: (playdateId) => apiClient.get(`/playdates/${playdateId}/ratings`),
  submit: (playdateId, data) => apiClient.post(`/playdates/${playdateId}/ratings`, data),
};
