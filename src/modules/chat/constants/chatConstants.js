export const CONVERSATION_TYPES = Object.freeze({
  ALL: 'all',
  DIRECT: 'direct',
  PLAYDATE: 'playdate',
});

export const MESSAGE_TYPES = Object.freeze({
  TEXT: 'text',
  IMAGE: 'image',
  EMOJI: 'emoji',
  SYSTEM: 'system',
});

export const CHAT_TABS = Object.freeze([
  { id: CONVERSATION_TYPES.ALL, label: 'Tất cả' },
  { id: CONVERSATION_TYPES.DIRECT, label: 'Trực tiếp' },
  { id: CONVERSATION_TYPES.PLAYDATE, label: 'Nhóm Playdate' },
]);

export const SOCKET_EVENTS = Object.freeze({
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  TYPING: 'typing',
  USER_TYPING: 'user_typing',
  READ_STATUS: 'read_status',
  MESSAGE_READ: 'message_read',
  CONVERSATION_UPDATED: 'conversation_updated',
});

export const QUICK_EMOJIS = ['😊', '❤️', '👍', '🎉', '👶', '🧸', '🎨', '⚽', '🍦', '⭐', '🤗', '✨'];
