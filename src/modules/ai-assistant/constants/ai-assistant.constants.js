import { Compass, Calendar, MapPin, Shapes } from 'lucide-react';

// Tool UI Cards of an assistant reply (BE: AI_CARD_TYPES)
export const AI_CARD_TYPES = Object.freeze({
  CHOICES: 'choices',
  PLACE_SUGGESTIONS: 'place_suggestions',
  MATCH_SUGGESTIONS: 'match_suggestions',
  PLAYDATE_DRAFT: 'playdate_draft',
  QUOTA_NOTICE: 'quota_notice',
});

export const AI_STEPS = Object.freeze({
  MATCH_CRITERIA: 'match_criteria',
  CONNECT: 'connect',
  CHILD: 'child',
  TIME: 'time',
  PLAYMATES: 'playmates',
  ACTIVITY: 'activity',
  PLACE: 'place',
  AGENDA: 'agenda',
  EXTRA: 'extra',
  // The summary card: its button creates the playdate
  CONFIRM: 'confirm',
});

// Steps of a playdate plan: their cards are locked once the plan is closed (created or replaced)
export const AI_PLAN_STEPS = Object.freeze([
  AI_STEPS.CHILD,
  AI_STEPS.PLAYMATES,
  AI_STEPS.TIME,
  AI_STEPS.ACTIVITY,
  AI_STEPS.PLACE,
  AI_STEPS.AGENDA,
  AI_STEPS.EXTRA,
  AI_STEPS.CONFIRM,
]);

export const AI_CHOICE_STATUS = Object.freeze({
  OPEN: 'open',
  ANSWERED: 'answered',
});

export const AI_OPTION_IDS = Object.freeze({
  SKIP: '__skip',
  EXTRA_NONE: 'extra:none',
  CREATE_PLAYDATE: 'confirm:create',
});

// Parts of the app the assistant writes as [[name]] in its replies, shown as links (BE: AI_APP_SECTIONS)
export const AI_APP_SECTIONS = Object.freeze({
  'Hẹn chơi': '/playdates',
  'Khám phá': '/discovery',
  'Kết nối': '/connections',
  'Tin nhắn': '/chat',
  'Thành tích': '/gamification',
  'Hồ sơ cá nhân': '/profile',
  'Quản lý hồ sơ bé': '/children',
  'Gói hội viên & Hạn mức': '/subscription',
});

export const AI_LINK_KINDS = Object.freeze({
  CHILD_PROFILE: 'child_profile',
  OSM: 'osm',
  GOOGLE_MAPS: 'google_maps',
});

export const AI_LINK_LABELS = Object.freeze({
  [AI_LINK_KINDS.CHILD_PROFILE]: 'Xem hồ sơ',
  [AI_LINK_KINDS.OSM]: 'OpenStreetMap',
  [AI_LINK_KINDS.GOOGLE_MAPS]: 'Google Maps',
});

export const AI_MESSAGE_STATUS = Object.freeze({
  SENT: 'sent',
  PENDING: 'pending',
  FAILED: 'failed',
});

export const AI_LIMITS = Object.freeze({
  MAX_MESSAGE_LENGTH: 2000,
  // The counter is shown when this close to the limit
  COUNTER_THRESHOLD: 200,
  SESSIONS_PAGE_SIZE: 20,
  // A session close to its message cap shows a warning
  SESSION_NEAR_FULL: 5,
  MAX_AGENDA_ITEMS: 5,
  AGENDA_ITEM_MAX_LENGTH: 80,
  // A real attraction of the place keeps its source link ("Theo thông tin trên mạng về …", BE same limit)
  SOURCED_AGENDA_ITEM_MAX_LENGTH: 400,
  // An AI turn can call the model several times (tool rounds)
  REQUEST_TIMEOUT_MS: 90000,
  // Friend families loaded once by the playmate search of a card, then filtered on the device
  FRIENDS_FETCH_LIMIT: 100,
});

// Labels of the "Đã dùng: …" chip above a reply (BE tool names)
export const TOOL_LABELS = Object.freeze({
  getMyChildren: 'Hồ sơ bé',
  findMatches: 'Bạn chơi phù hợp',
  findNearbyPlaces: 'Địa điểm gần nhà',
  suggestTimeSlots: 'Lịch rảnh',
  findAvailablePlaymates: 'Bạn đang rảnh',
  suggestActivities: 'Hoạt động',
  suggestPlaces: 'Địa điểm',
  proposePlaydate: 'Kế hoạch hẹn chơi',
  sendConnectionRequests: 'Lời mời kết bạn',
  listMyPlaydates: 'Xem lịch hẹn',
  reschedulePlaydate: 'Dời lịch hẹn',
  cancelPlaydate: 'Hủy lịch hẹn',
  respondInvitation: 'Phản hồi lời mời',
});

