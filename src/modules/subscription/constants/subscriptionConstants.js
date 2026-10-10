/**
 * Constants for the Subscription & PayOS Checkout module.
 */

export const PLAN_CODES = Object.freeze({
  FREE: 'free',
  PREMIUM_MONTHLY: 'premium_monthly',
  PREMIUM_YEARLY: 'premium_yearly',
});

export const BILLING_CYCLES = Object.freeze({
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
});

export const PAYMENT_STATUS = Object.freeze({
  CREATING: 'creating',
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
});

// Payment status -> shared StatusChip variant + label (components/badges/StatusChip.jsx)
export const PAYMENT_STATUS_CHIPS = Object.freeze({
  [PAYMENT_STATUS.SUCCESS]: { variant: 'confirmed', label: 'Thành công' },
  [PAYMENT_STATUS.PENDING]: { variant: 'pending', label: 'Chờ thanh toán' },
  [PAYMENT_STATUS.CREATING]: { variant: 'pending', label: 'Đang tạo' },
  [PAYMENT_STATUS.FAILED]: { variant: 'reported', label: 'Thất bại' },
  [PAYMENT_STATUS.CANCELLED]: { variant: 'cancelled', label: 'Đã hủy' },
  [PAYMENT_STATUS.EXPIRED]: { variant: 'cancelled', label: 'Đã hết hạn' },
});

// Quota features sent by the backend in error.details.feature of QUOTA_EXCEEDED
export const QUOTA_FEATURES = Object.freeze({
  CHILD_PROFILES: 'child_profiles',
  DISCOVERY_SWIPES: 'discovery_swipes',
  CONNECTION_REQUESTS: 'connection_requests',
  PLAYDATES_CREATED: 'playdates_created',
  PLAYDATES_PARTICIPATED: 'playdates_participated',
  AI_ASSISTANT: 'ai_assistant',
  GENERAL: 'general',
});

// Paywall title / message per quota feature (limits come from the plan, so no numbers here)
export const QUOTA_MESSAGES = Object.freeze({
  [QUOTA_FEATURES.CHILD_PROFILES]: {
    title: 'Đã đạt giới hạn hồ sơ bé',
    message: 'Gói Miễn phí đã dùng hết số hồ sơ bé. Nâng cấp Premium để quản lý không giới hạn hồ sơ bé cho cả gia đình!',
  },
  [QUOTA_FEATURES.DISCOVERY_SWIPES]: {
    title: 'Đã hết lượt khám phá hôm nay',
    message: 'Bạn đã dùng hết lượt khám phá bạn chơi hôm nay. Nâng cấp Premium để khám phá không giới hạn mỗi ngày!',
  },
  [QUOTA_FEATURES.CONNECTION_REQUESTS]: {
    title: 'Đã hết lượt gửi kết nối tháng này',
    message: 'Bạn đã dùng hết lượt gửi lời mời kết nối trong tháng. Nâng cấp Premium để kết nối không giới hạn!',
  },
  [QUOTA_FEATURES.PLAYDATES_CREATED]: {
    title: 'Đã đạt giới hạn tạo Playdate tháng này',
    message: 'Bạn đã dùng hết lượt tạo cuộc hẹn chơi trong tháng. Nâng cấp Premium để tổ chức cuộc hẹn không giới hạn!',
  },
  [QUOTA_FEATURES.PLAYDATES_PARTICIPATED]: {
    title: 'Đã đạt giới hạn tham gia Playdate tháng này',
    message: 'Bạn đã dùng hết lượt tham gia cuộc hẹn chơi trong tháng. Nâng cấp Premium để tham gia không giới hạn!',
  },
  [QUOTA_FEATURES.AI_ASSISTANT]: {
    title: 'Đã hết lượt hỏi Trợ lý AI tháng này',
    message: 'Bạn đã dùng hết lượt hỏi Trợ lý AI trong tháng. Nâng cấp Premium để hỏi không giới hạn!',
  },
  [QUOTA_FEATURES.GENERAL]: {
    title: 'Đã chạm hạn mức gói Miễn phí',
    message: 'Bạn đã chạm hạn mức của gói Miễn phí. Nâng cấp Premium để mở khóa toàn bộ tính năng không giới hạn!',
  },
});

// Plan limits shown on the pricing page: plan.features[featureKey] from GET /subscriptions/plans
// (-1 = unlimited). freeDefault is only used while the plans are not loaded (PROJECT_OVERVIEW 14.1).
export const PLAN_FEATURE_ROWS = Object.freeze([
  { key: QUOTA_FEATURES.CHILD_PROFILES, featureKey: 'childProfilesLimit', name: 'Số lượng hồ sơ bé', unit: 'hồ sơ bé', period: null, freeDefault: 1 },
  { key: QUOTA_FEATURES.DISCOVERY_SWIPES, featureKey: 'discoveryViewLimitPerDay', name: 'Khám phá bạn chơi', unit: 'hồ sơ', period: 'ngày', freeDefault: 5 },
  { key: QUOTA_FEATURES.CONNECTION_REQUESTS, featureKey: 'connectionRequestsLimitPerMonth', name: 'Gửi lời mời kết nối', unit: 'lời mời', period: 'tháng', freeDefault: 5 },
  { key: QUOTA_FEATURES.PLAYDATES_CREATED, featureKey: 'playdatesLimitPerMonth', name: 'Tạo cuộc hẹn Playdate', unit: 'cuộc hẹn', period: 'tháng', freeDefault: 3 },
  { key: QUOTA_FEATURES.PLAYDATES_PARTICIPATED, featureKey: 'playdateParticipationLimitPerMonth', name: 'Tham gia cuộc hẹn Playdate', unit: 'cuộc hẹn', period: 'tháng', freeDefault: 3 },
  { key: QUOTA_FEATURES.AI_ASSISTANT, featureKey: 'aiAssistantLimitPerMonth', name: 'Hỏi Trợ lý AI', unit: 'lượt', period: 'tháng', freeDefault: 5 },
]);

export const UNLIMITED_LABEL = 'Không giới hạn';

/**
 * Codes returned by the /subscriptions endpoints (the backend English message is never shown).
 * CHILD_QUOTA_EXCEEDED / QUOTA_EXCEEDED open the PaywallModal instead (services/apiClient.js).
 */
export const SUBSCRIPTION_ERROR_MESSAGES = Object.freeze({
  INVALID_PLAN: 'Gói dịch vụ không hợp lệ. Vui lòng chọn lại gói cước.',
  PLAN_NOT_AVAILABLE: 'Gói dịch vụ không tồn tại hoặc đã ngừng mở bán.',
  IDEMPOTENCY_CONFLICT: 'Đơn thanh toán này đã được dùng cho gói khác. Vui lòng tạo đơn mới.',
  ORDER_CREATION_FAILED: 'Không thể khởi tạo mã đơn hàng. Vui lòng thử lại.',
  PAYMENT_NOT_FOUND: 'Không tìm thấy đơn thanh toán.',
  PAYMENT_GATEWAY_ERROR: 'Cổng thanh toán PayOS đang gặp sự cố. Vui lòng thử lại sau.',
  PAYMENT_LINK_NOT_FOUND: 'Không tìm thấy liên kết thanh toán trên PayOS.',
  PAYMENT_SERVICE_UNAVAILABLE: 'Cổng thanh toán chưa sẵn sàng. Vui lòng thử lại sau.',
});
