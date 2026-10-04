import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

export const playdateApi = {
  /**
   * Get playdates list with optional status filtering, search, pagination
   */
  getPlaydates: (params = {}) => apiClient.get(API_ENDPOINTS.PLAYDATE.BASE, { params }),

  /**
   * Get single playdate details
   */
  getPlaydateById: (id) => apiClient.get(`${API_ENDPOINTS.PLAYDATE.BASE}/${id}`),

  /**
   * Create a new playdate
   */
  createPlaydate: (payload) => apiClient.post(API_ENDPOINTS.PLAYDATE.BASE, payload),

  /**
   * Get connected friends that can be invited to a playdate
   */
  getFriends: () => apiClient.get(`${API_ENDPOINTS.PLAYDATE.BASE}/friends`),

  /**
   * Host marks playdate as completed
   */
  completePlaydate: (id) => apiClient.patch(`${API_ENDPOINTS.PLAYDATE.BASE}/${id}/complete`),

  /**
   * Host cancels playdate
   */
  cancelPlaydate: (id, payload = {}) =>
    apiClient.patch(`${API_ENDPOINTS.PLAYDATE.BASE}/${id}/cancel`, payload),

  /**
   * Participant responds to playdate invitation (RSVP: accept / decline)
   */
  respondToPlaydate: (id, status) =>
    apiClient.put(`${API_ENDPOINTS.PLAYDATE.BASE}/${id}/respond`, { status }),

  /**
   * Propose a reschedule request for playdate
   */
  createReschedule: (id, payload) =>
    apiClient.post(`${API_ENDPOINTS.PLAYDATE.BASE}/${id}/reschedule`, payload),

  /**
   * Vote on a pending reschedule request (accept / decline)
   */
  voteReschedule: (id, payload) =>
    apiClient.put(`${API_ENDPOINTS.PLAYDATE.BASE}/${id}/reschedule/vote`, payload),

  /**
   * Get latest / active reschedule request for a playdate
   */
  getReschedule: (id) =>
    apiClient.get(`${API_ENDPOINTS.PLAYDATE.BASE}/${id}/reschedule`),

  /**
   * Search nearby child-friendly venues adapter (parks, cafes, playgrounds)
   */
  getNearbyPlaces: (params = {}) =>
    apiClient.get(API_ENDPOINTS.PLACES.NEARBY, { params }),
};

export default playdateApi;
