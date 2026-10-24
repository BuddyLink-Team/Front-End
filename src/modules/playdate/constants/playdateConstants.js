/**
 * Playdate Constants & Tab Definitions
 * Styled according to Stitch Playdates Reference Layout
 */

export const PLAYDATE_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'upcoming', label: 'Sắp tới' },
  { id: 'completed', label: 'Lịch sử đã chơi' },
  { id: 'pending', label: 'Chờ phản hồi' },
  { id: 'cancelled', label: 'Đã hủy' },
];

export const PLAYDATE_VIEW_MODES = {
  LIST: 'list',
  CALENDAR: 'calendar',
};

export const PLAYDATE_STATUS_KEYS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Display status -> label + calendar dot (Design System tokens); badges use the shared StatusChip
export const PLAYDATE_STATUS_META = {
  pending: { label: 'Chờ phản hồi', dotClass: 'bg-tertiary' },
  confirmed: { label: 'Đã xác nhận', dotClass: 'bg-primary' },
  completed: { label: 'Đã hoàn thành', dotClass: 'bg-secondary' },
  cancelled: { label: 'Đã hủy', dotClass: 'bg-outline-variant' },
};

export const RESCHEDULE_STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  CANCELLED: 'cancelled',
});

export const PLAYDATE_ERROR_CODES = Object.freeze({
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  SCHEDULE_CONFLICT: 'SCHEDULE_CONFLICT',
});

/** Warnings returned with a playdate or a playmate (never block the action) */
export const PLAYDATE_WARNING_CODES = Object.freeze({
  AGE_GAP: 'AGE_GAP',
  SCHEDULE_CONFLICT: 'SCHEDULE_CONFLICT',
});

/** Playdate length (BE PLAYDATE_RULES: 30 - 480 minutes, default 120) */
export const DEFAULT_PLAYDATE_DURATION = 120;
const DURATION_PRESETS = [30, 60, 90, 120, 150, 180, 240];

/**
 * "30 phút", "1 giờ", "1,5 giờ", "45 phút"
 * @param {number} minutes
 */
export const formatDurationLabel = (minutes) => {
  if (minutes % 60 === 0) return `${minutes / 60} giờ`;
  if (minutes > 60 && minutes % 30 === 0) return `${Math.floor(minutes / 60)},5 giờ`;
  return `${minutes} phút`;
};

/**
 * Duration select options; a value outside the presets (e.g. an older playdate) stays selectable
 * @param {number} [current]
 * @returns {Array<{ value: string, label: string }>}
 */
export const getDurationOptions = (current) =>
  [...new Set([...DURATION_PRESETS, ...(current ? [Number(current)] : [])])]
    .sort((a, b) => a - b)
    .map((minutes) => ({ value: String(minutes), label: formatDurationLabel(minutes) }));

/** Planning suggestions reload this long after the selected children change */
export const SUGGESTION_DEBOUNCE_MS = 400;

/** PLACE_TYPES of the places module (Back-End) -> label */
export const PLACE_TYPE_LABELS = Object.freeze({
  park: 'Công viên',
  kids_cafe: 'Kids Cafe',
  playground: 'Khu vui chơi',
  library: 'Thư viện',
  sports_center: 'Thể thao',
  workshop: 'Workshop',
});

/** Suggested time slot -> label of its part of the day */
export const TIME_SLOT_LABELS = Object.freeze({
  morning: 'Buổi sáng',
  afternoon: 'Buổi chiều',
  evening: 'Buổi tối',
});

/**
 * Codes returned by the /playdates and /places endpoints (playdate.service, subscription quota);
 * shared middleware codes are in constants/error.constants.js.
 */
