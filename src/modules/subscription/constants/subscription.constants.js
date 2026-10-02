/**
 * Constants for the Subscription & PayOS Checkout module.
 */

export const PLAN_CODES = {
  FREE: 'free',
  PREMIUM_MONTHLY: 'premium_monthly',
  PREMIUM_YEARLY: 'premium_yearly',
};

export const BILLING_CYCLES = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

export const PAYMENT_STATUS = {
  CREATING: 'creating',
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

export const QUOTA_FEATURES = {
  CHILD_PROFILES: 'child_profiles',
  DISCOVERY_SWIPES: 'discovery_swipes',
  PLAYDATES_CREATED: 'playdates_created',
};

export const QUOTA_MESSAGES = {
  [QUOTA_FEATURES.CHILD_PROFILES]: {
    title: 'Đã Đạt Hạn Mức 1 Hồ Sơ Bé',
    message: 'Gói Miễn phí chỉ hỗ trợ tối đa 1 hồ sơ bé. Nâng cấp Premium để quản lý không giới hạn hồ sơ bé cho cả gia đình!',
  },
  [QUOTA_FEATURES.DISCOVERY_SWIPES]: {
    title: 'Đã Hết Lượt Quẹt Hôm Nay (5/5)',
    message: 'Bạn đã sử dụng hết 5 lượt quẹt tìm bạn hôm nay. Nâng cấp Premium để quẹt tìm bạn không giới hạn mỗi ngày!',
  },
  [QUOTA_FEATURES.PLAYDATES_CREATED]: {
    title: 'Đã Đạt Giới Hạn Playdate Tháng Này (3/3)',
    message: 'Bạn đã tạo 3 cuộc hẹn chơi trong tháng này. Nâng cấp Premium để tạo và tổ chức cuộc hẹn không giới hạn!',
  },
  general: {
    title: 'Đã Chạm Hạn Mức Gói Miễn Phí',
    message: 'Bạn đã chạm trần hạn mức của gói Miễn phí. Nâng cấp Premium ngay để mở khóa toàn bộ tính năng không giới hạn!',
  },
};

export const DEFAULT_PLAN_BENEFITS = [
  {
    key: 'child_profiles',
    name: 'Số lượng hồ sơ bé',
    freeText: '1 hồ sơ bé',
    premiumText: 'Không giới hạn',
    isUpcoming: false,
  },
  {
    key: 'discovery_swipes',
    name: 'Lượt quẹt tìm bạn',
    freeText: '5 lượt / ngày',
    premiumText: 'Không giới hạn',
    isUpcoming: true,
  },
  {
    key: 'playdates_created',
    name: 'Tạo cuộc hẹn Playdate',
    freeText: '3 cuộc hẹn / tháng',
    premiumText: 'Không giới hạn',
    isUpcoming: true,
  },
];
