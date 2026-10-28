export const RATING_ERROR_CODES = Object.freeze({
  RATING_ALREADY_EXISTS: 'RATING_ALREADY_EXISTS',
});

/**
 * Backend error codes -> user-facing Vietnamese strings (getApiErrorMsg)
 */
export const RATING_FEEDBACK_ERROR_MESSAGES = Object.freeze({
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh. Vui lòng thiết lập hồ sơ trước.',
  PLAYDATE_NOT_FOUND: 'Không tìm thấy buổi hẹn chơi này.',
  FORBIDDEN_VIEW_PLAYDATE: 'Bạn không có quyền xem buổi hẹn này.',
  RATING_FORBIDDEN: 'Chỉ phụ huynh đã tham gia buổi hẹn mới có thể đánh giá.',
  PLAYDATE_NOT_COMPLETED: 'Chỉ có thể đánh giá sau khi buổi hẹn đã hoàn thành.',
  [RATING_ERROR_CODES.RATING_ALREADY_EXISTS]: 'Bạn đã đánh giá buổi hẹn này rồi.',
  VALIDATION_ERROR: 'Đánh giá chưa hợp lệ. Vui lòng kiểm tra lại số sao và nội dung.',
});
