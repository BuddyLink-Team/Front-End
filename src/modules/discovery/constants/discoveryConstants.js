import { CHILD_GENDERS } from '../../child/constants/childConstants';

export const GENDER_LABELS = Object.freeze({
  [CHILD_GENDERS.BOY]: 'Bé Trai',
  [CHILD_GENDERS.GIRL]: 'Bé Gái',
  [CHILD_GENDERS.OTHER]: 'Khác',
});

export const DEFAULT_CHILD_AVATARS = Object.freeze({
  [CHILD_GENDERS.GIRL]: '/avatars/default_girl.jpg',
  DEFAULT: '/avatars/default_boy.jpg',
});

export const SWIPE_DIRECTIONS = Object.freeze({
  LIKE: 'LIKE',
  PASS: 'PASS',
});

// Horizontal drag distance (px) that commits a swipe
export const SWIPE_THRESHOLD_PX = 100;

// Number of cards rendered in the stack (top card + cards peeking behind it)
export const VISIBLE_CARD_COUNT = 2;

// Mirror of the backend DISCOVERY_DEFAULTS.MAX_RESULTS_PER_REQUEST: a full page means more may exist
export const DISCOVERY_PAGE_SIZE = 20;

// -1 from the backend means unlimited (Premium plan)
export const UNLIMITED_QUOTA = -1;

export const SUBSCRIPTION_PAGE_PATH = '/subscription';

export const DISCOVERY_ERROR_CODES = Object.freeze({
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  DUPLICATE_SWIPE: 'DUPLICATE_SWIPE',
});

// Backend quota action types, sent in error.details[0].message of QUOTA_EXCEEDED
export const QUOTA_ACTION_TYPES = Object.freeze({
  DISCOVERY: 'discovery',
  CONNECTION_REQUEST: 'connectionRequest',
});

export const CONNECTION_QUOTA_EXCEEDED_MESSAGE =
  'Bạn đã dùng hết lượt gửi kết nối tháng này. Nâng cấp Premium để không giới hạn!';

export const LIKE_SUCCESS_MESSAGES = Object.freeze({
  SENT: 'Đã gửi lời mời kết nối!',
  MATCHED: 'Hai bạn đã kết nối! Bắt đầu trò chuyện nhé.',
  EXISTING: 'Bạn và phụ huynh này đã có lời mời hoặc kết nối từ trước.',
});

/**
 * Codes returned by the /discovery endpoints (discovery.service, subscription quota); shared
 * middleware codes are in constants/error.constants.js.
 */
export const DISCOVERY_ERROR_MESSAGES = Object.freeze({
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh.',
  LOCATION_REQUIRED: 'Vui lòng cập nhật địa chỉ trong hồ sơ để tìm bạn chơi quanh bạn.',
  CHILD_NOT_FOUND: 'Hồ sơ của bé này không còn tồn tại.',
  SELF_SWIPE_NOT_ALLOWED: 'Bạn không thể tương tác với hồ sơ của bé nhà mình.',
  BLOCKED_INTERACTION: 'Bạn không thể tương tác với hồ sơ này.',
  // Like = connection request (connection.service)
  CONNECTION_NOT_ALLOWED: 'Phụ huynh này hiện không nhận lời mời kết nối.',
  TARGET_PARENT_NOT_FOUND: 'Không tìm thấy phụ huynh của bé này.',
  SELF_CONNECTION_NOT_ALLOWED: 'Bạn không thể tự kết nối với chính mình.',
  [DISCOVERY_ERROR_CODES.QUOTA_EXCEEDED]: 'Bạn đã dùng hết lượt khám phá hôm nay. Nâng cấp Premium để không giới hạn!',
});
