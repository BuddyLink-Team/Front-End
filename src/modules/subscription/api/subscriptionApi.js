import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

export const subscriptionApi = {
  /**
   * Get all active subscription plans
   */
  getActivePlans: () => apiClient.get(API_ENDPOINTS.SUBSCRIPTION.PLANS),

  /**
   * Get current parent subscription details and usage quota
   */
  getMySubscriptionQuota: () => apiClient.get(API_ENDPOINTS.SUBSCRIPTION.MY_QUOTA),
};

export default subscriptionApi;
