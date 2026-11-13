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
const toDateRange = (from, to) => ({
  from: from.format('YYYY-MM-DD'),
  to: to.format('YYYY-MM-DD'),
});

// Cards above the admin lists (`key` = field of the stats API), one per status tab below
export const USER_STAT_CARDS = [
  { key: 'total', label: 'Tổng phụ huynh', icon: Users, variant: 'secondary' },
  {
    key: 'active',
    label: 'Đang hoạt động',
    icon: UserCheck,
    variant: 'primary',
  },
  { key: 'locked', label: 'Đã khóa', icon: Lock, variant: 'error' },
  {
    key: 'premium',
    label: 'Premium đang hiệu lực',
    icon: Crown,
    variant: 'tertiary',
  },
];

export const CHILD_STAT_CARDS = [
  { key: 'total', label: 'Tổng hồ sơ', icon: Baby, variant: 'secondary' },
  { key: 'active', label: 'Chưa xóa', icon: Eye, variant: 'primary' },
  { key: 'archived', label: 'Đã xóa', icon: Trash2, variant: 'error' },
  {
    key: 'planLocked',
    label: 'Khóa do gói Free',
    icon: Crown,
    variant: 'tertiary',
  },
];

export const PLAYDATE_STAT_CARDS = [
  {
    key: 'total',
    label: 'Tổng cuộc hẹn',
    icon: CalendarDays,
    variant: 'secondary',
  },
  {
    key: 'upcoming',
    label: 'Sắp diễn ra',
    icon: CalendarClock,
    variant: 'primary',
  },
  {
    key: 'completed',
    label: 'Đã hoàn thành',
    icon: CalendarCheck,
    variant: 'tertiary',
  },
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
  {
    id: 'active',
    label: 'Đang hoạt động',
    value: 'active',
    query: { isActive: 'true' },
  },
  {
    id: 'locked',
    label: 'Đã khóa',
    value: 'locked',
    query: { isActive: 'false' },
  },
  {
    id: 'premium',
    label: 'Premium đang hiệu lực',
    value: 'premium',
    query: { isPremium: 'true' },
  },
];

// isVerifiedParent = email and phone verified (PROJECT_OVERVIEW §13), not an identity check
export const VERIFICATION_FILTER_OPTIONS = [
  { label: 'Tất cả xác thực', value: '' },
  { label: 'Đã xác thực', value: 'true' },
  { label: 'Chưa xác thực', value: 'false' },
];

export const CHILD_STATUS_CHIPS = [
  { id: '', label: 'Tất cả', value: '', query: {} },
  {
    id: 'active',
    label: 'Chưa xóa',
    value: 'active',
    query: { isArchived: 'false' },
  },
  {
    id: 'archived',
    label: 'Đã xóa',
    value: 'archived',
    query: { isArchived: 'true' },
  },
  {
    id: 'plan_locked',
    label: 'Khóa do gói Free',
    value: 'plan_locked',
    query: { isPlanLocked: 'true' },
  },
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

export const PROFILE_HIDDEN_CHIP = Object.freeze({
  tone: 'neutral',
  label: 'Ẩn hồ sơ',
  icon: EyeOff,
});

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
  ...Object.values(PAYMENT_STATUS_CHIPS).map(({ status, label }) => ({
    id: status,
    label,
    value: status,
  })),
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
  {
    key: 'discoveryViewLimitPerDay',
    label: 'Lượt quẹt hồ sơ / ngày',
    fallback: 5,
  },
  {
    key: 'connectionRequestsLimitPerMonth',
    label: 'Yêu cầu kết bạn / tháng',
    fallback: 5,
  },
  { key: 'playdatesLimitPerMonth', label: 'Cuộc hẹn tạo / tháng', fallback: 3 },
  {
    key: 'playdateParticipationLimitPerMonth',
    label: 'Cuộc hẹn tham gia / tháng',
    fallback: 3,
  },
  {
    key: 'aiAssistantLimitPerMonth',
    label: 'Yêu cầu Trợ lý AI / tháng',
    fallback: 5,
  },
];

