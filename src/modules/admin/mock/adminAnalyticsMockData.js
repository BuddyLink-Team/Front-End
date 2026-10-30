// Seed data of the dashboard (admin portal, `npm run dev:admin:mock`)

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60 * 1000).toISOString();

export const buildInitialMockNotifications = () => [
  {
    id: 'notif-001',
    category: 'safety',
    type: 'new_violation_report',
    severity: 'critical',
    title: 'Báo cáo vi phạm mới cần xử lý',
    message: 'Báo cáo vi phạm mới: Hành vi không phù hợp trong buổi hẹn chơi.',
    entityType: 'Report',
    entityId: 'rep-001',
    isRead: false,
    createdAt: minutesAgo(15),
  },
  {
    id: 'notif-002',
    category: 'payments',
    type: 'payment_failed',
    severity: 'warning',
    title: 'Thanh toán thất bại',
    message: 'Giao dịch đơn hàng #120045 đã thất bại hoặc bị huỷ.',
    entityType: 'Payment',
    entityId: 'pay-002',
    isRead: false,
    createdAt: minutesAgo(60),
  },
  {
    id: 'notif-003',
    category: 'users',
    type: 'new_signup',
    severity: 'info',
    title: 'Đăng ký tài khoản mới',
    message: 'Phụ huynh Lê Minh Châu vừa tạo tài khoản trên hệ thống.',
    entityType: 'User',
    entityId: 'user-004',
    isRead: false,
    createdAt: minutesAgo(180),
  },
  {
    id: 'notif-004',
    category: 'playdates',
    type: 'created',
    severity: 'info',
    title: 'Buổi hẹn chơi mới được tạo',
    message: 'Buổi hẹn "Dã ngoại ngoài trời" vừa được tạo bởi Trần Thị Bình.',
    entityType: 'Playdate',
    entityId: 'pd-005',
    isRead: true,
    createdAt: minutesAgo(300),
  },
  {
    id: 'notif-005',
    category: 'connections',
    type: 'new_connection',
    severity: 'info',
    title: 'Kết nối mới được thiết lập',
    message: 'Hai phụ huynh vừa kết nối thành công với nhau.',
    entityType: 'Connection',
    entityId: 'conn-001',
    isRead: true,
    createdAt: minutesAgo(600),
  },
  {
    id: 'notif-006',
    category: 'system',
    type: 'cron_job_failed',
    severity: 'critical',
    title: 'Lỗi tác vụ định kỳ hệ thống',
    message: 'Tác vụ "PlaydateReminderJob" gặp sự cố: kết nối bị gián đoạn.',
    entityType: 'System',
    entityId: null,
    isRead: true,
    createdAt: minutesAgo(1440),
  },
];

// What the simulated socket sends, one after the other
export const MOCK_REALTIME_NOTIFICATIONS = [
  {
    category: 'users',
    type: 'new_signup',
    severity: 'info',
    title: 'Đăng ký tài khoản mới',
    message: 'Phụ huynh Nguyễn Hoàng Anh vừa tạo tài khoản trên hệ thống.',
    entityType: 'User',
    entityId: 'user-010',
  },
  {
    category: 'payments',
    type: 'payment_succeeded',
    severity: 'info',
    title: 'Thanh toán thành công',
    message: 'Đơn hàng #120046 (99.000 ₫) đã thanh toán thành công.',
    entityType: 'Payment',
    entityId: 'pay-010',
  },
  {
    category: 'safety',
    type: 'new_violation_report',
    severity: 'critical',
    title: 'Báo cáo vi phạm mới cần xử lý',
    message: 'Báo cáo vi phạm mới: Nội dung không phù hợp.',
    entityType: 'Report',
    entityId: 'rep-010',
  },
];

export const MOCK_ANALYTICS_TOP_PARENTS = [
  { parentId: 'parent-1', fullName: 'Nguyễn Thị Hương', email: 'huong.nguyen@example.com', requestCount: 142 },
  { parentId: 'parent-2', fullName: 'Trần Văn Long', email: 'long.tran@example.com', requestCount: 98 },
  { parentId: 'parent-3', fullName: 'Phạm Minh Tuấn', email: 'tuan.pham@example.com', requestCount: 85 },
  { parentId: 'parent-4', fullName: 'Đỗ Thúy Vy', email: 'vy.do@example.com', requestCount: 64 },
  { parentId: 'parent-5', fullName: 'Vũ Đức Nam', email: 'nam.vu@example.com', requestCount: 52 },
];

export const MOCK_ANALYTICS_AGE_GROUPS = [
  { group: '0-2 tuổi', count: 310 },
  { group: '3-5 tuổi', count: 540 },
  { group: '6-10 tuổi', count: 450 },
  { group: '11+ tuổi', count: 120 },
];
