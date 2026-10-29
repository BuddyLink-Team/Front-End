import dayjs from 'dayjs';

let mockNotifications = [
  {
    _id: 'notif-001',
    category: 'safety',
    severity: 'critical',
    title: 'Báo cáo vi phạm nghiêm trọng',
    message: 'Phụ huynh Nguyễn Văn A báo cáo hành vi quấy rối tại Playdate Công viên Tao Đàn.',
    entityType: 'report',
    entityId: 'rep-001',
    isRead: false,
    createdAt: dayjs().subtract(15, 'minute').toISOString(),
  },
  {
    _id: 'notif-002',
    category: 'payments',
    severity: 'warning',
    title: 'Giao dịch thanh toán thất bại',
    message: 'Giao dịch nâng cấp Premium 499.000đ của Trần Thị B không thành công qua VNPay.',
    entityType: 'payment',
    entityId: 'pay-002',
    isRead: false,
    createdAt: dayjs().subtract(1, 'hour').toISOString(),
  },
  {
    _id: 'notif-003',
    category: 'safety',
    severity: 'critical',
    title: 'Phát hiện nội dung nhạy cảm',
    message: 'Hệ thống tự động gắn cờ ảnh đại diện của hồ sơ bé Hoàng Long (vi phạm quy chuẩn).',
    entityType: 'child',
    entityId: 'child-003',
    isRead: false,
    createdAt: dayjs().subtract(2, 'hour').toISOString(),
  },
  {
    _id: 'notif-004',
    category: 'users',
    severity: 'info',
    title: 'Phụ huynh xác minh danh tính',
    message: 'Phụ huynh Lê Minh C vừa hoàn tất xác minh eKYC tài khoản thành công.',
    entityType: 'user',
    entityId: 'user-004',
    isRead: false,
    createdAt: dayjs().subtract(3, 'hour').toISOString(),
  },
  {
    _id: 'notif-005',
    category: 'playdates',
    severity: 'info',
    title: 'Buổi Playdate hoàn thành tốt đẹp',
    message: 'Buổi giao lưu cờ vua tại Thảo Cầm Viên đã hoàn thành với đánh giá 5 sao.',
    entityType: 'playdate',
    entityId: 'pd-005',
    isRead: true,
    createdAt: dayjs().subtract(5, 'hour').toISOString(),
  },
  {
    _id: 'notif-006',
    category: 'system',
    severity: 'info',
    title: 'Sao lưu dữ liệu định kỳ',
    message: 'Hệ thống đã hoàn tất bản sao lưu cơ sở dữ liệu tự động hằng ngày.',
    entityType: 'system',
    entityId: null,
    isRead: true,
    createdAt: dayjs().subtract(1, 'day').toISOString(),
  },
];

