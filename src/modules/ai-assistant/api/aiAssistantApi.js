import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';
import { AI_LIMITS } from '../constants/aiAssistantConstants';

const { AI_ASSISTANT } = API_ENDPOINTS;

export const aiAssistantApi = {
  /**
   * Start a conversation (free: the monthly unit is used by its first reply)
   */
  createSession: () => apiClient.post(AI_ASSISTANT.SESSIONS),

  /**
   * Conversations, most recent first
   * @param {{ page?: number, limit?: number }} [params]
   */
  listSessions: (params) => apiClient.get(AI_ASSISTANT.SESSIONS, { params }),

  /**
   * One conversation with its messages and the playdate draft being planned
   * @param {string} id
   */
  getSession: (id) => apiClient.get(AI_ASSISTANT.SESSION(id)),

  /**
   * Send a typed message, or the options tapped on a choice card
   * @param {string} id
   * @param {{ content: string, choice?: { messageId: string, stepId: string, optionIds?: string[], custom?: Object } }} body
   */
  sendMessage: (id, body) =>
    apiClient.post(AI_ASSISTANT.MESSAGES(id), body, { timeout: AI_LIMITS.REQUEST_TIMEOUT_MS }),

  /**
   * Delete a conversation (soft delete)
   * @param {string} id
   */
  deleteSession: (id) => apiClient.delete(AI_ASSISTANT.SESSION(id)),
};

export default aiAssistantApi;
