import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

/**
 * Admin API service functions for oversight of playdates and connections.
 */
export const adminApi = {
  // Playdates
  getPlaydates: (params) => apiClient.get(API_ENDPOINTS.ADMIN.PLAYDATES, { params }),
  getPlaydateDetail: (id) => apiClient.get(API_ENDPOINTS.ADMIN.PLAYDATE_BY_ID(id)),
  cancelPlaydate: (id, reason) =>
    apiClient.patch(API_ENDPOINTS.ADMIN.CANCEL_PLAYDATE(id), { reason }),

  // Connections
  getConnections: (params) => apiClient.get(API_ENDPOINTS.ADMIN.CONNECTIONS, { params }),
  getConnectionDetail: (id) => apiClient.get(API_ENDPOINTS.ADMIN.CONNECTION_BY_ID(id)),
  removeConnection: (id, reason) =>
    apiClient.delete(API_ENDPOINTS.ADMIN.CONNECTION_BY_ID(id), { data: { reason } }),
};

export default adminApi;
