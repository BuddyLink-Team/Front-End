import apiClient, { refreshAccessToken, endSession } from '../../../services/apiClient';
import tokenStore from '../../../services/tokenStore';
import { API_ENDPOINTS } from '../../../constants/api.constants';
import { AI_LIMITS } from '../constants/ai-assistant.constants';

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
   * @param {{ onProgress?: (msg: string) => void }} [options]
   */
  sendMessage: (id, body, options) => {
    if (options?.onProgress) {
      return aiAssistantApi.sendMessageStream(id, body, options);
    }
    return apiClient.post(AI_ASSISTANT.MESSAGES(id), body, { timeout: AI_LIMITS.REQUEST_TIMEOUT_MS });
  },

  /**
   * Send a typed message with SSE progress streaming
   * @param {string} id
   * @param {Object} body
   * @param {{ onProgress?: (msg: string) => void }} [options]
   */
  sendMessageStream: async (id, body, { onProgress } = {}) => {
    if (import.meta.env.MODE === 'mock' || import.meta.env.VITE_USE_MOCK === 'true') {
      return aiAssistantApi.sendMessage(id, body);
    }

    let token = tokenStore.getAccessToken();
    const baseURL = apiClient.defaults.baseURL || import.meta.env.VITE_API_URL || '';
    const url = `${baseURL}${AI_ASSISTANT.MESSAGES(id)}/stream`;

    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      try {
        token = await refreshAccessToken();
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        });
      } catch (_refreshErr) {
        endSession();
        throw new Error('Phiên đăng nhập đã hết hạn.');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const err = new Error(errorData.message || 'Stream request failed');
      err.response = { status: response.status, data: errorData };
      throw err;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let result = null;
    let isDone = false;

    while (!isDone) {
      const { value, done } = await reader.read();
      if (done) {
        isDone = true;
        break;
      }
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const lines = part.split('\n');
        let event = 'message';
        let data = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            event = line.replace('event: ', '').trim();
          } else if (line.startsWith('data: ')) {
            data = line.replace('data: ', '').trim();
          }
        }

        if (event === 'progress' && onProgress && data) {
          try {
            const parsed = JSON.parse(data);
            onProgress(parsed.message || parsed.text || parsed);
          } catch (_e) {
            // Ignore invalid progress chunk
          }
        } else if ((event === 'complete' || event === 'done') && data) {
          try {
            result = JSON.parse(data);
          } catch (_e) {
            // Ignore payload parsing error
          }
        } else if (event === 'error' && data) {
          let parsed = {};
          try {
            parsed = JSON.parse(data);
          } catch (_e) {
            parsed = { message: data };
          }
          const err = new Error(parsed.message || 'Error from assistant');
          err.response = { data: parsed };
          throw err;
        }
      }
    }

    if (result) {
      return { data: result };
    }
    throw new Error('Stream ended without complete event');
  },

  /**
   * Delete a conversation (soft delete)
   * @param {string} id
   */
  deleteSession: (id) => apiClient.delete(AI_ASSISTANT.SESSION(id)),
};

export default aiAssistantApi;