// Billing cycle of a plan, shown read-only in its edit form
export const PLAN_BILLING_CYCLE_LABELS = Object.freeze({
  monthly: 'Theo tháng (1 tháng)',
  yearly: 'Theo năm (12 tháng)',
  none: 'Không thời hạn',
});

// Revenue overview cards (`key` = field of `overview` in GET /revenue/summary; rates are percentages)
export const REVENUE_STAT_CARDS = [
  {
    key: 'totalRevenue',
    label: 'Tổng doanh thu',
    icon: CircleDollarSign,
    variant: 'primary',
    format: formatCurrency,
  },
  {
    key: 'activePremiumSubscribers',
    label: 'Premium đang hiệu lực',
    icon: Crown,
    variant: 'tertiary',
  },
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
  {
    id: '7d',
    label: '7 ngày',
    getRange: (today) => toDateRange(today.subtract(6, 'day'), today),
  },
  {
    id: '30d',
    label: '30 ngày',
    getRange: (today) => toDateRange(today.subtract(29, 'day'), today),
  },
  {
    id: '90d',
    label: '90 ngày',
    getRange: (today) => toDateRange(today.subtract(89, 'day'), today),
  },
  {
    id: 'thisYear',
    label: 'Năm nay',
    getRange: (today) => toDateRange(today.startOf('year'), today),
  },
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
  // Declined after joining (participant.leftAt)
  left: { tone: 'neutral', label: 'Đã rời' },
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
  UNLOCK_REASON_REQUIRED: 'Tài khoản đang chịu hình phạt từ báo cáo vi phạm: cần nhập lý do mở khóa (tối thiểu 10 ký tự).',
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
  REPORT_NOT_FOUND: 'Không tìm thấy báo cáo này.',
  REPORT_ALREADY_CLOSED: 'Báo cáo này đã đóng. Hãy mở lại nếu cần xử lý tiếp.',
  REPORTED_USER_NOT_FOUND: 'Không tìm thấy phụ huynh bị báo cáo.',
  INVALID_STATUS_TRANSITION:
    'Trạng thái hiện tại của báo cáo không cho phép thao tác này.',
  INVALID_RESOLUTION: 'Kết luận không khớp với trạng thái đóng báo cáo.',
  INVALID_ACTION_TYPE:
    'Chế tài này không áp dụng được cho đối tượng của báo cáo.',
  ACTION_ALREADY_APPLIED: 'Chế tài này đã được áp dụng trước đó.',
  ACTIONS_REQUIRED_FOR_RESOLVE:
    'Cần thi hành ít nhất 1 chế tài trước khi đánh dấu đã xử lý.',
  RELATED_REPORTS_REQUIRE_SANCTION:
    'Chỉ đóng gộp báo cáo liên quan được khi đã đình chỉ hoặc khóa tài khoản.',
  DURATION_DAYS_REQUIRED: 'Vui lòng chọn thời hạn đình chỉ.',
  TARGET_NOT_FOUND: 'Đối tượng bị báo cáo không còn tồn tại.',
  POLICY_OVERRIDE_REQUIRED:
    'Chế tài này nằm ngoài khung quy chuẩn. Vui lòng tích chọn "Áp dụng ngoại lệ chính sách (Policy Override)" và giải trình lý do.',
  OVERRIDE_REASON_REQUIRED:
    'Vui lòng nhập lý do giải trình ngoại lệ chính sách (ít nhất 20 ký tự).',
  SENTINEL_API_KEY_REQUIRED:
    'Sentinel AI chưa được cấu hình. Bạn vẫn có thể xử lý thủ công.',
  NO_SENTINEL_ASSESSMENT:
    'Báo cáo chưa có phân tích AI. Vui lòng chạy thẩm định trước.',
  AI_UNAVAILABLE:
    'Sentinel AI tạm thời không khả dụng. Bạn vẫn có thể xử lý thủ công.',
  TARGET_USER_NOT_FOUND: 'Không tìm thấy tài khoản bị báo cáo.',
  RESOLUTION_CONFLICTS_WITH_ACTIONS:
    'Báo cáo đã có chế tài: chỉ có thể kết luận là đã xử lý bằng chế tài.',
});

