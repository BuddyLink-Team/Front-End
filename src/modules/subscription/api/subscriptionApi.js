import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

export const subscriptionApi = {
  /**
   * Get all active subscription plans (Public)
   */
  getActivePlans: () => apiClient.get(API_ENDPOINTS.SUBSCRIPTION.PLANS),

  /**
   * Get current parent subscription details and quota usage (Auth)
   */
  getMySubscriptionQuota: () => apiClient.get(API_ENDPOINTS.SUBSCRIPTION.MY_QUOTA),

  /**
   * Create PayOS checkout session (Auth)
   * @param {Object} data { planCode: string }
   * @param {string} [idempotencyKey]
   */
  createCheckout: (data, idempotencyKey) => {
    const headers = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    return apiClient.post(API_ENDPOINTS.SUBSCRIPTION.CHECKOUT, data, { headers });
  },

  /**
   * Verify payment status by orderCode (Auth)
   * @param {number|string} orderCode
   */
  verifyPayment: (orderCode) => apiClient.get(API_ENDPOINTS.SUBSCRIPTION.VERIFY_PAYMENT(orderCode)),

  /**
   * Get transaction history with pagination (Auth)
   * @param {Object} [params] { page, limit }
   */
  getPaymentHistory: (params = { page: 1, limit: 10 }) =>
    apiClient.get(API_ENDPOINTS.SUBSCRIPTION.HISTORY, { params }),
};

export default subscriptionApi;
