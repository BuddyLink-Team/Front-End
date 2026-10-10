import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

const { CONNECTION } = API_ENDPOINTS;

/**
 * HTTP calls of the Connection module (used by the connection slice thunks only)
 */
export const connectionApi = {
  /**
   * @param {{ status?: string, direction?: 'incoming'|'outgoing' }} [params]
   */
  getConnections: (params) => apiClient.get(CONNECTION.BASE, { params }),

  /** Send a connection request to another parent */
  sendRequest: (recipientId) => apiClient.post(CONNECTION.BASE, { recipientId }),

  acceptRequest: (id) => apiClient.patch(CONNECTION.ACCEPT(id)),

  declineRequest: (id) => apiClient.patch(CONNECTION.DECLINE(id)),

  /** Remove an accepted connection, or cancel a request the parent sent */
  removeConnection: (id) => apiClient.delete(CONNECTION.BY_ID(id)),
};

export default connectionApi;