// ==========================================
// SAFETY & REPORTS MODERATION CONSTANTS
// ==========================================

export const REPORT_STAT_CARDS = [
  { key: 'pending', label: 'Chờ xử lý', icon: Clock, variant: 'secondary' },
  { key: 'overdue', label: 'Quá hạn SLA', icon: Lock, variant: 'error' },
  {
    key: 'resolvedThisWeek',
    label: 'Đã giải quyết tuần này',
    icon: CheckCircle2,
    variant: 'tertiary',
  },
];

export const REPORT_STATUS_DISPLAY = Object.freeze({
  pending: { tone: 'warning', label: 'Chờ xử lý' },
  // Reports claimed before the single-step flow: still waiting for a decision
  reviewing: { tone: 'warning', label: 'Chờ xử lý' },
  resolved: { tone: 'success', label: 'Đã giải quyết' },
  dismissed: { tone: 'neutral', label: 'Bác bỏ' },
});

export const PLAYDATE_STATUS_DISPLAY = Object.freeze({
  upcoming: { tone: 'success', label: 'Sắp diễn ra' },
  completed: { tone: 'info', label: 'Đã hoàn thành' },
  cancelled: { tone: 'neutral', label: 'Đã hủy' },
});

export const REPORT_NOTES_MIN_LENGTH = 10;
export const REPORT_OVERRIDE_MIN_LENGTH = 20;
export const REPORT_SUSPEND_DURATIONS = Object.freeze([3, 7, 14, 30]);
// Most images a report can have (REPORT_LIMITS.MAX_EVIDENCE_URLS on the backend)
export const REPORT_EVIDENCE_MAX_LINKS = 5;

/**
 * Whether a sanction falls outside the policy matrix the backend returned for an assessed report
 * (not an allowed type, or a suspension whose length differs from the standard one).
 * Without `policyGuidance` (no Sentinel assessment) nothing is outside the matrix.
 * @param {Object|null} policyGuidance
 * @param {string} type
 * @param {number|null} [durationDays]
 */
export const isSanctionOutsidePolicy = (
  policyGuidance,
  type,
  durationDays = null,
) => {
  const allowed = policyGuidance?.allowedActionTypes || [];
  if (allowed.length === 0) return false;
  if (!allowed.includes(type)) return true;
  if (type !== 'suspend' || durationDays === null || durationDays === undefined)
    return false;
  const standard = (policyGuidance.standardActions || []).find(
    (action) => action.type === 'suspend',
  );
  return (
    Boolean(standard?.durationDays) &&
    Number(durationDays) !== Number(standard.durationDays)
  );
};

// Vietnamese text of the policy clauses, keyed by their number (reports assessed before the
// backend clauses were translated still store the English text)
const POLICY_CLAUSE_LABELS = Object.freeze({
  0.1: 'Mức nghiêm trọng — chuyển xử lý khẩn cấp',
  1.1: 'Không khoan nhượng với vi phạm an toàn trẻ em (dụ dỗ, hành vi săn mồi, bóc lột)',
  2.1: 'Quấy rối, bắt nạt và giao tiếp thù địch',
  3.1: 'Văn bản, hình ảnh không phù hợp hoặc ngôn từ thô tục',
  4.1: 'Mạo danh, giả danh hoặc hồ sơ gia đình sai sự thật',
  5.1: 'Quảng cáo, chào mời không mong muốn hoặc tin rác lặp lại',
  6.1: 'Nhiều lần vắng mặt tại buổi hẹn đã xác nhận mà không báo trước',
  7.1: 'Vi phạm chung Quy chuẩn Cộng đồng',
});

