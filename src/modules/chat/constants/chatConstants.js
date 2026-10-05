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

// Client-only delivery states of optimistic messages (persisted messages have no status)
export const MESSAGE_STATUS = Object.freeze({
  SENDING: 'sending',
  FAILED: 'failed',
});

// Ack wait time before an optimistic message is marked as failed
export const SOCKET_ACK_TIMEOUT_MS = 8000;

export const PAGE_SIZE = 50;

export const CHAT_TABS = Object.freeze([
  { id: CONVERSATION_TYPES.ALL, label: 'Tất cả' },
  { id: CONVERSATION_TYPES.DIRECT, label: 'Kết nối' },
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

// Must match the image types accepted by the backend upload middleware
export const ALLOWED_IMAGE_EXTENSIONS = Object.freeze(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
export const ALLOWED_IMAGE_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
export const CHAT_FILE_INPUT_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const QUICK_EMOJIS = ['😊', '❤️', '👍', '🎉', '👶', '🧸', '🎨', '⚽', '🍦', '⭐', '🤗', '✨'];


/**
 * Codes returned by the chat REST endpoints and socket acks (chat.service, chat.socket,
 * upload middleware, storage adapter); shared middleware codes are in constants/error.constants.js.
 */
export const CHAT_ERROR_MESSAGES = Object.freeze({
  PARENT_REQUIRED: 'Chỉ tài khoản phụ huynh mới sử dụng được tính năng trò chuyện.',
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh.',
  ID_REQUIRED: 'Thiếu thông tin cuộc trò chuyện. Vui lòng thử lại.',
  CONVERSATION_NOT_FOUND: 'Không tìm thấy cuộc trò chuyện.',
  FORBIDDEN_CONVERSATION_ACCESS: 'Bạn không có quyền truy cập cuộc trò chuyện này.',
  SELF_CHAT_NOT_ALLOWED: 'Bạn không thể tự nhắn tin cho chính mình.',
  TARGET_PARENT_NOT_FOUND: 'Không tìm thấy phụ huynh này.',
  USER_BLOCKED: 'Không thể nhắn tin vì một trong hai người đã chặn nhau.',
  CONNECTION_REQUIRED: 'Bạn chỉ có thể nhắn tin với phụ huynh đã kết nối.',
  INVALID_MESSAGE_TYPE: 'Loại tin nhắn không hợp lệ.',
  INVALID_MESSAGE_PAYLOAD: 'Dữ liệu tin nhắn không hợp lệ.',
  MESSAGE_TOO_LONG: 'Tin nhắn không được vượt quá 5000 ký tự.',
  MESSAGE_EMPTY: 'Tin nhắn không được để trống.',
  INVALID_MEDIA_URL: 'Ảnh đính kèm không hợp lệ. Vui lòng tải ảnh lên lại.',
  JOIN_REJECTED: 'Không thể mở cuộc trò chuyện. Vui lòng thử lại.',
  INTERNAL_ERROR: 'Không thể gửi tin nhắn. Vui lòng thử lại sau.',
  // Image upload
  FILE_REQUIRED: 'Vui lòng chọn ảnh để gửi.',
  INVALID_FILE_TYPE: 'Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.',
  FILE_TOO_LARGE: 'Kích thước ảnh không được vượt quá 5MB.',
  FILE_UPLOAD_ERROR: 'Tệp tải lên không hợp lệ. Vui lòng chọn ảnh khác.',
  UPLOAD_BUFFER_EMPTY: 'Tệp tải lên không hợp lệ hoặc bị lỗi.',
  STORAGE_UPLOAD_ERROR: 'Tải ảnh lên thất bại. Vui lòng thử lại.',
  STORAGE_NOT_CONFIGURED: 'Hệ thống lưu trữ ảnh đang gặp sự cố. Vui lòng thử lại sau.',
});
