import apiClient from '../../../services/apiClient';

export const gamificationApi = {
  getAchievements: () => apiClient.get('/gamification'),
};
