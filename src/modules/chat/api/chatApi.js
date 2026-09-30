import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

export const chatApi = {
  /**
   * Get list of conversations for current user
   */
  getConversations: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.CHAT.CONVERSATIONS, { params });
  },

  /**
   * Get single conversation details
   */
  getConversation: async (conversationId) => {
    return apiClient.get(`${API_ENDPOINTS.CHAT.CONVERSATIONS}/${conversationId}`);
  },

  /**
   * Get or initialize Playdate group chat by playdateId
   */
  getPlaydateConversation: async (playdateId) => {
    return apiClient.get(`${API_ENDPOINTS.CHAT.PLAYDATE}/${playdateId}`);
  },

  /**
   * Get or create a direct conversation with target parent
   */
  createDirectConversation: async (targetParentId) => {
    return apiClient.post(API_ENDPOINTS.CHAT.CONVERSATIONS, { targetParentId });
  },

  /**
   * Get messages in a conversation
   */
  getMessages: async (conversationId, params = {}) => {
    return apiClient.get(`${API_ENDPOINTS.CHAT.MESSAGES}/${conversationId}/messages`, { params });
  },

  /**
   * Send a message in a conversation via REST API
   */
  sendMessage: async (conversationId, data) => {
    return apiClient.post(`${API_ENDPOINTS.CHAT.MESSAGES}/${conversationId}/messages`, data);
  },

  /**
   * Mark conversation as read
   */
  markAsRead: async (conversationId) => {
    return apiClient.post(`${API_ENDPOINTS.CHAT.MESSAGES}/${conversationId}/read`);
  },

  /**
   * Upload image attachment
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post(API_ENDPOINTS.CHAT.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default chatApi;
