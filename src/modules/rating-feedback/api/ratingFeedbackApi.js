import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

const { PLAYDATE } = API_ENDPOINTS;

export const ratingFeedbackApi = {
  getPending: () => apiClient.get(PLAYDATE.PENDING_RATINGS),
  getByPlaydate: (playdateId) => apiClient.get(PLAYDATE.RATINGS(playdateId)),
  submit: (playdateId, data) => apiClient.post(PLAYDATE.RATINGS(playdateId), data),
};
