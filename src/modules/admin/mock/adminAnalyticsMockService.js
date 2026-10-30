import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import {
  buildInitialMockNotifications,
  MOCK_ANALYTICS_AGE_GROUPS,
  MOCK_ANALYTICS_TOP_PARENTS,
  MOCK_REALTIME_NOTIFICATIONS,
} from './adminAnalyticsMockData';

dayjs.extend(isoWeek);

const NOTIFICATION_STORAGE_KEY = 'buddylink_mock_admin_notifications_v1';
const CATEGORIES = ['users', 'payments', 'playdates', 'connections', 'safety', 'system'];

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const ok = (data, message = 'OK') => ({ success: true, message, data, error: null });

const fail = (status, code, message) => {
  const error = new Error(message);
  error.response = { status, data: { success: false, message, data: null, error: { code, details: [] } } };
  return Promise.reject(error);
};

const loadNotifications = () => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Unreadable data: start again from the seed
  }
  const seed = buildInitialMockNotifications();
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(seed));
  return seed;
};

const saveNotifications = (items) => {
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(items));
};

const countUnread = (items) => {
  const byCategory = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
  const unread = items.filter((item) => !item.isRead);
  unread.forEach((item) => {
    byCategory[item.category] += 1;
  });
  return { total: unread.length, byCategory };
};

const toKpi = (value, previousValue) => ({
  value,
  previousValue,
  changePercent: previousValue === 0 ? null : Number((((value - previousValue) / previousValue) * 100).toFixed(1)),
});

// Same periods and labels as the API, with figures that only depend on the position in the range
const listPeriods = (from, to, groupBy) => {
  const periods = new Map();
  for (let day = dayjs(from); !day.isAfter(dayjs(to), 'day'); day = day.add(1, 'day')) {
    let period = { period: day.format('YYYY-MM-DD'), label: day.format('DD/MM') };
    if (groupBy === 'week') {
      period = {
        period: `${day.isoWeekYear()}-W${String(day.isoWeek()).padStart(2, '0')}`,
        label: `Tuần ${day.isoWeek()}/${day.isoWeekYear()}`,
      };
    }
    if (groupBy === 'month') {
      period = { period: day.format('YYYY-MM'), label: `T${day.month() + 1}/${day.year()}` };
    }
    if (!periods.has(period.period)) periods.set(period.period, period);
  }
  return [...periods.values()];
};

export const adminAnalyticsMockService = {
  async getAnalytics({ fromDate, toDate, groupBy = 'day' } = {}) {
    await delay();
    const from = fromDate || dayjs().subtract(29, 'day').format('YYYY-MM-DD');
    const to = toDate || dayjs().format('YYYY-MM-DD');
    const periods = listPeriods(from, to, groupBy);
    const byPeriod = (row) => periods.map((period, index) => ({ ...period, ...row(index) }));

    const userGrowth = byPeriod((index) => ({ count: 2 + (index % 7) }));

    return ok({
      overview: {
        totalParents: toKpi(1248, 1163),
        newParents: toKpi(85, 76),
        totalChildProfiles: toKpi(1420, 1328),
        totalPlaydates: toKpi(230, 210),
        acceptedConnections: toKpi(72, 80),
        activePremiumSubscriptions: toKpi(310, 0),
        totalRevenue: toKpi(36750000, 32500000),
        successfulTransactions: toKpi(123, 110),
        aiUsage: toKpi(1840, 1620),
      },
      userGrowth: { totalParents: 1248, newParentsInPeriod: 85, timeline: userGrowth },
      revenue: {
        totalRevenue: 36750000,
        successfulTransactions: 123,
        payingParentsCount: 96,
        timeline: byPeriod((index) => ({ revenue: (1 + (index % 5)) * 299000, transactionCount: 1 + (index % 5) })),
      },
      conversion: {
        funnel: [
          { step: 'registered', label: 'Đăng ký tài khoản', count: 1248 },
          { step: 'withChildProfile', label: 'Tạo hồ sơ bé', count: 1080 },
          { step: 'firstConnection', label: 'Có kết nối', count: 890 },
          { step: 'firstPlaydate', label: 'Tham gia playdate', count: 650 },
          { step: 'paid', label: 'Nâng cấp Premium', count: 310 },
        ],
        conversionRate: 24.8,
        churnRate: 6.2,
      },
      playdates: {
        byStatus: { total: 230, upcoming: 40, completed: 170, cancelled: 20 },
        timeline: byPeriod((index) => ({ count: 1 + (index % 6) })),
      },
      connections: { sent: 110, accepted: 72, declined: 15, pending: 18, removed: 5, acceptanceRate: 65.5 },
      subscriptions: {
        byPlan: { free: 938, premiumMonthly: 210, premiumYearly: 100 },
        activePremium: 310,
        churnedParents: 19,
      },
      aiUsage: {
        totalMessagesInPeriod: 1840,
        timeline: byPeriod((index) => ({ count: 10 + (index % 8) * 5 })),
        topParents: MOCK_ANALYTICS_TOP_PARENTS,
      },
      children: { total: 1420, byAgeGroup: MOCK_ANALYTICS_AGE_GROUPS },
      filter: {
        fromDate: dayjs(from).startOf('day').toISOString(),
        toDate: dayjs(to).endOf('day').toISOString(),
        groupBy,
      },
    });
  },

  async getNotifications({ category, severity, isRead, page = 1, limit = 20 } = {}) {
    await delay();
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const items = loadNotifications()
      .filter((item) => !category || category === 'all' || item.category === category)
      .filter((item) => !severity || severity === 'all' || item.severity === severity)
      .filter((item) => isRead === undefined || String(item.isRead) === String(isRead));

    return ok({
      items: items.slice((pageNum - 1) * limitNum, pageNum * limitNum),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: items.length,
        totalPages: Math.ceil(items.length / limitNum) || 1,
      },
    });
  },

  async getUnreadCount() {
    await delay();
    return ok(countUnread(loadNotifications()));
  },

  async markAsRead(id) {
    await delay();
    const items = loadNotifications();
    const item = items.find((notification) => notification.id === id);
    if (!item) return fail(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
    item.isRead = true;
    saveNotifications(items);
    return ok(item);
  },

  async markAllAsRead(category) {
    await delay();
    const items = loadNotifications();
    let modifiedCount = 0;
    items.forEach((item) => {
      if (!item.isRead && (!category || category === 'all' || item.category === category)) {
        item.isRead = true;
        modifiedCount += 1;
      }
    });
    saveNotifications(items);
    return ok({ modifiedCount });
  },

  /**
   * New notification for the simulated socket (adminMockSocket)
   * @param {number} sequence - Picks the next sample
   * @returns {{ notification: Object, counts: { total: number, byCategory: Object } }}
   */
  pushRealtimeNotification(sequence) {
    const sample = MOCK_REALTIME_NOTIFICATIONS[sequence % MOCK_REALTIME_NOTIFICATIONS.length];
    const notification = {
      ...sample,
      id: `notif-live-${Date.now()}-${sequence}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    const items = [notification, ...loadNotifications()];
    saveNotifications(items);
    return { notification, counts: countUnread(items) };
  },
};

export default adminAnalyticsMockService;
