import apiClient from '../../../services/apiClient';

/**
 * All HTTP requests for the Connection module.
 * Called ONLY from useConnections hook — never from components directly.
 */

/** GET /connections?status=pending|accepted */
export const getConnections = (status) =>
  apiClient.get('/connections', { params: { status } });

/** POST /connections/request  { recipientId } */
export const sendConnectionRequest = (recipientId) =>
  apiClient.post('/connections/request', { recipientId });

/** PUT /connections/accept/:id */
export const acceptConnection = (id) =>
  apiClient.put(`/connections/accept/${id}`);

/** PUT /connections/decline/:id */
export const declineConnection = (id) =>
  apiClient.put(`/connections/decline/${id}`);

/** DELETE /connections/remove/:id */
export const removeConnection = (id) =>
  apiClient.delete(`/connections/remove/${id}`);
