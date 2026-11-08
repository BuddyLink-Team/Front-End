import { MESSAGE_TYPES, POLL_LIMITS, DEFAULT_POLL_QUESTION } from '../constants/chat.constants.js';

const STORAGE_KEY = 'buddylink_mock_chat_polls_v1';
const MOCK_PARENT_ID = 'parent-me';
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

const fail = (code, message, status = 400) => {
  const error = new Error(message);
  error.response = { status, data: { success: false, message, data: null, error: { code, details: [] } } };
  throw error;
};

/**
 * Poll message as the backend ChatDTO.toMessageResponse returns it, for the current parent
 * @param {Object} stored
 * @returns {Object}
 */
const toMessageResponse = (stored) => {
  const options = stored.poll.options.map((option) => ({
    ...option,
    voteCount: option.voterParentIds.length,
    hasVoted: option.voterParentIds.includes(MOCK_PARENT_ID),
  }));
  return {
    ...stored,
    isMine: stored.senderId === MOCK_PARENT_ID,
    poll: { ...stored.poll, options, totalVotes: options.reduce((sum, option) => sum + option.voteCount, 0) },
  };
};

/**
 * Time polls of the playdate group chat, kept in localStorage so they survive a reload
 */
class ChatMockService {
  _getStored() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (_error) {
      return {};
    }
  }

  _save(polls) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
    } catch (_error) {
      // Mock data only: a full or blocked storage keeps the polls for this page only
    }
  }

  resetFactoryData() {
    this._save({});
  }

  async createPoll(conversationId, payload = {}) {
    await delay();
    const options = payload.options || [];
    if (options.length < POLL_LIMITS.MIN_OPTIONS) fail('INVALID_POLL_OPTIONS', 'Poll must have at least 2 options');

    const id = `msg-poll-${Date.now()}`;
    const question = payload.question || DEFAULT_POLL_QUESTION;
    const stored = {
      id,
      conversationId,
      senderId: MOCK_PARENT_ID,
      sender: { id: MOCK_PARENT_ID, fullName: 'Tôi' },
      type: MESSAGE_TYPES.POLL,
      content: question,
      readBy: [],
      poll: {
        question,
        options: options.map((option, index) => ({
          id: option.id || `opt_${index + 1}`,
          date: option.date || null,
          time: option.time || null,
          label: option.label,
          voterParentIds: [],
        })),
        deadline: payload.deadline || null,
        isClosed: false,
      },
      createdAt: new Date().toISOString(),
    };
    const polls = this._getStored();
    polls[id] = stored;
    this._save(polls);
    return { success: true, message: 'Poll created successfully', data: toMessageResponse(stored) };
  }

  async votePoll(messageId, optionId) {
    await delay();
    const polls = this._getStored();
    const stored = polls[messageId];
    if (!stored) fail('MESSAGE_NOT_FOUND', 'Message not found', 404);
    if (stored.poll.isClosed) fail('POLL_CLOSED', 'Poll is already closed');
    const target = stored.poll.options.find((option) => option.id === optionId);
    if (!target) fail('INVALID_OPTION', 'Invalid option id');

    stored.poll.options.forEach((option) => {
      option.voterParentIds = option.voterParentIds.filter((id) => id !== MOCK_PARENT_ID);
    });
    target.voterParentIds.push(MOCK_PARENT_ID);
    this._save(polls);
    return { success: true, message: 'Vote recorded successfully', data: toMessageResponse(stored) };
  }
}

export const chatMockService = new ChatMockService();
export default chatMockService;