/** "Rule 6.1: Repeated ..." or "Điều 6.1: ..." -> "Điều 6.1: <Vietnamese text>" */
export const formatPolicyClause = (clause) => {
  if (!clause) return '';
  const match = /^(?:Rule|Điều)\s+(\d+\.\d+)/.exec(clause);
  if (!match || !POLICY_CLAUSE_LABELS[match[1]]) return clause;
  return `Điều ${match[1]}: ${POLICY_CLAUSE_LABELS[match[1]]}`;
};

/** Monitoring window from the backend ("30 min" on older assessments) */
export const formatTimeWindow = (timeWindow) =>
  (timeWindow || '30 phút').replace(/\bmin\b/, 'phút');

// Conclusion of the Sentinel AI (assessments made before verdicts have none: shown as unclear)
export const SENTINEL_VERDICT_DISPLAY = Object.freeze({
  violation: { tone: 'danger', label: 'AI kết luận: Có vi phạm' },
  no_violation: { tone: 'success', label: 'AI kết luận: Không vi phạm' },
  unclear: { tone: 'warning', label: 'AI kết luận: Chưa rõ' },
});

export const getSentinelVerdict = (assessment) =>
  SENTINEL_VERDICT_DISPLAY[assessment?.verdict]
    ? assessment.verdict
    : 'unclear';

export const CLUSTER_SEVERITY_WEIGHTS = { critical: 4, high: 3, medium: 2, low: 1 };

/**
 * What "Xác nhận xử lý & đóng cụm" will do, by the same rules as the backend
 * (POST /reports/sentinel-cluster-resolve), so the confirmation says it before anything happens.
 * @param {Array<Object>} reports - Open reports of the cluster (one reported parent)
 * @returns {{ violationIds: string[], dismissIds: string[], manualCount: number, sanctions: Array<Object>, isActionable: boolean }}
 */
export const planSentinelCluster = (reports = []) => {
  const violations = [];
  const dismissIds = [];
  let manualCount = 0;

  reports.forEach((report) => {
    const assessment = report.sentinelAssessment;
    if (!assessment) {
      manualCount += 1;
    } else if (assessment.verdict === 'no_violation') {
      dismissIds.push(report.id);
    } else if (
      assessment.verdict === 'violation' &&
      report.category !== 'child_safety' &&
      report.severity !== 'critical'
    ) {
      violations.push(report);
    } else {
      manualCount += 1;
    }
  });

  // The most severe report carries the sanctions (backend: same order)
  const primary = [...violations].sort(
    (a, b) =>
      (CLUSTER_SEVERITY_WEIGHTS[b.severity] || 0) -
        (CLUSTER_SEVERITY_WEIGHTS[a.severity] || 0) ||
      new Date(a.createdAt) - new Date(b.createdAt),
  )[0];
  const sanctions = primary?.sentinelAssessment?.recommendedSanctions || [];
  const isHeavy = sanctions.some(
    (s) =>
      s.type === 'ban' || (s.type === 'suspend' && (s.durationDays || 0) > 7),
  );
  const violationIds = isHeavy ? [] : violations.map((report) => report.id);
  if (isHeavy) manualCount += violations.length;

  return {
    violationIds,
    dismissIds,
    manualCount,
    sanctions: isHeavy ? [] : sanctions,
    // Most severe violation report: the one the sanctions of the cluster come from
    primaryId: primary?.id || null,
    isActionable: violationIds.length + dismissIds.length > 0,
  };
};

/** Open report whose reported parent really had messaging restricted by Sentinel Auto-Shield */
export const isTemporarilyRestricted = (report) =>
  Boolean(
    report?.sentinelAssessment?.monitoring?.temporaryRestriction?.applied,
  ) &&
  (report.status === 'pending' || report.status === 'reviewing');

// Default confidence threshold of Sentinel batch apply (same default as the backend)
export const SENTINEL_BATCH_MIN_CONFIDENCE = 80;

