import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { createApiThunk } from '../../../utils/reduxUtils';
import { getErrorCode } from '../../../utils/errorUtils';
import { aiAssistantApi } from '../api/aiAssistantApi';
import { logout, logoutUser, restoreSession } from '../../auth/redux/authSlice';
import {
  AI_CARD_TYPES,
  AI_CHOICE_STATUS,
  AI_MESSAGE_STATUS,
  AI_LIMITS,
} from '../constants/ai-assistant.constants';

export const fetchAISessions = createApiThunk('aiAssistant/fetchSessions', (params) =>
  aiAssistantApi.listSessions(params),
);

export const fetchAISession = createApiThunk('aiAssistant/fetchSession', (id) => aiAssistantApi.getSession(id));

export const createAISession = createApiThunk('aiAssistant/createSession', () => aiAssistantApi.createSession());

/**
 * @param {{ sessionId: string, content: string, choice?: Object, localId: string }} arg
 *   localId identifies the optimistic message (and a retry of it)
 */
export const sendAIMessage = createApiThunk('aiAssistant/sendMessage', ({ sessionId, content, choice }) =>
  aiAssistantApi.sendMessage(sessionId, { content, ...(choice ? { choice } : {}) }),
);

export const deleteAISession = createApiThunk('aiAssistant/deleteSession', async (id) => {
  await aiAssistantApi.deleteSession(id);
  return { data: { id } };
});

const initialState = {
  sessions: [],
  pagination: { page: 1, limit: AI_LIMITS.SESSIONS_PAGE_SIZE, total: 0, totalPages: 1 },
  isSessionsLoading: false,
  hasLoadedSessions: false,
  activeSessionId: null,
  // id -> { id, title, messageCount, messageCap, planDraft }
  sessionsById: {},
  // id -> messages (server DTO + { localId, status, errorCode })
  messagesBySession: {},
  loadingSessionId: null,
  // Sessions waiting for a reply (a parent can send in another conversation meanwhile)
  sendingSessionIds: [],
  // The first message of a new conversation creates its session first
  isCreatingSession: false,
  // { limit, used, remaining } returned by the last message (-1 = unlimited)
  quota: null,
  isDrawerOpen: false,
};

const toListItem = ({ id, title, lastMessageAt, createdAt, updatedAt }) => ({ id, title, lastMessageAt, createdAt, updatedAt });

const storeSession = (state, session) => {
  const { messages, ...summary } = session;
  state.sessionsById[session.id] = { ...state.sessionsById[session.id], ...summary };
  if (messages) {
    state.messagesBySession[session.id] = messages.map((message) => ({ ...message, status: AI_MESSAGE_STATUS.SENT }));
  }
};

// A message that failed on the client may still have been stored (e.g. the request timed out while the
// server finished the turn): it is dropped once the server has the same message, sent at or after it
const isOnServer = (local, serverMessages) =>
  serverMessages.some(
    (m) => m.role === 'user' && m.content === local.content && new Date(m.createdAt) >= new Date(local.createdAt),
  );

const stopSending = (state, sessionId) => {
  state.sendingSessionIds = state.sendingSessionIds.filter((id) => id !== sessionId);
};

// The conversation that just changed goes to the top of the history
const moveToTop = (state, session) => {
  state.sessions = [toListItem({ ...session, updatedAt: new Date().toISOString() }), ...state.sessions.filter((s) => s.id !== session.id)];
};

// Open / reopen a choice card while its answer is being sent
const setCardStatus = (messages, choice, status, selectedOptionIds = []) => {
  const message = messages?.find((m) => m.id === choice?.messageId);
  const card = message?.cards?.find((c) => c.type === AI_CARD_TYPES.CHOICES && c.stepId === choice.stepId);
  if (!card) return;
  card.status = status;
  card.selectedOptionIds = selectedOptionIds;
};

