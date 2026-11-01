import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { createAISession, fetchAISession, sendAIMessage, setActiveAISession } from '../redux/aiAssistantSlice';
import { choiceMessageText, createLocalId } from '../utils/aiAssistantUtils';
import { AI_ERROR_MESSAGES, AI_LIMITS } from '../constants/ai-assistant.constants';

const EMPTY_MESSAGES = [];

/**
 * One conversation: its messages, sending (typed text or tapped options) and retry.
 * Without an active session, the first message creates one.
 * @param {string|null} sessionId
 */
export const useAIChat = (sessionId) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const messages = useSelector((state) => (sessionId && state.aiAssistant.messagesBySession[sessionId]) || EMPTY_MESSAGES);
  const session = useSelector((state) => (sessionId ? state.aiAssistant.sessionsById[sessionId] : null));
  const isLoading = useSelector((state) => Boolean(sessionId) && state.aiAssistant.loadingSessionId === sessionId);
  // A new conversation is busy while its session is created, an existing one while its reply is awaited
  const isSending = useSelector((state) =>
    sessionId ? state.aiAssistant.sendingSessionIds.includes(sessionId) : state.aiAssistant.isCreatingSession,
  );
  const hasMessages = useSelector((state) => Boolean(sessionId && state.aiAssistant.messagesBySession[sessionId]));

  // Load a conversation opened from the history (or a ?session= link)
  useEffect(() => {
    if (!sessionId || hasMessages) return;
    dispatch(fetchAISession(sessionId))
      .unwrap()
      .catch((err) => {
        toast.error(getApiErrorMsg(AI_ERROR_MESSAGES, err, 'Không thể tải cuộc trò chuyện.'));
        dispatch(setActiveAISession(null));
      });
  }, [dispatch, sessionId, hasMessages, toast]);

  const messageCap = session?.messageCap ?? null;
  const messageCount = session?.messageCount ?? 0;
  const isSessionFull = messageCap !== null && messageCount >= messageCap;
  const messagesLeft = messageCap !== null ? Math.max(0, messageCap - messageCount) : null;

  /**
   * @param {string} content
   * @param {Object} [choice]
   * @param {string} [localId] - The failed message being retried
   */
  const dispatchSend = useCallback(
    async (content, choice, localId = createLocalId()) => {
      let targetId = sessionId;
      if (!targetId) {
        try {
          const { session: created } = await dispatch(createAISession()).unwrap();
          targetId = created.id;
        } catch (err) {
          toast.error(getApiErrorMsg(AI_ERROR_MESSAGES, err, 'Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.'));
          return false;
        }
      }
      // A failed message stays in the list with its error and a retry button
      const result = await dispatch(sendAIMessage({ sessionId: targetId, content, choice, localId }));
      return sendAIMessage.fulfilled.match(result);
    },
    [dispatch, sessionId, toast],
  );

  const send = useCallback(
    (text) => {
      const content = String(text || '').trim().slice(0, AI_LIMITS.MAX_MESSAGE_LENGTH);
      if (!content || isSending) return Promise.resolve(false);
      return dispatchSend(content);
    },
    [dispatchSend, isSending],
  );

  /**
   * Answer a choice card by tapping
   * @param {string} messageId - Assistant message holding the card
   * @param {Object} card
   * @param {{ optionIds?: string[], custom?: Object, label?: string }} answer
   */
  const choose = useCallback(
    (messageId, card, { optionIds = [], custom, label }) => {
      if (isSending) return Promise.resolve(false);
      // The summary card has no options, only its confirm button
      const picked = (card.options || []).filter((option) => optionIds.includes(option.id));
      const content = label || (picked.length ? choiceMessageText(picked) : 'Bỏ qua bước này');
      return dispatchSend(content, { messageId, stepId: card.stepId, optionIds, ...(custom ? { custom } : {}) });
    },
    [dispatchSend, isSending],
  );

  const retry = useCallback(
    (message) => {
      if (isSending) return Promise.resolve(false);
      const choice = message.choice ? { ...message.choice } : undefined;
      return dispatchSend(message.content, choice, message.localId);
    },
    [dispatchSend, isSending],
  );

  return {
    messages,
    session,
    planDraft: session?.planDraft || null,
    isLoading,
    isSending,
    isSessionFull,
    messagesLeft,
    send,
    choose,
    retry,
  };
};

export default useAIChat;
