import apiClient from '../../../services/apiClient';

const buildAdminPath = (path) => {
  const base = apiClient.defaults.baseURL || '';
  if (base.endsWith('/admin')) {
    return path;
  }
  return `/admin${path}`;
};

export const adminSubscriptionApi = {
  /**
   * GET /api/v1/admin/plans - List all plans including inactive
   */
  getPlans: () => apiClient.get(buildAdminPath('/plans')),

  /**
   * PATCH /api/v1/admin/plans/:id - Update plan name, price, features, isActive
   */
  updatePlan: (id, payload) => apiClient.patch(buildAdminPath(`/plans/${id}`), payload),

  /**
   * GET /api/v1/admin/subscriptions - Paginated subscriptions list
   */
  getSubscriptions: (params) => apiClient.get(buildAdminPath('/subscriptions'), { params }),

  /**
   * GET /api/v1/admin/payments - Paginated payments list
   */
  getPayments: (params) => apiClient.get(buildAdminPath('/payments'), { params }),

  /**
   * GET /api/v1/admin/payments/:id - Single payment audit detail
   */
  getPaymentDetail: (id) => apiClient.get(buildAdminPath(`/payments/${id}`)),

  /**
   * GET /api/v1/admin/revenue/summary - Revenue metrics and statistics
   */
  getRevenueSummary: (params) => apiClient.get(buildAdminPath('/revenue/summary'), { params }),
};

export default adminSubscriptionApi;
