import { createSlice } from '@reduxjs/toolkit';
import { createApiThunk } from '../../../utils/reduxUtils';
import chatApi from '../api/chatApi';
import { PAGE_SIZE } from '../constants/chatConstants';
import { upsertMessage, setMessageStatus } from '../utils/chatMessageUtils';

// ---- Thunks (REST calls for chat live here, not in hooks/components) ----

export const fetchConversations = createApiThunk('chat/fetchConversations', () => chatApi.getConversations());

export const fetchConversationById = createApiThunk('chat/fetchConversationById', (conversationId) =>
  chatApi.getConversation(conversationId),
);

export const fetchMessages = createApiThunk('chat/fetchMessages', (conversationId) =>
  chatApi.getMessages(conversationId, { limit: PAGE_SIZE }),
);

export const fetchOlderMessages = createApiThunk('chat/fetchOlderMessages', ({ conversationId, before }) =>
  chatApi.getMessages(conversationId, { limit: PAGE_SIZE, before }),
);

export const sendMessageRest = createApiThunk('chat/sendMessageRest', ({ conversationId, payload }) =>
  chatApi.sendMessage(conversationId, payload),
);

export const markConversationReadRest = createApiThunk('chat/markConversationRead', (conversationId) =>
  chatApi.markAsRead(conversationId),
);

// Returns { mediaUrl, publicId }
export const uploadChatImage = createApiThunk('chat/uploadImage', (file) => chatApi.uploadImage(file));

const LIST_STATUS = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
});

const initialState = {
  conversations: [],
  conversationsStatus: LIST_STATUS.IDLE,
  // Conversation opened by URL that is not (yet) in the list
  activeConversationDetail: null,

  // Messages of the open conversation only
  messagesConversationId: null,
  messages: [],
  isLoadingMessages: false,
  hasMoreMessages: false,
  isLoadingOlder: false,
};

const getSenderId = (message) =>
  message?.senderId?._id || message?.senderId?.id || message?.senderId || message?.sender?.id;

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    conversationUpdated: (state, action) => {
      const updatedConversation = action.payload;
      if (!updatedConversation?.id) return;
      const index = state.conversations.findIndex((c) => c.id === updatedConversation.id);
      if (index === -1) {
        state.conversations.unshift(updatedConversation);
      } else {
        state.conversations[index] = { ...state.conversations[index], ...updatedConversation };
      }
    },

    /**
     * Apply a new message from the socket / ack / REST response.
     * payload: { message, isMine }
     */
    messageReceived: (state, action) => {
      const { message, isMine } = action.payload;
      if (!message?.id) return;

      const isOpenConversation = message.conversationId === state.messagesConversationId;
      if (isOpenConversation) {
        state.messages = upsertMessage(state.messages, message);
      }

      const index = state.conversations.findIndex((c) => c.id === message.conversationId);
      if (index === -1) return;

      const conversation = state.conversations[index];
      const updatedConversation = {
        ...conversation,
        lastMessage: {
          messageId: message.id,
          senderId: getSenderId(message),
          senderName: message.sender?.fullName || '',
          content: message.content,
          type: message.type,
          sentAt: message.createdAt,
        },
        unreadCount: isOpenConversation || isMine ? 0 : (conversation.unreadCount || 0) + 1,
        updatedAt: message.createdAt,
      };

      // Move the updated conversation to the top
      state.conversations.splice(index, 1);
      state.conversations.unshift(updatedConversation);
    },

    optimisticMessageAdded: (state, action) => {
      if (action.payload?.conversationId === state.messagesConversationId) {
        state.messages.push(action.payload);
      }
    },

    // payload: { tempId, status }
    messageStatusChanged: (state, action) => {
      state.messages = setMessageStatus(state.messages, action.payload.tempId, action.payload.status);
    },

    // The partner read the conversation: only my outgoing messages become "seen"
    // payload: { conversationId, readerId, currentParentId }
    messagesReadByPartner: (state, action) => {
      const { conversationId, readerId, currentParentId } = action.payload;
      if (conversationId !== state.messagesConversationId) return;
      if (!currentParentId || String(readerId) === String(currentParentId)) return;

      state.messages.forEach((message) => {
        if (String(getSenderId(message)) === String(currentParentId)) {
          message.isRead = true;
        }
      });
    },

    activeConversationClosed: (state) => {
      state.messagesConversationId = null;
      state.messages = [];
      state.hasMoreMessages = false;
      state.activeConversationDetail = null;
    },

    // Called on logout so the next account never sees the previous account's messages
    resetChatState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsStatus = LIST_STATUS.LOADING;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsStatus = LIST_STATUS.SUCCEEDED;
        state.conversations = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchConversations.rejected, (state) => {
        state.conversationsStatus = LIST_STATUS.FAILED;
      })

      .addCase(fetchConversationById.fulfilled, (state, action) => {
        state.activeConversationDetail = action.payload;
      })

      .addCase(fetchMessages.pending, (state, action) => {
        state.messagesConversationId = action.meta.arg;
        state.messages = [];
        state.isLoadingMessages = true;
        state.hasMoreMessages = false;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        // Ignore a late response for a conversation the user already left
        if (action.meta.arg !== state.messagesConversationId) return;
        const list = Array.isArray(action.payload) ? action.payload : [];
        state.isLoadingMessages = false;
        state.messages = list;
        state.hasMoreMessages = list.length >= PAGE_SIZE;

        const conversation = state.conversations.find((c) => c.id === action.meta.arg);
        if (conversation) conversation.unreadCount = 0;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        if (action.meta.arg === state.messagesConversationId) {
          state.isLoadingMessages = false;
        }
      })

      .addCase(fetchOlderMessages.pending, (state) => {
        state.isLoadingOlder = true;
      })
      .addCase(fetchOlderMessages.fulfilled, (state, action) => {
        state.isLoadingOlder = false;
        if (action.meta.arg.conversationId !== state.messagesConversationId) return;

        const olderList = Array.isArray(action.payload) ? action.payload : [];
        if (olderList.length < PAGE_SIZE) {
          state.hasMoreMessages = false;
        }
        const existingIds = new Set(state.messages.map((m) => m.id));
        state.messages = [...olderList.filter((m) => !existingIds.has(m.id)), ...state.messages];
      })
      .addCase(fetchOlderMessages.rejected, (state) => {
        state.isLoadingOlder = false;
      });
  },
});

export const {
  conversationUpdated,
  messageReceived,
  optimisticMessageAdded,
  messageStatusChanged,
  messagesReadByPartner,
  activeConversationClosed,
  resetChatState,
} = chatSlice.actions;

export { LIST_STATUS as CHAT_LIST_STATUS };

export default chatSlice.reducer;
