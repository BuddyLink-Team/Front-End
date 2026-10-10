import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

export const gamificationApi = {
  /**
   * Weekly streak and badges (locked + unlocked) of the current parent
   */
  getAchievements: () => apiClient.get(API_ENDPOINTS.GAMIFICATION.ACHIEVEMENTS),
};
