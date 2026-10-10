import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

export const authApi = {
  /**
   * Register a new parent user
   */
  register: (payload) => apiClient.post(API_ENDPOINTS.AUTH.REGISTER, payload),

  /**
   * Parent login (email + password)
   */
  login: (payload) => apiClient.post(API_ENDPOINTS.AUTH.LOGIN, payload),

  /**
   * Google OAuth login / signup
   */
  googleLogin: (payload) => apiClient.post(API_ENDPOINTS.AUTH.GOOGLE, payload),

  /**
   * Admin portal login
   */
  adminLogin: (payload) => apiClient.post(API_ENDPOINTS.AUTH.ADMIN_LOGIN, payload),

  /**
   * Logout: revoke the stored refresh token
   */
  logout: (refreshToken) => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken }),

  /**
   * Get current authenticated user profile
   */
  getMe: () => apiClient.get(API_ENDPOINTS.AUTH.ME),

  /**
   * Send Phone OTP
   */
  sendPhoneOtp: (payload) => apiClient.post(API_ENDPOINTS.AUTH.SEND_PHONE_OTP, payload),

  /**
   * Verify Phone OTP
   */
  verifyPhoneOtp: (payload) => apiClient.post(API_ENDPOINTS.AUTH.VERIFY_PHONE_OTP, payload),

  /**
   * Verify Firebase Phone ID token
   */
  verifyFirebasePhone: (payload) => apiClient.post(API_ENDPOINTS.AUTH.VERIFY_FIREBASE_PHONE, payload),

  /**
   * Send Email OTP
   */
  sendEmailOtp: () => apiClient.post(API_ENDPOINTS.AUTH.SEND_EMAIL_OTP),

  /**
   * Verify Email OTP
   */
  verifyEmailOtp: (payload) => apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL_OTP, payload),

  /**
   * Request password reset email
   */
  forgotPassword: (payload) => apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, payload),

  /**
   * Reset password with OTP token
   */
  resetPassword: (payload) => apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload),
};

export default authApi;
