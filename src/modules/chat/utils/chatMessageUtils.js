import { MESSAGE_STATUS, POLL_LIMITS } from '../constants/chat.constants.js';
import { formatSlotDay } from '../../playdate/utils/suggestionFormatters';
import { formatTimeRange } from '../../../utils/formatters';

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

/**
 * Poll option from a suggested time slot: "T7 15/11 · 09:00 - 11:00", keeping its date and time
 * @param {{ date: string, time: string }} slot
 * @param {number} durationMinutes
 * @returns {{ label: string, date: string, time: string }}
 */
export const pollOptionFromSlot = (slot, durationMinutes) => ({
  label: `${formatSlotDay(slot.date)} · ${formatTimeRange(slot.time, durationMinutes)}`,
  date: slot.date,
  time: slot.time,
});

/**
 * Body of POST /chat/conversations/:id/poll from the form: empty options dropped, closes after 48 hours
 * @param {{ question: string, options: Array<{ label: string, date?: string|null, time?: string|null }> }} form
 * @param {Date} [now]
 * @returns {Object}
 */
export const toPollPayload = ({ question, options }, now = new Date()) => ({
  question: question.trim(),
  options: options
    .map((option) => ({ ...option, label: option.label.trim() }))
    .filter((option) => option.label)
    .map((option, index) => ({ id: `opt_${index + 1}`, label: option.label, date: option.date || null, time: option.time || null })),
  deadline: new Date(now.getTime() + POLL_LIMITS.DEADLINE_HOURS * 60 * 60 * 1000).toISOString(),
});