// Accents of the starters and Tool UI Cards, same pastel badges as the rest of the web (DESIGN.md palette roles):
// primary = core / places, secondary = informative / calendar, tertiary = activities / play invitations.
// tile: round icon badge · chip: small label · hover: interactive card hover
export const AI_TONES = Object.freeze({
  primary: Object.freeze({
    tile: 'bg-primary-soft text-primary-dark',
    chip: 'border border-primary-border bg-primary-soft text-primary-ink',
    hover: 'hover:border-primary-border hover:bg-primary-bubble-soft',
  }),
  secondary: Object.freeze({
    tile: 'bg-secondary-soft text-secondary-dark',
    chip: 'border border-secondary-border bg-secondary-soft text-secondary-dark',
    hover: 'hover:border-secondary-border hover:bg-secondary-soft',
  }),
  tertiary: Object.freeze({
    tile: 'bg-tertiary-soft text-tertiary-dark',
    chip: 'border border-tertiary-border bg-tertiary-soft text-tertiary-dark',
    hover: 'hover:border-tertiary-border hover:bg-tertiary-soft',
  }),
});
// Rotating accents of numbered lists (agenda)
export const AI_TONE_CYCLE = Object.freeze([AI_TONES.primary, AI_TONES.secondary, AI_TONES.tertiary]);
export const AI_CARD_TONES = Object.freeze({
  [AI_CARD_TYPES.PLACE_SUGGESTIONS]: AI_TONES.primary,
  [AI_CARD_TYPES.MATCH_SUGGESTIONS]: AI_TONES.secondary,
  [AI_CARD_TYPES.PLAYDATE_DRAFT]: AI_TONES.tertiary,
  [AI_CARD_TYPES.QUOTA_NOTICE]: AI_TONES.tertiary,
});
// Each step of a plan has its own color, so the steps read apart in a long conversation
export const AI_STEP_TONES = Object.freeze({
  [AI_STEPS.MATCH_CRITERIA]: AI_TONES.secondary,
  [AI_STEPS.CONNECT]: AI_TONES.primary,
  [AI_STEPS.CHILD]: AI_TONES.primary,
  [AI_STEPS.TIME]: AI_TONES.secondary,
  [AI_STEPS.PLAYMATES]: AI_TONES.tertiary,
  [AI_STEPS.ACTIVITY]: AI_TONES.tertiary,
  [AI_STEPS.PLACE]: AI_TONES.primary,
  [AI_STEPS.AGENDA]: AI_TONES.tertiary,
  [AI_STEPS.EXTRA]: AI_TONES.secondary,
});

// Starters shown in an empty conversation (Stitch "Chủ đề gợi ý nhanh")
export const QUICK_PROMPTS = Object.freeze([
  { key: 'playmates', icon: Compass, tone: AI_TONES.primary, label: 'Tìm bạn chơi cho bé', prompt: 'Tìm bạn chơi phù hợp cho bé nhà mình' },
  { key: 'plan', icon: Calendar, tone: AI_TONES.primary, label: 'Lên kế hoạch playdate', prompt: 'Lên kế hoạch hẹn chơi cho bé' },
  { key: 'places', icon: MapPin, tone: AI_TONES.secondary, label: 'Địa điểm vui chơi gần nhà', prompt: 'Gợi ý địa điểm vui chơi cho bé gần nhà mình' },
  { key: 'indoor', icon: Shapes, tone: AI_TONES.tertiary, label: 'Hoạt động trong nhà cho bé', prompt: 'Gợi ý vài hoạt động trong nhà phù hợp với bé' },
]);

// Session list groups (Stitch "Lịch sử trò chuyện")
export const SESSION_GROUPS = Object.freeze({
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last7Days',
  OLDER: 'older',
});
export const SESSION_GROUP_LABELS = Object.freeze({
  [SESSION_GROUPS.TODAY]: 'Hôm nay',
  [SESSION_GROUPS.YESTERDAY]: 'Hôm qua',
  [SESSION_GROUPS.LAST_7_DAYS]: '7 ngày trước',
  [SESSION_GROUPS.OLDER]: 'Cũ hơn',
});

