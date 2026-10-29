import { describe, it, expect } from 'vitest';
import {
  buildDashboardReportSheets,
  buildUsersReportSheets,
  buildChildrenReportSheets,
  buildPlaydatesReportSheets,
  buildConnectionsReportSheets,
  getExportFileName,
} from '../../modules/admin/utils/excelExport';
import { adminAnalyticsMockService } from '../../modules/admin/mock/adminAnalyticsMockService';

describe('Admin Dashboard Excel Export & Mock Service', () => {
  it('buildDashboardReportSheets generates 5 well-structured worksheets', () => {
    const mockAnalytics = adminAnalyticsMockService.getAnalytics();
    const sheets = buildDashboardReportSheets({ analytics: mockAnalytics });

    expect(sheets).toHaveLength(5);
    expect(sheets.map((s) => s.name)).toEqual([
      'Tổng quan KPIs',
      'Tăng trưởng & Doanh thu',
      'Phễu chuyển đổi',
      'Top phụ huynh dùng AI',
      'Độ tuổi trẻ em',
    ]);

    const kpiSheet = sheets[0];
    expect(kpiSheet.rows.length).toBeGreaterThan(5);
    expect(kpiSheet.columns.map((c) => c.key)).toEqual(['label', 'value', 'previousValue', 'change']);
  });

  it('buildUsersReportSheets generates user oversight sheets', () => {
    const sheets = buildUsersReportSheets({
      users: [
        {
          _id: 'u1',
          fullName: 'Test Parent',
          email: 'parent@example.com',
          phoneNumber: '0901234567',
          isActive: true,
          childrenCount: 2,
          activeSubscription: { planName: 'Premium Tháng' },
        },
      ],
      stats: { total: 1, active: 1, locked: 0 },
    });

    expect(sheets).toHaveLength(2);
    expect(sheets[0].name).toBe('Tổng quan');
    expect(sheets[1].name).toBe('Danh sách phụ huynh');
    expect(sheets[1].rows).toHaveLength(1);
    expect(sheets[1].rows[0].fullName).toBe('Test Parent');
  });

  it('buildChildrenReportSheets generates children oversight sheets', () => {
    const sheets = buildChildrenReportSheets({
      children: [
        {
          _id: 'c1',
          displayName: 'Bé Bo',
          gender: 'boy',
          dateOfBirth: '2020-05-15',
          parent: { fullName: 'Mẹ Bo', email: 'mebo@example.com' },
          interests: ['Bơi lội'],
        },
      ],
      stats: { total: 1, boys: 1, girls: 0 },
    });

    expect(sheets).toHaveLength(2);
    expect(sheets[1].rows[0].displayName).toBe('Bé Bo');
    expect(sheets[1].rows[0].gender).toBe('Bé trai');
  });

  it('buildPlaydatesReportSheets generates playdates oversight sheets', () => {
    const sheets = buildPlaydatesReportSheets({
      playdates: [
        {
          _id: 'p1',
          title: 'Giao lưu cuối tuần',
          status: 'completed',
          creator: { fullName: 'Host Parent' },
          participantChildren: [{ displayName: 'Bé A' }],
          startTime: '2026-10-25T09:00:00Z',
        },
      ],
      stats: { total: 1 },
    });

    expect(sheets).toHaveLength(2);
    expect(sheets[1].rows[0].activity).toBe('Giao lưu cuối tuần');
    expect(sheets[1].rows[0].status).toBe('Đã hoàn thành');
  });

  it('buildConnectionsReportSheets generates connections oversight sheets', () => {
    const sheets = buildConnectionsReportSheets({
      connections: [
        {
          _id: 'conn1',
          status: 'accepted',
          requester: { fullName: 'Parent 1' },
          recipient: { fullName: 'Parent 2' },
          matchedChildCount: 2,
        },
      ],
      stats: { total: 1, accepted: 1 },
    });

    expect(sheets).toHaveLength(2);
    expect(sheets[1].rows[0].status).toBe('Đã kết nối');
  });

  it('getExportFileName formats valid excel filename with timestamp', () => {
    const name = getExportFileName('dashboard');
    expect(name).toMatch(/^buddylink-dashboard-\d{8}-\d{4}\.xlsx$/);
  });

  it('adminAnalyticsMockService provides notification management', () => {
    const unread = adminAnalyticsMockService.getUnreadCount();
    expect(unread).toHaveProperty('total');
    expect(unread).toHaveProperty('byCategory');

    const notifs = adminAnalyticsMockService.getNotifications();
    expect(notifs.items.length).toBeGreaterThan(0);

    const firstId = notifs.items[0]._id;
    adminAnalyticsMockService.markAsRead(firstId);
    const updated = adminAnalyticsMockService.getNotifications();
    const found = updated.items.find((n) => n._id === firstId);
    expect(found.isRead).toBe(true);

    adminAnalyticsMockService.markAllAsRead('safety');
  });
});
