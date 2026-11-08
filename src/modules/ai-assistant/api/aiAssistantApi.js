import apiClient, { refreshAccessToken, endSession } from '../../../services/apiClient';
import tokenStore from '../../../services/tokenStore';
import { API_ENDPOINTS } from '../../../constants/api.constants';
import { CLIENT_ERROR_CODES } from '../../../constants/error.constants';
import { AI_LIMITS, AI_ERROR_CODES } from '../constants/ai-assistant.constants';

const { AI_ASSISTANT } = API_ENDPOINTS;
const IS_MOCK = import.meta.env.MODE === 'mock' || import.meta.env.VITE_USE_MOCK === 'true';

// Same shape as the errors apiClient rejects with, so getApiErrorMsg maps the code
const clientError = (code) => ({ success: false, message: code, data: null, error: { code, details: [] } });

const parseEvent = (block) => {
  let event = 'message';
  let data = '';
  block.split('\n').forEach((line) => {
    if (line.startsWith('event: ')) event = line.slice(7).trim();
    else if (line.startsWith('data: ')) data += line.slice(6);
  });
  return { event, data };
};

const parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (_error) {
    return null;
  }
};

/**
 * Read the Server-Sent Events of a reply: `progress` (one per tool), then `complete` (the reply) or `error`
 * @returns {Promise<Object|null>} The reply, null when the stream ended without one
 */
const readStream = async (response, onProgress) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return null;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() || '';
    for (const block of blocks) {
      const { event, data } = parseEvent(block);
      const payload = data ? parseJson(data) : null;
      if (event === 'progress' && payload?.message) onProgress?.(payload.message);
      if (event === 'complete' && payload) return payload;
      if (event === 'error') throw payload?.error?.code ? payload : clientError(AI_ERROR_CODES.AI_PROVIDER_ERROR);
    }
  }
};

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
   * Send a typed message, or the options tapped on a choice card. `clientMessageId` is the same on a
   * retry, so a turn the server already stored is returned instead of run again.
   * @param {string} id
   * @param {{ content: string, choice?: { messageId: string, stepId: string, optionIds?: string[], custom?: Object }, clientMessageId?: string }} body
   */
  sendMessage: (id, body) => apiClient.post(AI_ASSISTANT.MESSAGES(id), body, { timeout: AI_LIMITS.REQUEST_TIMEOUT_MS }),

  /**
   * Same as sendMessage, with the progress of each tool while the reply is prepared (Server-Sent Events).
   * Rejects with the same error body as apiClient ({ error: { code } }), so the messages are mapped the same way.
   * The mock engine only intercepts axios: in mock mode the plain request is used.
   * @param {string} id
   * @param {Object} body
   * @param {{ onProgress?: (message: string) => void }} [options]
   */
  sendMessageStream: async (id, body, { onProgress } = {}) => {
    if (IS_MOCK) return aiAssistantApi.sendMessage(id, body);

    const url = `${apiClient.defaults.baseURL}${AI_ASSISTANT.MESSAGES_STREAM(id)}`;
    const post = (token) =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      });

    let response;
    try {
      response = await post(tokenStore.getAccessToken());
      if (response.status === 401) {
        // Same refresh as the axios interceptor (shared, never twice with the same refresh token)
        let token;
        try {
          token = await refreshAccessToken();
        } catch (_refreshError) {
          endSession();
          throw clientError(AI_ERROR_CODES.ACCESS_TOKEN_EXPIRED);
        }
        response = await post(token);
      }
    } catch (error) {
      if (error?.error?.code) throw error;
      throw clientError(CLIENT_ERROR_CODES.NETWORK_ERROR);
    }

    if (!response.ok) {
      throw await response.json().catch(() => clientError(CLIENT_ERROR_CODES.NETWORK_ERROR));
    }

    const result = await readStream(response, onProgress);
    // The connection closed before the reply: a retry sends the same clientMessageId (no repeated turn)
    if (!result) throw clientError(CLIENT_ERROR_CODES.NETWORK_ERROR);
    return { data: result };
  },

  /**
   * Delete a conversation (soft delete)
   * @param {string} id
   */
  deleteSession: (id) => apiClient.delete(AI_ASSISTANT.SESSION(id)),
};

export default aiAssistantApi;