export const AI_WARNING_SEVERITY = Object.freeze({
  BLOCK: 'block',
  WARN: 'warn',
  INFO: 'info',
});

// Warning codes the cards act on (the others are only shown, DRAFT_WARNING_TEXT)
export const AI_DRAFT_WARNING_CODES = Object.freeze({
  SAFETY_HIGH_RISK: 'SAFETY_HIGH_RISK',
});

export const DRAFT_WARNING_TEXT = Object.freeze({
  // Time
  NAP_TIME: 'Trùng giờ ngủ trưa của bé (12:00 - 14:00)',
  SCHOOL_HOURS: 'Trùng giờ học của các bé',
  PAST_DATE: 'Thời gian đã qua, hãy chọn lại',
  UNUSUAL_HOUR: 'Giờ hẹn khá sớm hoặc khá muộn với các bé',
  SHORT_NOTICE: 'Hẹn gấp dưới 4 tiếng, bạn chơi có thể chưa kịp chuẩn bị',
  HOLIDAY: 'Ngày lễ lớn, địa điểm có thể rất đông',
  // Place
  PLACE_CLOSED: 'Địa điểm đóng cửa vào thời gian này',
  PLACE_CLOSES_EARLY: 'Địa điểm đóng cửa sớm hơn giờ kết thúc hẹn',
  HOURS_UNKNOWN: 'Chưa có thông tin giờ mở cửa chính xác',
  OUTDOOR_AFTER_DARK: 'Khu vực ngoài trời sau 18:00 có thể thiếu sáng',
  PLACE_AGE: 'Độ tuổi chưa thật sự phù hợp với quy định địa điểm',
  ACTIVITY_PLACE_MISMATCH: 'Hoạt động có thể không khớp với loại hình địa điểm',
  FAR_PLACE: 'Địa điểm khá xa nhà một gia đình (> 15 km)',
  // Agenda
  AGENDA_OVER_TIME: 'Tổng thời lượng các trò chơi vượt quá thời gian buổi hẹn',
  ITEM_AGE: 'Có trò chơi trong lịch trình chưa phù hợp độ tuổi bé',
  ITEM_NOT_AT_PLACE: 'Hoạt động không phù hợp với loại hình địa điểm đã chọn',
  AGENDA_TOO_LONG: 'Số lượng hoạt động quá nhiều so với thời lượng',
  AGENDA_TOO_THIN: 'Thời lượng dài nhưng ít hoạt động',
  AGENDA_AGE_MISMATCH: 'Một số hoạt động có thể chưa phù hợp với lứa tuổi bé',
  TOO_LONG_FOR_AGE: 'Thời lượng buổi chơi khá dài so với độ tuổi bé',
  MEAL_TIME: 'Trùng vào khung giờ ăn uống, nhớ chuẩn bị đồ ăn nhẹ cho bé',
  // Safety
  SAFETY_HIGH_RISK: 'Hoạt động tiềm ẩn rủi ro cao, cần sự giám sát đặc biệt',
  INSUFFICIENT_ADULTS: 'Chưa đủ tỷ lệ người lớn đi kèm an toàn',
  // Participants
  AGE_GAP: 'Các bé chênh lệch tuổi khá nhiều (> 3 tuổi)',
  GROUP_TOO_LARGE: 'Nhóm khá đông (> 6 bé), cần nhiều người lớn hỗ trợ',
  INVITEE_NOT_FRIEND: 'Có bạn chưa kết nối nên không thể mời',
  SCHEDULE_CONFLICT: 'Có bé đã có lịch hẹn khác trùng giờ này',
  INVITEE_BUSY: 'Có bạn bị trùng lịch bận',
  NOT_PREFERRED_TIME: 'Giờ này chưa hợp lịch ưu tiên của mọi gia đình',
  NO_SHARED_INTEREST: 'Các bé chưa có sở thích chung nào được lưu',
  // Weather
  BAD_WEATHER: 'Dự báo thời tiết có thể có mưa hoặc bão',
});

export const WARNING_SEVERITY_STYLES = Object.freeze({
  [AI_WARNING_SEVERITY.BLOCK]: {
    card: 'bg-error-soft/30 border-error-container text-error-dark',
    iconColor: 'text-error',
    badge: 'bg-error-soft text-error-dark border-error-container',
    label: 'Cần xử lý',
  },
  [AI_WARNING_SEVERITY.WARN]: {
    card: 'bg-tertiary-soft border-tertiary-border text-tertiary-dark',
    iconColor: 'text-tertiary-dark',
    badge: 'bg-tertiary-soft text-tertiary-dark border-tertiary-border',
    label: 'Lưu ý',
  },
  [AI_WARNING_SEVERITY.INFO]: {
    card: 'bg-secondary-soft border-secondary-border text-secondary-dark',
    iconColor: 'text-secondary-dark',
    badge: 'bg-secondary-soft text-secondary-dark border-secondary-border',
    label: 'Thông tin',
  },
});

