// Mirror of the backend REPORT_TARGET_TYPES
export const REPORT_TARGET_TYPES = Object.freeze({
  USER: 'user',
  MESSAGE: 'message',
  PLAYDATE: 'playdate',
});

// Mirror of the backend REPORT_CATEGORIES
export const REPORT_CATEGORIES = Object.freeze({
  HARASSMENT: 'harassment',
  INAPPROPRIATE_CONTENT: 'inappropriate_content',
  SPAM: 'spam',
  FAKE_PROFILE: 'fake_profile',
  CHILD_SAFETY: 'child_safety',
  NO_SHOW: 'no_show',
  OTHER: 'other',
});

// Category options for UI chips in ReportModal
export const REPORT_CATEGORY_OPTIONS = Object.freeze([
  {
    value: REPORT_CATEGORIES.HARASSMENT,
    label: 'Quấy rối / Làm phiền',
    description: 'Tin nhắn đeo bám, xúc phạm hoặc đe dọa',
  },
  {
    value: REPORT_CATEGORIES.INAPPROPRIATE_CONTENT,
    label: 'Nội dung không phù hợp',
    description: 'Hình ảnh, ngôn từ phản cảm hoặc thiếu văn hóa',
  },
  {
    value: REPORT_CATEGORIES.SPAM,
    label: 'Spam / Tin rác',
    description: 'Quảng cáo, đường dẫn độc hại hoặc tin nhắn lặp lại',
  },
  {
    value: REPORT_CATEGORIES.FAKE_PROFILE,
    label: 'Hồ sơ giả mạo',
    description: 'Mạo danh người khác, ảnh hoặc thông tin sai lệch',
  },
  {
    value: REPORT_CATEGORIES.CHILD_SAFETY,
    label: 'An toàn cho trẻ em',
    description: 'Hành vi tiềm ẩn nguy hiểm đến trẻ em',
  },
  {
    value: REPORT_CATEGORIES.NO_SHOW,
    label: 'Bỏ hẹn không lý do',
    description: 'Không đến điểm hẹn Playdate mà không thông báo',
  },
  {
    value: REPORT_CATEGORIES.OTHER,
    label: 'Lý do khác',
    description: 'Các vi phạm hoặc vấn đề phát sinh khác',
  },
]);

export const REPORT_LIMITS = Object.freeze({
  MAX_EVIDENCE_URLS: 5,
  MAX_DESCRIPTION_LENGTH: 1000,
});

// Backend error codes -> user-facing messages (the API returns English messages)
/**
 * Codes returned by the /safety endpoints (safety.service); shared middleware codes are in
 * constants/error.constants.js.
 */
export const SAFETY_ERROR_MESSAGES = Object.freeze({
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh.',
  ID_REQUIRED: 'Thiếu thông tin phụ huynh cần xử lý.',
  TARGET_PARENT_NOT_FOUND: 'Không tìm thấy phụ huynh này.',
  SELF_BLOCK_NOT_ALLOWED: 'Bạn không thể tự chặn chính mình.',
  REPORTED_USER_REQUIRED: 'Thiếu thông tin phụ huynh bị báo cáo.',
  CATEGORY_REQUIRED: 'Vui lòng chọn danh mục vi phạm.',
  INVALID_CATEGORY: 'Danh mục vi phạm không hợp lệ.',
  REASON_REQUIRED: 'Vui lòng nhập lý do báo cáo.',
  REPORTED_USER_NOT_FOUND: 'Không tìm thấy phụ huynh bị báo cáo.',
  SELF_REPORT_NOT_ALLOWED: 'Bạn không thể tự báo cáo chính mình.',
  INVALID_EVIDENCE_URL: 'Ảnh bằng chứng không hợp lệ. Vui lòng tải ảnh lên lại qua BuddyLink.',
  REPORT_TOO_FREQUENT: 'Bạn đã báo cáo người này gần đây. Đội ngũ BuddyLink đang xem xét.',
  VALIDATION_ERROR: 'Thông tin báo cáo chưa hợp lệ. Vui lòng kiểm tra lại.',
});