export const PLAYDATE_ERROR_MAP = Object.freeze({
  PARENT_NOT_FOUND: 'Không tìm thấy thông tin phụ huynh.',
  PLAYDATE_NOT_FOUND: 'Không tìm thấy thông tin buổi hẹn chơi.',
  PLAYDATE_ID_REQUIRED: 'Thiếu mã buổi hẹn chơi.',
  FORBIDDEN_VIEW_PLAYDATE: 'Bạn không có quyền xem buổi hẹn này.',
  FORBIDDEN_COMPLETE_PLAYDATE:
    'Chỉ người tổ chức mới có quyền hoàn thành buổi hẹn này.',
  FORBIDDEN_CANCEL_PLAYDATE: 'Chỉ người tổ chức mới có quyền hủy buổi hẹn này.',
  FORBIDDEN_RESCHEDULE: 'Chỉ người tổ chức mới có quyền đề xuất đổi lịch.',
  INVALID_PLAYDATE_STATUS: 'Trạng thái buổi hẹn không hợp lệ để thao tác.',
  INVALID_PLAYDATE_STATUS_FOR_RESCHEDULE:
    'Chỉ có thể đổi lịch các buổi hẹn sắp diễn ra.',
  INVALID_HOST_CHILD: 'Bé được chọn không thuộc hồ sơ của bạn.',
  INVALID_PARTICIPANT_CHILD: 'Bé được mời không thuộc phụ huynh đã chọn.',
  CANNOT_INVITE_SELF: 'Bạn không thể tự mời chính mình.',
  NOT_CONNECTED_FRIEND:
    'Chỉ có thể mời các phụ huynh đã có trong danh sách bạn bè kết nối.',
  BLOCKED_INTERACTION:
    'Không thể mời phụ huynh mà bạn đã chặn hoặc đã chặn bạn.',
  PLAYDATE_IN_PAST: 'Thời gian buổi hẹn phải ở tương lai.',
  CANNOT_COMPLETE_YET: 'Chỉ có thể hoàn thành buổi hẹn khi đã đến giờ hẹn.',
  ALREADY_COMPLETED: 'Buổi hẹn này đã được hoàn thành.',
  ALREADY_CANCELLED: 'Buổi hẹn chơi này đã được hủy trước đó.',
  NOT_INVITED: 'Bạn không có trong danh sách được mời của buổi hẹn này.',
  ALREADY_RESPONDED: 'Bạn đã phản hồi lời mời tham gia này rồi.',
  CANNOT_RESPOND_CANCELLED: 'Không thể phản hồi buổi hẹn đã bị hủy.',
  CANNOT_RESPOND_COMPLETED: 'Không thể phản hồi buổi hẹn đã hoàn thành.',
  HOST_CANNOT_RSVP: 'Người tổ chức không cần phản hồi lời mời của chính mình.',
  INVALID_RESCHEDULE_LOCATION: 'Địa điểm mới cần có cả tên và địa chỉ.',
  RESCHEDULE_IN_PAST: 'Lịch hẹn mới phải ở tương lai.',
  RESCHEDULE_NO_CHANGE: 'Lịch đề xuất đang trùng với lịch hiện tại.',
  RESCHEDULE_NOT_FOUND: 'Không tìm thấy đề xuất đổi lịch đang chờ phản hồi.',
  NOT_AUTHORIZED_TO_VOTE:
    'Bạn không có quyền bỏ phiếu cho đề xuất đổi lịch này.',
  ALREADY_VOTED: 'Bạn đã bỏ phiếu hoặc đề xuất đổi lịch này đã kết thúc.',
  PARENT_LOCATION_REQUIRED: 'Hãy cập nhật vị trí trong hồ sơ để xem địa điểm gần bạn, hoặc tìm theo tên.',
  PLACE_NOT_FOUND: 'Không tìm thấy thông tin địa điểm.',
  CHILD_NOT_FOUND: 'Không tìm thấy hồ sơ bé.',
  LOCATION_REQUIRED: 'Hãy cập nhật vị trí trong hồ sơ để nhận gợi ý địa điểm.',
  INVALID_DATE_RANGE: 'Khoảng ngày gợi ý tối đa 14 ngày.',
  [PLAYDATE_ERROR_CODES.SCHEDULE_CONFLICT]:
    'Bé đã có một buổi hẹn khác trùng giờ này. Hãy chọn thời gian khác.',
  [PLAYDATE_ERROR_CODES.QUOTA_EXCEEDED]:
    'Bạn đã đạt giới hạn của gói hiện tại. Nâng cấp Premium để không giới hạn!',
});

// List view: playdates per page (GET /playdates?page=&limit=)
export const PLAYDATE_PAGE_SIZE = 10;
// Calendar view: every playdate of the displayed month is loaded at once (backend max limit)
export const PLAYDATE_CALENDAR_LIMIT = 100;
