import {
  AlertTriangle,
  Baby,
  Bot,
  Calendar,
  CircleDollarSign,
  Crown,
  Info,
  Receipt,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { CHART_COLOR_VARS } from '../../../constants/chart.constants';
import { ADMIN_ROUTES } from '../../../constants/navigation.constants';
import { formatCurrency } from '../../../utils/formatters';

// ---- Analytics ----

// The API refuses a longer range
export const ANALYTICS_MAX_RANGE_DAYS = 366;

export const ANALYTICS_GROUP_BY = Object.freeze({
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
});

export const ANALYTICS_GROUP_BY_OPTIONS = [
  { label: 'Theo ngày', value: ANALYTICS_GROUP_BY.DAY },
  { label: 'Theo tuần', value: ANALYTICS_GROUP_BY.WEEK },
  { label: 'Theo tháng', value: ANALYTICS_GROUP_BY.MONTH },
];

// Longest range (in days) still shown with this grouping when the range changes; beyond them: by month
export const ANALYTICS_GROUP_BY_DAY_LIMIT = 31;
export const ANALYTICS_GROUP_BY_WEEK_LIMIT = 120;

// `key` = field of `overview` in the analytics API
export const DASHBOARD_KPI_CARDS = [
  { key: 'totalParents', label: 'Tổng số phụ huynh', icon: Users, variant: 'secondary' },
  { key: 'newParents', label: 'Phụ huynh mới', icon: UserPlus, variant: 'primary' },
  { key: 'totalChildProfiles', label: 'Tổng hồ sơ trẻ', icon: Baby, variant: 'tertiary' },
  { key: 'totalPlaydates', label: 'Buổi hẹn chơi', icon: Calendar, variant: 'primary' },
  { key: 'acceptedConnections', label: 'Kết nối được chấp nhận', icon: UserCheck, variant: 'primary' },
  { key: 'activePremiumSubscriptions', label: 'Premium đang hiệu lực', icon: Crown, variant: 'tertiary' },
  { key: 'totalRevenue', label: 'Tổng doanh thu', icon: CircleDollarSign, variant: 'primary', format: formatCurrency },
  { key: 'successfulTransactions', label: 'Giao dịch thành công', icon: Receipt, variant: 'primary' },
  { key: 'aiUsage', label: 'Lượt hỏi trợ lý AI', icon: Bot, variant: 'secondary' },
];

// `key` = field of `playdates.byStatus`
export const PLAYDATE_STATUS_SEGMENTS = [
  { key: 'upcoming', label: 'Sắp diễn ra', colorVar: CHART_COLOR_VARS.SECONDARY, dotClass: 'bg-secondary' },
  { key: 'completed', label: 'Đã hoàn thành', colorVar: CHART_COLOR_VARS.PRIMARY, dotClass: 'bg-primary' },
  { key: 'cancelled', label: 'Đã hủy', colorVar: CHART_COLOR_VARS.ERROR, dotClass: 'bg-error' },
];

// `key` = field of `subscriptions.byPlan`
export const SUBSCRIPTION_PLAN_SEGMENTS = [
  { key: 'free', label: 'Gói Miễn phí', colorVar: CHART_COLOR_VARS.MUTED, dotClass: 'bg-text-muted' },
  { key: 'premiumMonthly', label: 'Premium tháng', colorVar: CHART_COLOR_VARS.PRIMARY, dotClass: 'bg-primary' },
  { key: 'premiumYearly', label: 'Premium năm', colorVar: CHART_COLOR_VARS.TERTIARY, dotClass: 'bg-tertiary' },
];

// `key` = field of `connections`
export const CONNECTION_STATUS_ROWS = [
  { key: 'accepted', label: 'Đã chấp nhận', barClass: 'bg-primary' },
  { key: 'pending', label: 'Đang chờ phản hồi', barClass: 'bg-tertiary' },
  { key: 'declined', label: 'Đã từ chối', barClass: 'bg-error' },
  { key: 'removed', label: 'Đã gỡ kết nối', barClass: 'bg-text-muted' },
];

// ---- Notifications ----

export const ADMIN_NOTIFICATION_PAGE_LIMIT = 20;
export const ADMIN_NOTIFICATION_FILTER_ALL = 'all';
export const ADMIN_NOTIFICATION_CRITICAL = 'critical';
export const ADMIN_NOTIFICATION_TOAST_DURATION_MS = 7000;

export const ADMIN_SOCKET_NAMESPACE = '/admin';
export const ADMIN_SOCKET_EVENTS = Object.freeze({
  NOTIFICATION_NEW: 'admin:notification:new',
  UNREAD_COUNT: 'admin:notification:unread-count',
});

export const DASHBOARD_TABS = Object.freeze({
  STATS: 'stats',
  NOTIFICATIONS: 'notifications',
});

// Hash of the dashboard that opens the notification tab (bell in the header)
export const ADMIN_NOTIFICATION_BOARD_HASH = '#notifications';

export const NOTIFICATION_CATEGORY_TABS = [
  { id: ADMIN_NOTIFICATION_FILTER_ALL, label: 'Tất cả' },
  { id: 'safety', label: 'An toàn' },
  { id: 'payments', label: 'Thanh toán' },
  { id: 'users', label: 'Người dùng' },
  { id: 'playdates', label: 'Hẹn chơi' },
  { id: 'connections', label: 'Kết nối' },
  { id: 'system', label: 'Hệ thống' },
];

export const NOTIFICATION_SEVERITY_OPTIONS = [
  { value: ADMIN_NOTIFICATION_FILTER_ALL, label: 'Mọi mức độ' },
  { value: 'critical', label: 'Khẩn cấp' },
  { value: 'warning', label: 'Cảnh báo' },
  { value: 'info', label: 'Thông tin' },
];

export const NOTIFICATION_SEVERITY_DISPLAY = {
  critical: { icon: ShieldAlert, iconClass: 'bg-error-container text-error-on-container' },
  warning: { icon: AlertTriangle, iconClass: 'bg-tertiary-soft text-tertiary-dark' },
  info: { icon: Info, iconClass: 'bg-primary-soft text-primary-dark' },
};

// Where a notification leads (entityType); `stateKey` opens the detail of `entityId` on that screen
export const NOTIFICATION_ENTITY_TARGETS = {
  User: { route: ADMIN_ROUTES.USERS, stateKey: 'openUserId' },
  Child: { route: ADMIN_ROUTES.CHILDREN, stateKey: 'openChildId' },
  Playdate: { route: ADMIN_ROUTES.PLAYDATES, stateKey: 'openPlaydateId' },
  Connection: { route: ADMIN_ROUTES.CONNECTIONS, stateKey: 'openConnectionId' },
  Payment: { route: ADMIN_ROUTES.SUBSCRIPTIONS },
  Subscription: { route: ADMIN_ROUTES.SUBSCRIPTIONS },
  Report: { route: ADMIN_ROUTES.REPORTS },
};