/**
 * What the confirmation of a sanction says will happen
 * @param {string} type
 * @param {number|null} [durationDays]
 */
export const REPORT_STATUS_CHIPS = [
  { id: '', label: 'Tất cả', value: '', query: {} },
  {
    id: 'pending',
    label: 'Chờ xử lý',
    value: 'pending',
    query: { status: 'pending' },
  },
  {
    id: 'resolved',
    label: 'Đã giải quyết',
    value: 'resolved',
    query: { status: 'resolved' },
  },
  {
    id: 'dismissed',
    label: 'Bác bỏ',
    value: 'dismissed',
    query: { status: 'dismissed' },
  },
];

export const REPORT_SEVERITY_CONFIG = Object.freeze({
  critical: {
    label: 'Khẩn cấp',
    tone: 'danger',
    className: 'bg-error-soft text-error-dark border-error-dark',
  },
  high: { label: 'Cao', tone: 'warning' },
  medium: { label: 'Trung bình', tone: 'info' },
  low: { label: 'Thấp', tone: 'neutral' },
});

export const REPORT_SEVERITY_OPTIONS = [
  { label: 'Tất cả mức độ', value: '' },
  { label: 'Khẩn cấp', value: 'critical' },
  { label: 'Cao', value: 'high' },
  { label: 'Trung bình', value: 'medium' },
  { label: 'Thấp', value: 'low' },
];

export const REPORT_CATEGORY_LABELS = Object.freeze({
  child_safety: 'An toàn trẻ em',
  harassment: 'Quấy rối / Đe dọa',
  inappropriate_content: 'Nội dung phản cảm',
  fake_profile: 'Hồ sơ giả mạo',
  no_show: 'Bùng hẹn',
  spam: 'Tin rác',
  other: 'Vi phạm khác',
});

// Shown when a report has no severity or category
export const REPORT_UNCLASSIFIED_LABEL = 'Chưa phân loại';

export const getReportCategoryLabel = (category) =>
  REPORT_CATEGORY_LABELS[category] || category || REPORT_UNCLASSIFIED_LABEL;

export const REPORT_CATEGORY_OPTIONS = [
  { label: 'Tất cả danh mục', value: '' },
  { label: 'An toàn trẻ em', value: 'child_safety' },
  { label: 'Quấy rối / Đe dọa', value: 'harassment' },
  { label: 'Nội dung phản cảm', value: 'inappropriate_content' },
  { label: 'Hồ sơ giả mạo', value: 'fake_profile' },
  { label: 'Bùng hẹn', value: 'no_show' },
  { label: 'Tin rác', value: 'spam' },
  { label: 'Vi phạm khác', value: 'other' },
];

export const REPORT_TARGET_TYPE_LABELS = Object.freeze({
  user: 'Tài khoản',
  message: 'Tin nhắn',
  playdate: 'Cuộc hẹn',
});

export const REPORT_TARGET_TYPE_OPTIONS = [
  { label: 'Tất cả đối tượng', value: '' },
  { label: 'Tài khoản', value: 'user' },
  { label: 'Tin nhắn', value: 'message' },
  { label: 'Cuộc hẹn', value: 'playdate' },
];

export const REPORT_ACTION_LABELS = Object.freeze({
  warn: 'Cảnh cáo tài khoản',
  delete_message: 'Xóa tin nhắn vi phạm',
  cancel_playdate: 'Hủy cuộc hẹn',
  suspend: 'Tạm đình chỉ có thời hạn',
  ban: 'Khóa tài khoản vĩnh viễn',
  dismiss: 'Bác bỏ báo cáo',
  no_action: 'Không kỷ luật',
});

export const REPORT_RESOLUTION_LABELS = Object.freeze({
  action_taken: 'Đã áp dụng chế tài kỷ luật',
  no_action: 'Có vi phạm nhưng không kỷ luật',
  dismissed: 'Bác bỏ (Báo cáo sai / Không đủ bằng chứng)',
});
