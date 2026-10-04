import apiClient from '../../../services/apiClient';

export const ratingFeedbackApi = {
  getPending: () => apiClient.get('/playdates/ratings/pending'),
  submit: (playdateId, data) => apiClient.post(`/playdates/${playdateId}/ratings`, data),
};