export const AI_ERROR_CODES = Object.freeze({
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  AI_SESSION_FULL: 'AI_SESSION_FULL',
  AI_SESSION_BUSY: 'AI_SESSION_BUSY',
  AI_SESSION_NOT_FOUND: 'AI_SESSION_NOT_FOUND',
  AI_INVALID_CHOICE: 'AI_INVALID_CHOICE',
  AI_RATE_LIMITED: 'AI_RATE_LIMITED',
  AI_UNAVAILABLE: 'AI_UNAVAILABLE',
  AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',
  SAFETY_ACKNOWLEDGE_REQUIRED: 'SAFETY_ACKNOWLEDGE_REQUIRED',
  AI_PLAN_BLOCKED: 'AI_PLAN_BLOCKED',
  // Shared code (COMMON_ERROR_MESSAGES): the AI stream could not refresh the session
  ACCESS_TOKEN_EXPIRED: 'ACCESS_TOKEN_EXPIRED',
});

export const AI_ERROR_MESSAGES = Object.freeze({
  [AI_ERROR_CODES.QUOTA_EXCEEDED]: 'Bạn đã dùng hết lượt trò chuyện với Trợ lý AI tháng này.',
  [AI_ERROR_CODES.AI_SESSION_FULL]: 'Cuộc trò chuyện này đã đầy. Hãy mở cuộc trò chuyện mới nhé.',
  [AI_ERROR_CODES.AI_SESSION_BUSY]: 'Trợ lý đang trả lời tin trước, bạn chờ một chút nhé.',
  [AI_ERROR_CODES.AI_SESSION_NOT_FOUND]: 'Không tìm thấy cuộc trò chuyện này.',
  [AI_ERROR_CODES.AI_INVALID_CHOICE]: 'Lựa chọn này không còn dùng được. Bạn hãy chọn lại nhé.',
  [AI_ERROR_CODES.AI_RATE_LIMITED]: 'Trợ lý AI đang bận, bạn thử lại sau ít phút nhé.',
  [AI_ERROR_CODES.AI_UNAVAILABLE]: 'Trợ lý AI chưa sẵn sàng. Bạn thử lại sau nhé.',
  [AI_ERROR_CODES.AI_PROVIDER_ERROR]: 'Trợ lý AI tạm thời gặp sự cố. Bạn thử lại nhé.',
  [AI_ERROR_CODES.AI_PLAN_BLOCKED]: 'Kế hoạch còn cảnh báo cần xử lý (ví dụ địa điểm đóng cửa hoặc giờ đã qua). Bạn đổi lại rồi xác nhận nhé.',
  [AI_ERROR_CODES.SAFETY_ACKNOWLEDGE_REQUIRED]:
    'Vui lòng xác nhận đã đọc và cam kết tuân thủ các lưu ý an toàn cho các bé trước khi tạo lịch hẹn.',
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh. Vui lòng thiết lập hồ sơ trước.',
});

// Errors after which sending the same message again cannot work
export const AI_NON_RETRYABLE_ERRORS = Object.freeze([
  AI_ERROR_CODES.QUOTA_EXCEEDED,
  AI_ERROR_CODES.AI_SESSION_FULL,
  AI_ERROR_CODES.AI_SESSION_NOT_FOUND,
  AI_ERROR_CODES.AI_INVALID_CHOICE,
]);

export const AI_DISCLAIMER = 'Trợ lý AI có thể nhầm. Hãy kiểm tra lại trước khi xác nhận lịch hẹn.';

// Reminder message next to the floating chat bubble
export const AI_FAB_REMINDER = Object.freeze({
  TITLE: 'Hỏi BuddyLink AI',
  TEXT: 'Cần tìm bạn chơi hay lên lịch hẹn cho bé? Nhắn mình nhé!',
  DELAY_MS: 1200,
  // sessionStorage: dismissed until the browser tab is closed
  STORAGE_KEY: 'buddylink_ai_fab_reminder_dismissed',
});
export const AI_ROUTE = '/ai-assistant';
// ?session=<id> keeps the open conversation on refresh / deep links
export const AI_SESSION_PARAM = 'session';
