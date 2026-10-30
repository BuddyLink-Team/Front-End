import {
  CheckCircle2,
  EyeOff,
  Lock,
  Trash2,
  Crown,
  Users,
  UserCheck,
  Baby,
  Eye,
  CalendarDays,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  Link2,
  Clock,
  UserX,
  BarChart2,
  Package,
  Receipt,
  CircleDollarSign,
  TrendingUp,
  UserMinus,
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../../../utils/formatters';

// `from` / `to` dayjs dates as the 'YYYY-MM-DD' range DateRangeFilter works with
const toDateRange = (from, to) => ({ from: from.format('YYYY-MM-DD'), to: to.format('YYYY-MM-DD') });

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

export const PLAYDATE_STAT_CARDS = [
  { key: 'total', label: 'Tổng cuộc hẹn', icon: CalendarDays, variant: 'secondary' },
  { key: 'upcoming', label: 'Sắp diễn ra', icon: CalendarClock, variant: 'primary' },
  { key: 'completed', label: 'Đã hoàn thành', icon: CalendarCheck, variant: 'tertiary' },
  { key: 'cancelled', label: 'Đã hủy', icon: CalendarX, variant: 'error' },
];

// The strip has 4 slots: declined requests are left out (still a status tab of the list)
export const CONNECTION_STAT_CARDS = [
  { key: 'total', label: 'Tổng kết nối', icon: Link2, variant: 'secondary' },
  { key: 'accepted', label: 'Đã kết nối', icon: UserCheck, variant: 'primary' },
  { key: 'pending', label: 'Đang chờ', icon: Clock, variant: 'tertiary' },
  { key: 'removed', label: 'Đã gỡ', icon: UserX, variant: 'error' },
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
];

export const GENDER_LABELS = Object.freeze({
  boy: 'Bé trai',
  girl: 'Bé gái',
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

// Subscription plans & revenue screen
export const SUBSCRIPTION_TABS = [
  { id: 'overview', label: 'Tổng quan', icon: BarChart2 },
  { id: 'plans', label: 'Gói dịch vụ', icon: Package },
  { id: 'subscribers', label: 'Thuê bao', icon: Users },
  { id: 'transactions', label: 'Giao dịch', icon: Receipt },
];

export const SUBSCRIPTION_PLAN_FILTER_OPTIONS = [
  { label: 'Tất cả gói', value: '' },
  { label: SUBSCRIPTION_PLAN_NAMES.free, value: 'free' },
  { label: SUBSCRIPTION_PLAN_NAMES.premium_monthly, value: 'premium_monthly' },
  { label: SUBSCRIPTION_PLAN_NAMES.premium_yearly, value: 'premium_yearly' },
];

// Status tabs of the subscriptions and transactions lists: `value` is sent to the API as `status`
export const SUBSCRIPTION_STATUS_CHIPS = [
  { id: '', label: 'Tất cả', value: '' },
  { id: 'active', label: 'Đang hiệu lực', value: 'active' },
  { id: 'expired', label: 'Đã hết hạn', value: 'expired' },
];

export const TRANSACTION_STATUS_CHIPS = [
  { id: '', label: 'Tất cả', value: '' },
  ...Object.values(PAYMENT_STATUS_CHIPS).map(({ status, label }) => ({ id: status, label, value: status })),
];

// Subscription statuses as StatusChip props
export const SUBSCRIPTION_STATUS_DISPLAY = Object.freeze({
  active: { status: 'active', label: 'Đang hiệu lực' },
  expired: { status: 'expired', label: 'Đã hết hạn' },
});

// Limits of a plan (`features` of subscription_plans), -1 = unlimited.
// Every plan stores its limits; they apply to the parents on that plan
export const UNLIMITED_LIMIT = -1;
export const PLAN_NAME_MAX_LENGTH = 100;
// `fallback`: the limit set when "Vô cực" is turned off
export const PLAN_FEATURE_FIELDS = [
  { key: 'childProfilesLimit', label: 'Hồ sơ trẻ tối đa', fallback: 1 },
  { key: 'discoveryViewLimitPerDay', label: 'Lượt quẹt hồ sơ / ngày', fallback: 5 },
  { key: 'connectionRequestsLimitPerMonth', label: 'Yêu cầu kết bạn / tháng', fallback: 5 },
  { key: 'playdatesLimitPerMonth', label: 'Cuộc hẹn tạo / tháng', fallback: 3 },
  { key: 'playdateParticipationLimitPerMonth', label: 'Cuộc hẹn tham gia / tháng', fallback: 3 },
  { key: 'aiAssistantLimitPerMonth', label: 'Yêu cầu Trợ lý AI / tháng', fallback: 5 },
];

// Billing cycle of a plan, shown read-only in its edit form
export const PLAN_BILLING_CYCLE_LABELS = Object.freeze({
  monthly: 'Theo tháng (1 tháng)',
  yearly: 'Theo năm (12 tháng)',
  none: 'Không thời hạn',
});

// Revenue overview cards (`key` = field of `overview` in GET /revenue/summary; rates are percentages)
export const REVENUE_STAT_CARDS = [
  { key: 'totalRevenue', label: 'Tổng doanh thu', icon: CircleDollarSign, variant: 'primary', format: formatCurrency },
  { key: 'activePremiumSubscribers', label: 'Premium đang hiệu lực', icon: Crown, variant: 'tertiary' },
  {
    key: 'conversionRate',
    label: 'Tỷ lệ chuyển đổi',
    icon: TrendingUp,
    variant: 'secondary',
    format: (value) => formatPercent(value / 100),
  },
  {
    key: 'churnRate',
    label: 'Tỷ lệ rời bỏ',
    icon: UserMinus,
    variant: 'error',
    format: (value) => formatPercent(value / 100),
  },
];

export const PAYMENT_METHOD_LABELS = Object.freeze({
  payos: 'VietQR (PayOS)',
});

// Revenue overview presets of DateRangeFilter, on top of its 7 / 30 days defaults
export const REVENUE_DATE_PRESETS = [
  { id: '7d', label: '7 ngày', getRange: (today) => toDateRange(today.subtract(6, 'day'), today) },
  { id: '30d', label: '30 ngày', getRange: (today) => toDateRange(today.subtract(29, 'day'), today) },
  { id: '90d', label: '90 ngày', getRange: (today) => toDateRange(today.subtract(89, 'day'), today) },
  { id: 'thisYear', label: 'Năm nay', getRange: (today) => toDateRange(today.startOf('year'), today) },
];

// Status tabs of the playdates and connections lists: `value` is sent to the API as `status`
export const PLAYDATE_STATUS_CHIPS = [
  { id: '', label: 'Tất cả', value: '' },
  { id: 'upcoming', label: 'Sắp diễn ra', value: 'upcoming' },
  { id: 'completed', label: 'Đã hoàn thành', value: 'completed' },
  { id: 'cancelled', label: 'Đã hủy', value: 'cancelled' },
];

export const CONNECTION_STATUS_CHIPS = [
  { id: '', label: 'Tất cả', value: '' },
  { id: 'pending', label: 'Đang chờ', value: 'pending' },
  { id: 'accepted', label: 'Đã kết nối', value: 'accepted' },
  { id: 'declined', label: 'Đã từ chối', value: 'declined' },
  { id: 'removed', label: 'Đã gỡ', value: 'removed' },
];

// Connection statuses as StatusChip props
export const CONNECTION_STATUS_DISPLAY = Object.freeze({
  pending: { tone: 'warning', label: 'Đang chờ' },
  accepted: { tone: 'success', label: 'Đã kết nối' },
  declined: { tone: 'danger', label: 'Đã từ chối' },
  removed: { tone: 'neutral', label: 'Đã gỡ' },
});

// Playdate participant answers as StatusChip props
export const PARTICIPANT_STATUS_DISPLAY = Object.freeze({
  pending: { tone: 'warning', label: 'Chờ phản hồi' },
  accepted: { tone: 'success', label: 'Đã tham gia' },
  declined: { tone: 'neutral', label: 'Đã từ chối' },
});

// Where a child pair of a connection comes from (connection childPairs[].source)
export const CHILD_PAIR_SOURCE_LABELS = Object.freeze({
  discovery: 'Ghép từ Khám phá',
  playdate: 'Đã chơi chung buổi hẹn',
  manual: 'Phụ huynh tự ghép',
});

// Only these can be force-cancelled / removed by an admin
export const CANCELLABLE_PLAYDATE_STATUSES = ['upcoming'];
export const REMOVABLE_CONNECTION_STATUSES = ['pending', 'accepted'];

export const ADMIN_ERROR_MESSAGES = Object.freeze({
  CANNOT_LOCK_SELF: 'Bạn không thể tự khóa tài khoản của mình.',
  CANNOT_LOCK_ADMIN: 'Không thể khóa tài khoản quản trị viên khác.',
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh của tài khoản này.',
  CHILD_NOT_FOUND: 'Không tìm thấy hồ sơ trẻ này.',
  PLAYDATE_NOT_FOUND: 'Không tìm thấy cuộc hẹn chơi này.',
  ALREADY_CANCELLED: 'Cuộc hẹn chơi này đã bị hủy trước đó.',
  INVALID_PLAYDATE_STATUS: 'Không thể hủy cuộc hẹn chơi đã hoàn thành.',
  PLAYDATE_CHANGED: 'Cuộc hẹn chơi vừa được cập nhật, vui lòng tải lại.',
  CONNECTION_NOT_FOUND: 'Không tìm thấy kết nối này.',
  INVALID_CONNECTION_STATE: 'Chỉ có thể gỡ kết nối đang chờ hoặc đã kết nối.',
  PLAN_NOT_FOUND: 'Không tìm thấy gói dịch vụ này.',
  FREE_PLAN_IMMUTABLE: 'Gói Miễn phí phải giữ giá 0đ và luôn được kích hoạt.',
  INVALID_PRICE: 'Giá gói Premium phải lớn hơn 0.',
  SUBSCRIPTION_NOT_FOUND: 'Không tìm thấy thuê bao này.',
  PAYMENT_NOT_FOUND: 'Không tìm thấy giao dịch này.',
  NOTIFICATION_NOT_FOUND: 'Không tìm thấy thông báo này.',
  ADMIN_PORTAL_REQUIRED: 'Tài khoản quản trị viên phải đăng nhập qua cổng quản trị.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác.',
  USER_NOT_FOUND: 'Không tìm thấy thông tin tài khoản người dùng.',
  ACCOUNT_DISABLED: 'Tài khoản hiện đang bị khóa.',
  FORBIDDEN: 'Bạn không có quyền quản trị viên.',
  CANNOT_CANCEL_COMPLETED: 'Không thể hủy cuộc hẹn chơi đã hoàn thành.',
  REPORT_NOT_FOUND: 'Không tìm thấy báo cáo vi phạm này.',
  INVALID_DATE_RANGE: 'Khoảng thời gian thống kê không hợp lệ (tối đa 12 tháng).',
});
