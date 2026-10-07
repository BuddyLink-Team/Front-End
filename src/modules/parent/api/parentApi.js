import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

export const parentApi = {
  /**
   * Get current authenticated parent profile (via polymorphic /user/me)
   */
  getMyProfile: () => apiClient.get(API_ENDPOINTS.USER.ME),

  /**
   * Update parent profile details
   */
  updateProfile: (payload) => apiClient.put(API_ENDPOINTS.USER.UPDATE_ME, payload),

  /**
   * Upload parent avatar to Cloudinary
   */
  uploadAvatar: (formData) =>
    apiClient.patch(API_ENDPOINTS.USER.AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  /**
   * Change account password
   */
  changePassword: (payload) => apiClient.put(API_ENDPOINTS.USER.PASSWORD, payload),
};

export default parentApi;
