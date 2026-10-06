import { CHILD_GENDERS, PERSONALITY_TRAITS } from '../../child/constants/childConstants';

// Personality chips must use the exact values stored on child profiles
export const PERSONALITY_FILTER_OPTIONS = PERSONALITY_TRAITS.map((trait) => ({ id: trait, label: trait }));

// Filter modal slider bounds (same limits as the backend parent preferences / discovery query)
export const DISTANCE_RANGE_KM = Object.freeze({ MIN: 1, MAX: 100 });
export const AGE_RANGE_YEARS = Object.freeze({ MIN: 0, MAX: 18 });

/**
 * Drag feedback for the top card: framer-motion only drives the opacity of overlays whose
 * colors are Tailwind classes (see DiscoveryCard). Inputs are horizontal drag offsets (px).
 */
export const SWIPE_FEEDBACK = Object.freeze({
  PASS_TINT: { INPUT: [-120, -20, 0], OUTPUT: [1, 0.35, 0] },
  LIKE_TINT: { INPUT: [0, 20, 120], OUTPUT: [0, 0.35, 1] },
  PASS_GLOW: { INPUT: [-150, -30, 0], OUTPUT: [1, 0.4, 0] },
  LIKE_GLOW: { INPUT: [0, 30, 150], OUTPUT: [0, 0.4, 1] },
});

export const GENDER_LABELS = Object.freeze({
  [CHILD_GENDERS.BOY]: 'Bé Trai',
  [CHILD_GENDERS.GIRL]: 'Bé Gái',
  [CHILD_GENDERS.OTHER]: 'Khác',
});

export const DEFAULT_CHILD_AVATARS = Object.freeze({
  [CHILD_GENDERS.GIRL]: '/avatars/default_girl.jpg',
  DEFAULT: '/avatars/default_boy.jpg',
});

// Parent preference values (backend enums) -> Vietnamese labels
export const LOCATION_LABELS = Object.freeze({
  park: 'Công viên',
  kids_cafe: 'Quán cà phê trẻ em',
  mall: 'Trung tâm thương mại',
  indoor: 'Trong nhà',
  outdoor: 'Ngoài trời',
  home: 'Nhà riêng',
  library: 'Thư viện',
  museum: 'Bảo tàng',
  sports_center: 'Khu thể thao',
  pool: 'Hồ bơi',
});

export const DAY_LABELS = Object.freeze({
  weekday: 'Ngày thường',
  weekend: 'Cuối tuần',
});

export const TIME_LABELS = Object.freeze({
  morning: 'Buổi sáng',
  afternoon: 'Buổi chiều',
  evening: 'Buổi tối',
});

/**
 * Fallback filters when the parent has no saved preferences
 * (mirror of the backend preference defaults: 15 km, 1-12 years).
 * Normally the default filters come from the parent's preferences (see discoverySlice).
 */
export const DEFAULT_DISCOVERY_FILTERS = Object.freeze({
  maxDistance: 15,
  minAge: 1,
  maxAge: 12,
  personalities: [],
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
 * Codes returned by the endpoints the discovery module calls: GET /discovery, POST /discovery/swipe
 * (discovery.service, connection.service, subscription quota) and GET /children/:id/public-profile
 * (child.service). Shared middleware codes are in constants/error.constants.js.
 */
export const DISCOVERY_ERROR_MESSAGES = Object.freeze({
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh.',
  LOCATION_REQUIRED: 'Vui lòng cập nhật địa chỉ trong hồ sơ để tìm bạn chơi quanh bạn.',
  CHILD_NOT_FOUND: 'Hồ sơ của bé này không còn tồn tại.',
  SELF_SWIPE_NOT_ALLOWED: 'Bạn không thể tương tác với hồ sơ của bé nhà mình.',
  [DISCOVERY_ERROR_CODES.DUPLICATE_SWIPE]: 'Bạn đã phản hồi hồ sơ này rồi.',
  INVALID_QUOTA_ACTION: 'Không thể kiểm tra hạn mức sử dụng. Vui lòng thử lại sau.',
  BLOCKED_INTERACTION: 'Bạn không thể tương tác với hồ sơ này.',
  // Like = connection request (connection.service)
  CONNECTION_NOT_ALLOWED: 'Phụ huynh này hiện không nhận lời mời kết nối.',
  TARGET_PARENT_NOT_FOUND: 'Không tìm thấy phụ huynh của bé này.',
  SELF_CONNECTION_NOT_ALLOWED: 'Bạn không thể tự kết nối với chính mình.',
  [DISCOVERY_ERROR_CODES.QUOTA_EXCEEDED]: 'Bạn đã dùng hết lượt khám phá hôm nay. Nâng cấp Premium để không giới hạn!',
});
