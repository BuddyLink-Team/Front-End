import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildChildrenReportSheets,
  buildConnectionsReportSheets,
  buildDashboardReportSheets,
  buildPlaydatesReportSheets,
  buildUsersReportSheets,
  createWorkbookBlob,
  fetchAllPages,
  getExportFileName,
  MONEY_FORMAT,
} from '../../modules/admin/utils/excelExport';
import { adminAnalyticsMockService } from '../../modules/admin/mock/adminAnalyticsMockService';
import { createAdminMockSocket } from '../../modules/admin/mock/adminMockSocket';
import { ADMIN_SOCKET_EVENTS } from '../../modules/admin/constants/dashboard.constants';
import adminReducer, {
  adminNotificationReceived,
  fetchAdminNotifications,
  resetAdminNotifications,
} from '../../modules/admin/redux/adminSlice';

// Rows as the API sends them (admin.dto.js)
const USER_ROW = {
  id: 'u1',
  fullName: 'Nguyễn An',
  email: 'an@example.com',
  phone: '0901234567',
  isActive: false,
  isVerifiedParent: true,
  childrenCount: 2,
  currentPlan: { planCode: 'premium_monthly', isPremium: true, endDate: '2026-11-01T00:00:00.000Z' },
  createdAt: '2026-10-01T03:30:00.000Z',
};
const CHILD_ROW = {
  id: 'c1',
  displayName: 'Bé Bo',
  age: 5,
  gender: 'boy',
  parentName: 'Mẹ Bo',
  isArchived: false,
  visibility: 'plan_locked',
  createdAt: '2026-10-01T03:30:00.000Z',
};
const PLAYDATE_ROW = {
  id: 'p1',
  activity: 'Dã ngoại',
  scheduledDate: '2026-10-25T00:00:00.000Z',
  time: '09:00',
  locationName: 'Công viên Tao Đàn',
  host: { parent: { fullName: 'Host' }, child: { displayName: 'Bé A' } },
  numberOfParticipants: 3,
  status: 'completed',
  createdAt: '2026-10-01T03:30:00.000Z',
};
const CONNECTION_ROW = {
  id: 'k1',
  requester: { fullName: 'Người gửi' },
  recipient: { fullName: 'Người nhận' },
  status: 'accepted',
  connectedAt: '2026-10-02T03:30:00.000Z',
  createdAt: '2026-10-01T03:30:00.000Z',
};

describe('fetchAllPages', () => {
  it('reads every page, 100 rows at a time', async () => {
    const fetchPage = vi.fn(async ({ page }) => ({
      items: [`row-${page}`],
      pagination: { totalPages: 3 },
    }));

    expect(await fetchAllPages(fetchPage)).toEqual(['row-1', 'row-2', 'row-3']);
    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(fetchPage).toHaveBeenCalledWith({ page: 2, limit: 100 });
  });

  it('leaves out empty filters, which the API would refuse', async () => {
    const fetchPage = vi.fn(async () => ({ items: [], pagination: { totalPages: 1 } }));

    await fetchAllPages(fetchPage, { search: '', isVerified: '', status: undefined, gender: 'boy' });

    expect(fetchPage).toHaveBeenCalledWith({ gender: 'boy', page: 1, limit: 100 });
  });
});

describe('getExportFileName', () => {
  it('follows buddylink-<page>-YYYYMMDD-HHmm.xlsx', () => {
    expect(getExportFileName('dashboard')).toMatch(/^buddylink-dashboard-\d{8}-\d{4}\.xlsx$/);
  });
});

