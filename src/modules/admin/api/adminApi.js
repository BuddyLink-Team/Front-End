import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

const { USERS, CHILDREN, PAYMENTS } = API_ENDPOINTS.ADMIN;

/**
 * Admin portal API callers (users, children, payments, playdate & connection oversight, plans & revenue).
 * The baseURL is configured via VITE_API_URL (e.g. http://localhost:5001/api/v1/admin).
 */
export const adminApi = {
  /**
   * Get paginated parent users list
   * @param {Object} [params] - { search, isActive, isVerified, page, limit }
   */
  getUsers: (params) => apiClient.get(USERS, { params }),

  /**
   * Parent accounts across the platform: { total, active, locked, premium }
   */
  getUserStats: () => apiClient.get(`${USERS}/stats`),

  /**
   * Get full user detail by ID
   * @param {string} id
   */
  getUserDetail: (id) => apiClient.get(`${USERS}/${id}`),

  /**
   * Update user status (lock / unlock)
   * @param {string} id
   * @param {{ isActive: boolean }} data
   */
  updateUserStatus: (id, { isActive }) => apiClient.patch(`${USERS}/${id}/status`, { isActive }),

  /**
   * Get paginated children list (read-only)
   * @param {Object} [params] - { search, gender, minAge, maxAge, isArchived, page, limit }
   */
  getChildren: (params) => apiClient.get(CHILDREN, { params }),

  /**
   * Child profiles across the platform: { total, active, archived, planLocked }
   */
  getChildStats: () => apiClient.get(`${CHILDREN}/stats`),

  /**
   * Get child profile detail with parent summary
   * @param {string} id
   */
  getChildDetail: (id) => apiClient.get(`${CHILDREN}/${id}`),

  /**
   * Get payment history for a parent
   * @param {{ parentId: string, page?: number, limit?: number }} params
   */
  getPayments: (params) => apiClient.get(PAYMENTS, { params }),

  // Playdates
  getPlaydates: (params) => apiClient.get(API_ENDPOINTS.ADMIN.PLAYDATES, { params }),
  /** Playdates across the platform: { total, upcoming, completed, cancelled } */
  getPlaydateStats: () => apiClient.get(`${API_ENDPOINTS.ADMIN.PLAYDATES}/stats`),
  getPlaydateDetail: (id) => apiClient.get(API_ENDPOINTS.ADMIN.PLAYDATE_BY_ID(id)),
  cancelPlaydate: (id, reason) =>
    apiClient.patch(API_ENDPOINTS.ADMIN.CANCEL_PLAYDATE(id), { reason }),

  // Connections
  getConnections: (params) => apiClient.get(API_ENDPOINTS.ADMIN.CONNECTIONS, { params }),
  /** Connections across the platform: { total, pending, accepted, declined, removed } */
  getConnectionStats: () => apiClient.get(`${API_ENDPOINTS.ADMIN.CONNECTIONS}/stats`),
  getConnectionDetail: (id) => apiClient.get(API_ENDPOINTS.ADMIN.CONNECTION_BY_ID(id)),
  removeConnection: (id, reason) =>
    apiClient.delete(API_ENDPOINTS.ADMIN.CONNECTION_BY_ID(id), { data: { reason } }),

  // Subscription plans & revenue
  /** All plans, inactive ones included */
  getPlans: () => apiClient.get(API_ENDPOINTS.ADMIN.PLANS),
  /** One plan as stored now */
  getPlanDetail: (id) => apiClient.get(API_ENDPOINTS.ADMIN.PLAN_BY_ID(id)),
  /** @param {{ name?: string, price?: number, isActive?: boolean, features?: Object }} payload */
  updatePlan: (id, payload) => apiClient.patch(API_ENDPOINTS.ADMIN.PLAN_BY_ID(id), payload),
  /** @param {Object} [params] - { search, planCode, status, page, limit } */
  getSubscriptions: (params) => apiClient.get(API_ENDPOINTS.ADMIN.SUBSCRIPTIONS, { params }),
  getSubscriptionDetail: (id) => apiClient.get(API_ENDPOINTS.ADMIN.SUBSCRIPTION_BY_ID(id)),
  /** Payments of every parent. @param {Object} [params] - { search, status, planCode, fromDate, toDate, page, limit } */
  getTransactions: (params) => apiClient.get(API_ENDPOINTS.ADMIN.TRANSACTIONS, { params }),
  /** Payment audit detail (checkoutUrl and qrCode left out) */
  getTransactionDetail: (id) => apiClient.get(API_ENDPOINTS.ADMIN.TRANSACTION_BY_ID(id)),
  /** @param {{ fromDate?: string, toDate?: string }} [params] */
  getRevenueSummary: (params) => apiClient.get(API_ENDPOINTS.ADMIN.REVENUE_SUMMARY, { params }),
};

export default adminApi;