export const adminAnalyticsMockService = {
  getAnalytics({ fromDate, toDate, groupBy = 'day' } = {}) {
    const from = fromDate || dayjs().subtract(29, 'day').format('YYYY-MM-DD');
    const to = toDate || dayjs().format('YYYY-MM-DD');

    // Generate timeline data
    const daysCount = Math.max(7, Math.min(30, dayjs(to).diff(dayjs(from), 'day') + 1));
    const userGrowth = [];
    const revenue = [];
    const playdateTimeline = [];
    const aiTimeline = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = dayjs(to).subtract(i, 'day').format('YYYY-MM-DD');
      userGrowth.push({
        date: d,
        newParents: Math.floor(Math.random() * 8) + 2,
        activeUsers: Math.floor(Math.random() * 35) + 15,
      });
      revenue.push({
        date: d,
        revenue: (Math.floor(Math.random() * 5) + 1) * 299000,
      });
      playdateTimeline.push({
        date: d,
        count: Math.floor(Math.random() * 6) + 1,
      });
      aiTimeline.push({
        date: d,
        requests: Math.floor(Math.random() * 40) + 10,
      });
    }

    return {
      filter: { fromDate: from, toDate: to, groupBy },
      summary: {
        parents: {
          total: 1248,
          current: 85,
          previous: 76,
          changePercent: 11.8,
        },
        activeUsers: {
          current: 512,
          previous: 480,
          changePercent: 6.7,
        },
        children: {
          total: 1420,
          current: 92,
          previous: 80,
          changePercent: 15.0,
        },
        playdates: {
          total: 3450,
          current: 230,
          previous: 210,
          changePercent: 9.5,
        },
        connections: {
          accepted: 890,
          currentAccepted: 72,
          previousAccepted: 65,
          changePercent: 10.8,
          acceptanceRate: 85.2,
        },
        subscriptions: {
          active: 310,
          current: 45,
          previous: 38,
          changePercent: 18.4,
          byPlan: {
            free: 938,
            premiumMonthly: 210,
            premiumYearly: 100,
          },
        },
        revenue: {
          current: 36750000,
          previous: 32500000,
          changePercent: 13.1,
          currency: 'VND',
        },
        aiUsage: {
          currentRequests: 1840,
          previousRequests: 1620,
          changePercent: 13.6,
          totalTokens: 482000,
        },
      },
      charts: {
        userGrowth,
        revenue,
        conversionFunnel: [
          { step: 'registered', count: 1248, dropRate: null },
          { step: 'withChildProfile', count: 1080, dropRate: 13.5 },
          { step: 'firstConnection', count: 890, dropRate: 17.6 },
          { step: 'firstPlaydate', count: 650, dropRate: 27.0 },
          { step: 'paid', count: 310, dropRate: 52.3 },
        ],
        playdates: {
          byStatus: [
            { status: 'completed', count: 3200 },
            { status: 'scheduled', count: 120 },
            { status: 'in_progress', count: 15 },
            { status: 'cancelled', count: 115 },
          ],
          timeline: playdateTimeline,
        },
        connections: {
          byStatus: [
            { status: 'accepted', count: 890 },
            { status: 'pending', count: 65 },
            { status: 'rejected', count: 42 },
            { status: 'cancelled', count: 28 },
            { status: 'disconnected', count: 19 },
          ],
        },
        subscriptions: {
          byPlan: [
            { plan: 'free', count: 938 },
            { plan: 'premium_monthly', count: 210 },
            { plan: 'premium_yearly', count: 100 },
          ],
        },
        aiUsage: {
          timeline: aiTimeline,
          topUsers: [
            { userId: 'u1', name: 'Nguyễn Thị Hương', email: 'huong.nguyen@example.com', requests: 142, tokens: 41200 },
            { userId: 'u2', name: 'Trần Văn Long', email: 'long.tran@example.com', requests: 98, tokens: 28500 },
            { userId: 'u3', name: 'Phạm Minh Tuấn', email: 'tuan.pham@example.com', requests: 85, tokens: 24100 },
            { userId: 'u4', name: 'Đỗ Thúy Vy', email: 'vy.do@example.com', requests: 64, tokens: 18900 },
            { userId: 'u5', name: 'Vũ Đức Nam', email: 'nam.vu@example.com', requests: 52, tokens: 15400 },
          ],
        },
        childAgeGroups: [
          { group: '0-2 tuổi', count: 310 },
          { group: '3-5 tuổi', count: 540 },
          { group: '6-10 tuổi', count: 450 },
          { group: '11+ tuổi', count: 120 },
        ],
      },
    };
  },

  getNotifications({ category, severity, isRead, page = 1, limit = 20 } = {}) {
    let items = [...mockNotifications];
    if (category && category !== 'all') {
      items = items.filter((n) => n.category === category);
    }
    if (severity && severity !== 'all') {
      items = items.filter((n) => n.severity === severity);
    }
    if (typeof isRead === 'boolean') {
      items = items.filter((n) => n.isRead === isRead);
    }

    const total = items.length;
    const offset = (Number(page) - 1) * Number(limit);
    const paged = items.slice(offset, offset + Number(limit));

    return {
      items: paged,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  },

  getUnreadCount() {
    const unreadItems = mockNotifications.filter((n) => !n.isRead);
    const byCategory = {
      users: 0,
      payments: 0,
      playdates: 0,
      connections: 0,
      safety: 0,
      system: 0,
    };
    for (const item of unreadItems) {
      if (byCategory[item.category] !== undefined) {
        byCategory[item.category]++;
      }
    }
    return {
      total: unreadItems.length,
      byCategory,
    };
  },

  markAsRead(id) {
    mockNotifications = mockNotifications.map((n) => (n._id === id ? { ...n, isRead: true } : n));
    return { success: true };
  },

  markAllAsRead(category) {
    mockNotifications = mockNotifications.map((n) => {
      if (!category || category === 'all' || n.category === category) {
        return { ...n, isRead: true };
      }
      return n;
    });
    return { success: true };
  },
};

export default adminAnalyticsMockService;