describe('buildDashboardReportSheets', () => {
  const getSheets = async () => {
    const { data } = await adminAnalyticsMockService.getAnalytics({
      fromDate: '2026-10-01',
      toDate: '2026-10-05',
    });
    return buildDashboardReportSheets({ analytics: data });
  };

  it('has the 7 sheets of the dashboard report', async () => {
    expect((await getSheets()).map((sheet) => sheet.name)).toEqual([
      'Tổng quan KPI',
      'Tăng trưởng người dùng',
      'Doanh thu',
      'Phễu chuyển đổi',
      'Hẹn chơi',
      'Thuê bao',
      'Sử dụng AI',
    ]);
  });

  it('shows — when there is no previous period, and money on the revenue row', async () => {
    const [kpi] = await getSheets();

    expect(kpi.rows.find((row) => row.label === 'Premium đang hiệu lực').change).toBe('—');
    expect(kpi.rows.find((row) => row.label === 'Tổng doanh thu').numFmt).toBe(MONEY_FORMAT);
    expect(kpi.rows.find((row) => row.label === 'Giao dịch thành công')).toMatchObject({ value: 123, previousValue: 110 });
  });

  it('uses the period labels, not raw keys', async () => {
    const sheets = await getSheets();

    expect(sheets[1].rows[0].label).toBe('01/10');
    expect(sheets[2].columns.find((column) => column.key === 'revenue').numFmt).toBe(MONEY_FORMAT);
    expect(sheets[1].rows[0].newParents).toEqual(expect.any(Number));
    expect(sheets[5].rows.map((row) => row.label)).toEqual(['Gói Miễn phí', 'Premium tháng', 'Premium năm']);
  });
});

describe('list report sheets', () => {
  const stats = { total: 1 };

  it('parents, from the list DTO', () => {
    const [statsSheet, list] = buildUsersReportSheets({ users: [USER_ROW], stats });

    expect(statsSheet.rows.find((row) => row.label === 'Tổng số tài khoản phụ huynh').value).toBe(1);
    expect(list.rows[0]).toMatchObject({
      fullName: 'Nguyễn An',
      phone: '0901234567',
      status: 'Đã khóa',
      isVerified: 'Đã xác minh',
      childrenCount: 2,
    });
    expect(list.rows[0].plan).not.toBe('Gói Miễn phí');
    expect(list.rows[0].createdAt).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
  });

  it('child profiles, without columns the list DTO does not have', () => {
    const [, list] = buildChildrenReportSheets({ children: [CHILD_ROW], stats });

    expect(list.columns.map((column) => column.key)).toEqual([
      'displayName',
      'parentName',
      'gender',
      'age',
      'status',
      'isPlanLocked',
      'createdAt',
    ]);
    expect(list.rows[0]).toMatchObject({ gender: 'Bé trai', age: 5, status: 'Chưa xóa', isPlanLocked: 'Bị khóa' });
  });

  it('playdates, from the list DTO', () => {
    const [, list] = buildPlaydatesReportSheets({ playdates: [PLAYDATE_ROW], stats });

    expect(list.rows[0]).toMatchObject({
      activity: 'Dã ngoại',
      hostName: 'Host',
      hostChild: 'Bé A',
      location: 'Công viên Tao Đàn',
      status: 'Đã hoàn thành',
      participantsCount: 3,
    });
    expect(list.rows[0].scheduledDate).toMatch(/^\d{2}\/\d{2}\/\d{4} 09:00$/);
  });

  it('connections, from the list DTO', () => {
    const [, list] = buildConnectionsReportSheets({ connections: [CONNECTION_ROW], stats });

    expect(list.rows[0]).toMatchObject({
      requesterName: 'Người gửi',
      recipientName: 'Người nhận',
      status: 'Đã chấp nhận',
    });
  });

  it('creates a workbook with Vietnamese text', async () => {
    const blob = await createWorkbookBlob(buildUsersReportSheets({ users: [USER_ROW], stats }));

    expect(blob.size).toBeGreaterThan(0);
    // exceljs is slow to load when every test file runs at once
  }, 30000);
});

