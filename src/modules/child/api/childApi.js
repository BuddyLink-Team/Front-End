import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

export const childApi = {
  /**
   * Get all children belonging to logged-in parent
   */
  getMyChildren: () => apiClient.get(API_ENDPOINTS.CHILD.BASE),

  /**
   * Create new child profile
   */
  createChild: (payload) => apiClient.post(API_ENDPOINTS.CHILD.BASE, payload),

  /**
   * Get single child by ID
   */
  getChildById: (id) => apiClient.get(`${API_ENDPOINTS.CHILD.BASE}/${id}`),

  /**
   * Update child profile
   */
  updateChild: (id, payload) => apiClient.put(`${API_ENDPOINTS.CHILD.BASE}/${id}`, payload),

  /**
   * Soft delete child profile
   */
  deleteChild: (id) => apiClient.delete(`${API_ENDPOINTS.CHILD.BASE}/${id}`),

  /**
   * Update parent onboarding preferences (criteria, location, age range)
   */
  updateOnboardingPreferences: (payload) =>
    apiClient.put(API_ENDPOINTS.PARENT.ONBOARDING_PREFERENCES, payload),
};

export default childApi;
