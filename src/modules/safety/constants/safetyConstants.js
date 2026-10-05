// Backend error codes -> user-facing messages (the API returns English messages)
/**
 * Codes returned by the /safety endpoints (safety.service); shared middleware codes are in
 * constants/error.constants.js.
 */
export const SAFETY_ERROR_MESSAGES = Object.freeze({
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh.',
  ID_REQUIRED: 'Thiếu thông tin phụ huynh cần chặn.',
  TARGET_PARENT_NOT_FOUND: 'Không tìm thấy phụ huynh này.',
  SELF_BLOCK_NOT_ALLOWED: 'Bạn không thể tự chặn chính mình.',
  REPORTED_USER_REQUIRED: 'Thiếu thông tin phụ huynh bị báo cáo.',
  REASON_REQUIRED: 'Vui lòng nhập lý do báo cáo.',
  REPORTED_USER_NOT_FOUND: 'Không tìm thấy phụ huynh bị báo cáo.',
  SELF_REPORT_NOT_ALLOWED: 'Bạn không thể tự báo cáo chính mình.',
  INVALID_EVIDENCE_URL: 'Ảnh bằng chứng không hợp lệ. Vui lòng tải ảnh lên lại.',
  REPORT_TOO_FREQUENT: 'Bạn đã báo cáo người này gần đây. Đội ngũ BuddyLink đang xem xét.',
  VALIDATION_ERROR: 'Thông tin báo cáo chưa hợp lệ. Vui lòng kiểm tra lại.',
});
