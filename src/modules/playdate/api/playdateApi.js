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
   * Connected friends that can be invited.
   * With childId: their children ranked for that own child ({ matched, others }) instead of the friend list.
   * @param {{ search?: string, limit?: number, childId?: string }} [params]
   */
  getFriends: (params) => apiClient.get(`${API_ENDPOINTS.PLAYDATE.BASE}/friends`, { params }),

  /**
   * Start times fitting the families' preferences, without schedule conflicts
   * @param {{ childId: string, participantChildIds?: string, from?: string, to?: string, durationMinutes?: number }} params
   */
  getTimeSlotSuggestions: (params) =>
    apiClient.get(`${API_ENDPOINTS.PLAYDATE.BASE}/suggestions/time-slots`, { params }),

  /**
   * Places around the families (preferred place types first)
   * @param {{ childId: string, participantChildIds?: string, type?: string, limit?: number }} params
   */
  getPlaceSuggestions: (params) =>
    apiClient.get(`${API_ENDPOINTS.PLAYDATE.BASE}/suggestions/places`, { params }),

  /**
   * When the children are already busy on a day (their other playdates)
   * @param {{ childId: string, participantChildIds?: string, date: string, excludePlaydateId?: string }} params
   */
  getBusyTimes: (params) => apiClient.get(`${API_ENDPOINTS.PLAYDATE.BASE}/busy-times`, { params }),

  /**
   * Activities the children share an interest in
   * @param {{ childId: string, participantChildIds?: string }} params
   */
  getActivitySuggestions: (params) =>
    apiClient.get(`${API_ENDPOINTS.PLAYDATE.BASE}/suggestions/activities`, { params }),

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
   * Participant leaves the playdate
   */
  leavePlaydate: (id) =>
    apiClient.post(`${API_ENDPOINTS.PLAYDATE.BASE}/${id}/leave`),

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

  /**
   * Place details (address resolved, opening hours, contact, OpenStreetMap link)
   */
  getPlaceById: (id) => apiClient.get(`${API_ENDPOINTS.PLACES.BASE}/${id}`),
};

export default playdateApi;