const aiAssistantSlice = createSlice({
  name: 'aiAssistant',
  initialState,
  reducers: {
    setActiveAISession(state, action) {
      state.activeSessionId = action.payload || null;
    },
    openAIDrawer(state) {
      state.isDrawerOpen = true;
    },
    closeAIDrawer(state) {
      state.isDrawerOpen = false;
    },
    discardAIMessage(state, action) {
      const { sessionId, localId } = action.payload;
      const messages = state.messagesBySession[sessionId];
      if (messages) state.messagesBySession[sessionId] = messages.filter((m) => m.localId !== localId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAISessions.pending, (state) => {
        state.isSessionsLoading = true;
      })
      .addCase(fetchAISessions.fulfilled, (state, action) => {
        const { sessions = [], pagination } = action.payload || {};
        const isNextPage = (pagination?.page || 1) > 1;
        const known = new Set(isNextPage ? state.sessions.map((s) => s.id) : []);
        state.sessions = isNextPage ? [...state.sessions, ...sessions.filter((s) => !known.has(s.id))] : sessions;
        if (pagination) state.pagination = pagination;
        state.isSessionsLoading = false;
        state.hasLoadedSessions = true;
      })
      .addCase(fetchAISessions.rejected, (state) => {
        state.isSessionsLoading = false;
        state.hasLoadedSessions = true;
      })

      .addCase(fetchAISession.pending, (state, action) => {
        state.loadingSessionId = action.meta.arg;
      })
      .addCase(fetchAISession.fulfilled, (state, action) => {
        const { session } = action.payload;
        // Keep messages still being sent, and failed ones the server does not have
        const local = (state.messagesBySession[session.id] || []).filter(
          (m) =>
            m.status === AI_MESSAGE_STATUS.PENDING ||
            (m.status === AI_MESSAGE_STATUS.FAILED && !isOnServer(m, session.messages || [])),
        );
        storeSession(state, session);
        state.messagesBySession[session.id] = [...state.messagesBySession[session.id], ...local];
        state.loadingSessionId = null;
      })
      .addCase(fetchAISession.rejected, (state) => {
        state.loadingSessionId = null;
      })

      .addCase(createAISession.pending, (state) => {
        state.isCreatingSession = true;
      })
      .addCase(createAISession.rejected, (state) => {
        state.isCreatingSession = false;
      })
      .addCase(createAISession.fulfilled, (state, action) => {
        const { session } = action.payload;
        state.isCreatingSession = false;
        storeSession(state, { ...session, planDraft: null, messages: [] });
        state.activeSessionId = session.id;
        moveToTop(state, session);
        state.pagination.total += 1;
      })

      .addCase(sendAIMessage.pending, (state, action) => {
        const { sessionId, content, choice, localId } = action.meta.arg;
        const messages = (state.messagesBySession[sessionId] ||= []);
        const existing = messages.find((m) => m.localId === localId);
        if (existing) {
          existing.status = AI_MESSAGE_STATUS.PENDING;
          existing.errorCode = null;
        } else {
          messages.push({
            id: localId,
            localId,
            role: 'user',
            content,
            choice: choice ? { messageId: choice.messageId, stepId: choice.stepId, optionIds: choice.optionIds || [] } : null,
            cards: [],
            createdAt: new Date().toISOString(),
            status: AI_MESSAGE_STATUS.PENDING,
          });
        }
        if (choice) setCardStatus(messages, choice, AI_CHOICE_STATUS.ANSWERED, choice.optionIds || []);
        if (!state.sendingSessionIds.includes(sessionId)) state.sendingSessionIds.push(sessionId);
      })
      .addCase(sendAIMessage.fulfilled, (state, action) => {
        const { sessionId, localId, choice } = action.meta.arg;
        const { session, userMessage, reply, planDraft, answeredCard, quota } = action.payload;
        const messages = (state.messagesBySession[sessionId] || []).filter((m) => m.localId !== localId);
        // The tapped card as the server stored it (e.g. the id of the created playdate); still open when the tap failed
        const answered = answeredCard && messages.find((m) => m.id === answeredCard.messageId);
        if (answered) answered.cards = answeredCard.cards;
        else if (choice && answeredCard === null) setCardStatus(messages, choice, AI_CHOICE_STATUS.OPEN);
        messages.push({ ...userMessage, status: AI_MESSAGE_STATUS.SENT }, { ...reply, status: AI_MESSAGE_STATUS.SENT });
        state.messagesBySession[sessionId] = messages;
        state.sessionsById[sessionId] = { ...state.sessionsById[sessionId], ...session, planDraft };
        state.quota = quota || state.quota;
        stopSending(state, sessionId);
        moveToTop(state, session);
      })
      .addCase(sendAIMessage.rejected, (state, action) => {
        const { sessionId, localId, choice } = action.meta.arg;
        const messages = state.messagesBySession[sessionId] || [];
        const failed = messages.find((m) => m.localId === localId);
        if (failed) {
          failed.status = AI_MESSAGE_STATUS.FAILED;
          failed.errorCode = getErrorCode(action.payload);
        }
        if (choice) setCardStatus(messages, choice, AI_CHOICE_STATUS.OPEN);
        stopSending(state, sessionId);
      })

      .addCase(deleteAISession.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.sessions = state.sessions.filter((s) => s.id !== id);
        delete state.sessionsById[id];
        delete state.messagesBySession[id];
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.activeSessionId === id) state.activeSessionId = null;
      })

      // Every way the session ends: never show the previous account's conversations
      .addMatcher(isAnyOf(logout, logoutUser.fulfilled, restoreSession.rejected), () => initialState);
  },
});

export const { setActiveAISession, openAIDrawer, closeAIDrawer, discardAIMessage } = aiAssistantSlice.actions;
export default aiAssistantSlice.reducer;
