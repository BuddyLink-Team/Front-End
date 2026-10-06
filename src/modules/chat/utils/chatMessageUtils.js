import { MESSAGE_STATUS } from '../constants/chatConstants.js';

/**
 * Generate a client-only id for an optimistic message. It is echoed back by the server
 * to the sender so the optimistic message can be matched, but it is never stored.
 * @returns {string}
 */
export const createTempId = () => {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `tmp-${random}`;
};

/**
 * Build an optimistic (not yet persisted) message shown immediately in the stream.
 */
export const buildOptimisticMessage = ({ tempId, conversationId, senderId, content, type, mediaUrl }) => ({
  id: tempId,
  tempId,
  conversationId,
  senderId,
  content,
  type,
  mediaUrl: mediaUrl || null,
  isMine: true,
  isRead: false,
  createdAt: new Date().toISOString(),
  status: MESSAGE_STATUS.SENDING,
});

/**
 * Insert a persisted message into the stream, replacing its optimistic copy when tempId matches.
 * Safe to call several times for the same message (ack, own-room echo, REST response).
 * @param {Array<Object>} messages
 * @param {Object} message
 * @returns {Array<Object>}
 */
export const upsertMessage = (messages, message) => {
  if (!message?.id) return messages;

  const tempIndex = message.tempId
    ? messages.findIndex((m) => m.status && m.tempId === message.tempId)
    : -1;

  if (tempIndex >= 0) {
    const next = [...messages];
    next[tempIndex] = message;
    // An echo without tempId may already have been appended; keep only the replaced copy
    return next.filter((m, index) => index === tempIndex || m.id !== message.id);
  }

  if (messages.some((m) => m.id === message.id)) {
    return messages;
  }

  return [...messages, message];
};

/**
 * Set the delivery status of an optimistic message.
 * @param {Array<Object>} messages
 * @param {string} tempId
 * @param {string} status
 * @returns {Array<Object>}
 */
export const setMessageStatus = (messages, tempId, status) =>
  messages.map((m) => (m.status && m.tempId === tempId ? { ...m, status } : m));

/**
 * Id of the oldest persisted message, used as the pagination cursor.
 * @param {Array<Object>} messages
 * @returns {string|null}
 */
export const getOldestPersistedMessageId = (messages) =>
  messages.find((m) => !m.status)?.id || null;
