import { CheckCircle2, EyeOff, Lock, Trash2, Crown, Users, UserCheck, Baby, Eye } from 'lucide-react';

// Cards above the admin lists (`key` = field of the stats API), one per status tab below
export const USER_STAT_CARDS = [
  { key: 'total', label: 'Tổng phụ huynh', icon: Users, variant: 'secondary' },
  { key: 'active', label: 'Đang hoạt động', icon: UserCheck, variant: 'primary' },
  { key: 'locked', label: 'Đã khóa', icon: Lock, variant: 'error' },
  { key: 'premium', label: 'Premium đang hiệu lực', icon: Crown, variant: 'tertiary' },
];

export const CHILD_STAT_CARDS = [
  { key: 'total', label: 'Tổng hồ sơ', icon: Baby, variant: 'secondary' },
  { key: 'active', label: 'Chưa xóa', icon: Eye, variant: 'primary' },
  { key: 'archived', label: 'Đã xóa', icon: Trash2, variant: 'error' },
  { key: 'planLocked', label: 'Khóa do gói Free', icon: Crown, variant: 'tertiary' },
];

/**
 * Status tabs of the admin lists, kept in the URL as `status`; `query` is what the tab sends to the API.
 * "Tất cả" (empty) is the default and sends no filter.
 */
export const USER_STATUS_CHIPS = [
  { id: '', label: 'Tất cả', value: '', query: {} },
  { id: 'active', label: 'Đang hoạt động', value: 'active', query: { isActive: 'true' } },
  { id: 'locked', label: 'Đã khóa', value: 'locked', query: { isActive: 'false' } },
  { id: 'premium', label: 'Premium đang hiệu lực', value: 'premium', query: { isPremium: 'true' } },
];

// isVerifiedParent = email and phone verified (PROJECT_OVERVIEW §13), not an identity check
export const VERIFICATION_FILTER_OPTIONS = [
  { label: 'Tất cả xác thực', value: '' },
  { label: 'Đã xác thực', value: 'true' },
  { label: 'Chưa xác thực', value: 'false' },
];

export const CHILD_STATUS_CHIPS = [
  { id: '', label: 'Tất cả', value: '', query: {} },
  { id: 'active', label: 'Chưa xóa', value: 'active', query: { isArchived: 'false' } },
  { id: 'archived', label: 'Đã xóa', value: 'archived', query: { isArchived: 'true' } },
  { id: 'plan_locked', label: 'Khóa do gói Free', value: 'plan_locked', query: { isPlanLocked: 'true' } },
];

/**
 * Turn the status tab of a list into its API query
 * @param {Array<{ value: string, query: Object }>} chips
 * @param {{ status?: string }} params - List params kept in the URL
 */
export const withStatusQuery = (chips, { status, ...params }) => ({
  ...params,
  ...(chips.find((chip) => chip.value === status)?.query || {}),
});

export const GENDER_FILTER_OPTIONS = [
  { label: 'Tất cả giới tính', value: '' },
  { label: 'Bé trai', value: 'boy' },
  { label: 'Bé gái', value: 'girl' },
  { label: 'Khác', value: 'other' },
];

export const GENDER_LABELS = Object.freeze({
  boy: 'Bé trai',
  girl: 'Bé gái',
  other: 'Khác',
});

export const AGE_RANGE_OPTIONS = [
  { label: 'Mọi độ tuổi', value: '' },
  { label: 'Dưới 1 tuổi', value: '0-0', minAge: 0, maxAge: 0 },
  { label: '1 - 3 tuổi', value: '1-3', minAge: 1, maxAge: 3 },
  { label: '4 - 6 tuổi', value: '4-6', minAge: 4, maxAge: 6 },
  { label: '7 - 9 tuổi', value: '7-9', minAge: 7, maxAge: 9 },
  { label: '10 - 12 tuổi', value: '10-12', minAge: 10, maxAge: 12 },
];

export const SUBSCRIPTION_PLAN_NAMES = {
  free: 'Gói Miễn phí',
  premium_monthly: 'Gói Premium (1 Tháng)',
  premium_yearly: 'Gói Premium (1 Năm)',
};

export const LOGIN_METHOD_LABELS = Object.freeze({
  password: 'Email & mật khẩu',
  google: 'Google',
});

// parents.privacySettings.connectionPrivacy: who may send this parent a connection request
export const CONNECTION_PRIVACY_LABELS = Object.freeze({
  everyone: 'Mọi người',
  nobody: 'Không ai',
});

// Why a child can (not) be seen in Discovery (CHILD_VISIBILITY of the API), as StatusChip props
export const CHILD_VISIBILITY_CHIPS = Object.freeze({
  visible: { status: 'active', label: 'Đang hiển thị', icon: CheckCircle2 },
  archived: { status: 'archived', label: 'Đã xóa bởi phụ huynh', icon: Trash2 },
  parent_locked: { status: 'locked', label: 'Phụ huynh bị khóa', icon: Lock },
  plan_locked: { tone: 'warning', label: 'Khóa do gói Free', icon: Crown },
  parent_hidden: { tone: 'neutral', label: 'Phụ huynh ẩn hồ sơ', icon: EyeOff },
});

// Child rows of the parent drawer
export const CHILD_PROFILE_CHIPS = Object.freeze({
  active: { status: 'active', label: 'Đang hoạt động' },
  archived: { status: 'archived', label: 'Đã xóa' },
  planLocked: { tone: 'warning', label: 'Khóa do gói Free', icon: Crown },
});

export const PROFILE_HIDDEN_CHIP = Object.freeze({ tone: 'neutral', label: 'Ẩn hồ sơ', icon: EyeOff });

// Payment statuses mapped to StatusChip colors with payment-specific labels
export const PAYMENT_STATUS_CHIPS = Object.freeze({
  creating: { status: 'creating', label: 'Đang khởi tạo' },
  pending: { status: 'pending', label: 'Chờ thanh toán' },
  success: { status: 'success', label: 'Thành công' },
  failed: { status: 'failed', label: 'Thất bại' },
  cancelled: { status: 'cancelled', label: 'Đã hủy' },
  expired: { status: 'expired', label: 'Đã hết hạn' },
});

export const RECENT_PAYMENTS_LIMIT = 5;

export const ADMIN_ERROR_MESSAGES = Object.freeze({
  CANNOT_LOCK_SELF: 'Bạn không thể tự khóa tài khoản của mình.',
  CANNOT_LOCK_ADMIN: 'Không thể khóa tài khoản quản trị viên khác.',
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh của tài khoản này.',
  CHILD_NOT_FOUND: 'Không tìm thấy hồ sơ trẻ này.',
});