describe('admin analytics mock', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('answers with the shape of the API', async () => {
    const { success, data } = await adminAnalyticsMockService.getAnalytics({
      fromDate: '2026-08-02',
      toDate: '2026-10-30',
      groupBy: 'week',
    });

    expect(success).toBe(true);
    expect(data.overview.totalParents).toEqual(expect.objectContaining({ value: expect.any(Number) }));
    expect(data.userGrowth.timeline.at(-1)).toEqual(
      expect.objectContaining({ period: '2026-W44', label: 'Tuần 44/2026', count: expect.any(Number) })
    );
    expect(data.overview.activeUsers).toBeUndefined();
  });

  it('keeps the read state in localStorage and filters by query strings', async () => {
    const { data: unread } = await adminAnalyticsMockService.getNotifications({ isRead: 'false' });
    const [first] = unread.items;

    await adminAnalyticsMockService.markAsRead(first.id);

    const { data: counts } = await adminAnalyticsMockService.getUnreadCount();
    expect(counts.total).toBe(unread.items.length - 1);
    expect(localStorage.getItem('buddylink_mock_admin_notifications_v1')).toContain(first.id);

    await adminAnalyticsMockService.markAllAsRead('safety');
    const { data: safety } = await adminAnalyticsMockService.getNotifications({ category: 'safety', isRead: 'false' });
    expect(safety.items).toHaveLength(0);
  });

  it('refuses an unknown notification like the API', async () => {
    await expect(adminAnalyticsMockService.markAsRead('nope')).rejects.toMatchObject({
      response: { status: 404, data: { error: { code: 'NOTIFICATION_NOT_FOUND' } } },
    });
  });
});

describe('admin notifications state', () => {
  const pending = (arg, requestId) => fetchAdminNotifications.pending(requestId, arg);
  const fulfilled = (payload, arg, requestId) => fetchAdminNotifications.fulfilled(payload, requestId, arg);
  const reduce = (actions) => actions.reduce(adminReducer, adminReducer(undefined, resetAdminNotifications()));
  const item = (id, extra = {}) => ({ id, category: 'users', severity: 'info', ...extra });
  const pagination = { page: 1, limit: 20, total: 1, totalPages: 2 };

  it('ignores the answer of a request replaced by a newer one', () => {
    const state = reduce([
      pending({ category: 'users', page: 1 }, 'old'),
      pending({ category: 'safety', page: 1 }, 'new'),
      fulfilled({ items: [item('stale')], pagination }, { category: 'users', page: 1 }, 'old'),
    ]);

    expect(state.notifications.items).toEqual([]);
    expect(state.notifications.filters.category).toBe('safety');
  });

  it('appends the next page without duplicates', () => {
    const page1 = { category: 'all', page: 1 };
    const page2 = { category: 'all', page: 2 };
    const state = reduce([
      pending(page1, 'a'),
      fulfilled({ items: [item('1'), item('2')], pagination }, page1, 'a'),
      pending(page2, 'b'),
      fulfilled({ items: [item('2'), item('3')], pagination: { ...pagination, page: 2 } }, page2, 'b'),
    ]);

    expect(state.notifications.items.map(({ id }) => id)).toEqual(['1', '2', '3']);
  });

  it('puts a new notification first, only when it matches the filters', () => {
    const arg = { category: 'safety', page: 1 };
    const state = reduce([
      pending(arg, 'a'),
      fulfilled({ items: [item('old', { category: 'safety' })], pagination }, arg, 'a'),
      adminNotificationReceived(item('other', { category: 'users' })),
      adminNotificationReceived(item('new', { category: 'safety' })),
      adminNotificationReceived(item('new', { category: 'safety' })),
    ]);

    expect(state.notifications.items.map(({ id }) => id)).toEqual(['new', 'old']);
  });
});

describe('admin mock socket', () => {
  it('connects, then sends a notification with the new counts on each tick', () => {
    vi.useFakeTimers();
    localStorage.clear();
    const socket = createAdminMockSocket();
    const onConnect = vi.fn();
    const onNotification = vi.fn();
    const onCount = vi.fn();
    socket.on('connect', onConnect);
    socket.on(ADMIN_SOCKET_EVENTS.NOTIFICATION_NEW, onNotification);
    socket.on(ADMIN_SOCKET_EVENTS.UNREAD_COUNT, onCount);

    vi.advanceTimersByTime(100);
    expect(onConnect).toHaveBeenCalledTimes(1);
    expect(socket.connected).toBe(true);

    vi.advanceTimersByTime(30000);
    expect(onNotification).toHaveBeenCalledTimes(1);
    expect(onNotification.mock.calls[0][0]).toEqual(expect.objectContaining({ id: expect.any(String), isRead: false }));
    expect(onCount.mock.calls[0][0].total).toBeGreaterThan(0);

    socket.disconnect();
    vi.advanceTimersByTime(30000);
    expect(onNotification).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
