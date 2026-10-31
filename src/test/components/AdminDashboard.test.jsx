import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest';
import { act } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../utils/testUtils';
import { StatCard } from '../../components/cards/StatCard';
import { AdminDashboardPage } from '../../modules/admin/pages/AdminDashboardPage';
import { AdminHeader } from '../../modules/admin/components/AdminHeader';
import { useAdminNotificationSocket } from '../../modules/admin/hooks/useAdminNotificationSocket';
import { ADMIN_SOCKET_EVENTS } from '../../modules/admin/constants/dashboard.constants';
import { adminApi } from '../../modules/admin/api/adminApi';
import adminAnalyticsMockService from '../../modules/admin/mock/adminAnalyticsMockService';

const { toastMock, socketMock } = vi.hoisted(() => {
  const handlers = new Map();
  return {
    toastMock: { success: vi.fn(), error: vi.fn(), toast: { error: vi.fn() } },
    socketMock: {
      connected: true,
      disconnect: vi.fn(),
      on: (event, handler) => handlers.set(event, handler),
      off: (event) => handlers.delete(event),
      emit: (event, payload) => handlers.get(event)?.(payload),
      clear: () => handlers.clear(),
    },
  };
});

vi.mock('../../hooks/useToast', () => ({ useToast: () => toastMock }));
vi.mock('../../services/adminSocket', () => {
  const service = { connect: () => socketMock, disconnect: socketMock.disconnect };
  return { default: service, adminSocketService: service };
});
vi.mock('../../modules/admin/api/adminApi', () => ({
  adminApi: {
    getAnalytics: vi.fn(),
    getNotifications: vi.fn(),
    getUnreadNotificationCount: vi.fn(),
    markNotificationAsRead: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
  },
}));

const notification = (id, extra = {}) => ({
  id,
  category: 'users',
  type: 'new_signup',
  severity: 'info',
  title: `Tiêu đề ${id}`,
  message: `Nội dung ${id}`,
  entityType: 'User',
  entityId: `user-${id}`,
  isRead: false,
  createdAt: '2026-10-30T03:00:00.000Z',
  ...extra,
});

const page = (items, { current = 1, totalPages = 1 } = {}) => ({
  items,
  pagination: { page: current, limit: 20, total: items.length, totalPages },
});

const unread = (total) => ({ total, byCategory: { users: total, payments: 0, playdates: 0, connections: 0, safety: 0, system: 0 } });

// What AdminLayout mounts: the socket hook, the bell and the page
const Portal = () => {
  useAdminNotificationSocket();
  const { pathname, state } = useLocation();
  return (
    <>
      <AdminHeader isSidebarCollapsed={false} onToggleSidebar={vi.fn()} onOpenMenu={vi.fn()} />
      <Routes>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="*" element={<p>Trang {pathname} {state?.openUserId}</p>} />
      </Routes>
    </>
  );
};

const renderPortal = (route = '/admin/dashboard') => renderWithProviders(<Portal />, { route });

const bell = () => screen.getByRole('button', { name: /Thông báo hệ thống/ });

const openNotificationTab = async () => {
  fireEvent.click(bell());
  await screen.findByText('Sự kiện hệ thống');
};

describe('StatCard', () => {
  it('shows skeletons instead of the value while loading', () => {
    renderWithProviders(<StatCard title="KPI" value="12" change="+5%" isLoading />);

    expect(screen.getByTestId('stat-card-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('12')).not.toBeInTheDocument();
    expect(screen.queryByText('+5%')).not.toBeInTheDocument();
  });

  it('marks an increase and a decrease with an icon and a color', () => {
    renderWithProviders(
      <>
        <StatCard title="Up" value="1" change="+5%" />
        <StatCard title="Down" value="2" change="-3%" />
      </>
    );

    expect(screen.getByText('+5%').parentElement.className).toContain('text-primary-dark');
    expect(screen.getByText('+5%').parentElement.querySelector('svg')).not.toBeNull();
    expect(screen.getByText('-3%').parentElement.className).toContain('text-error');
    expect(screen.getByText('-3%').parentElement.querySelector('svg')).not.toBeNull();
  });
});

describe('AdminDashboardPage', () => {
  let analytics;

  beforeEach(async () => {
    vi.clearAllMocks();
    socketMock.clear();
    socketMock.connected = true;
    localStorage.clear();
    ({ data: analytics } = await adminAnalyticsMockService.getAnalytics({ groupBy: 'week' }));
    adminApi.getAnalytics.mockResolvedValue({ data: analytics });
    adminApi.getNotifications.mockResolvedValue({ data: page([]) });
    adminApi.getUnreadNotificationCount.mockResolvedValue({ data: unread(0) });
    adminApi.markNotificationAsRead.mockResolvedValue({ data: {} });
    adminApi.markAllNotificationsAsRead.mockResolvedValue({ data: { modifiedCount: 1 } });
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn();
        disconnect = vi.fn();
      }
    );
  });

  // Kept until the end of the file: an answer arriving while a test is cleaned up still renders the charts
  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
      }
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  describe('statistics', () => {
    it('loads everything with one analytics call, showing skeletons first', async () => {
      renderPortal();

      expect(screen.getAllByTestId('stat-card-skeleton')).toHaveLength(9);
      expect(screen.getAllByTestId('dashboard-card-skeleton').length).toBeGreaterThan(0);

      expect((await screen.findAllByText('1.248')).length).toBeGreaterThan(0);
      expect(adminApi.getAnalytics).toHaveBeenCalledTimes(1);
      expect(adminApi.getAnalytics).toHaveBeenCalledWith(expect.objectContaining({ groupBy: 'day' }));
    });

    it('shows — when the previous period is 0', async () => {
      renderPortal();

      expect(await screen.findByText('—')).toBeInTheDocument();
      expect(screen.getByText('chưa có kỳ trước để so sánh')).toBeInTheDocument();
    });

    it('shows an increase and a decrease against the previous period', async () => {
      renderPortal();

      expect((await screen.findByText('+7.3%')).parentElement.className).toContain('text-primary-dark');
      expect(screen.getByText('Giao dịch thành công')).toBeInTheDocument();
      expect(screen.getByText('-10%').parentElement.className).toContain('text-error');
    });

    it('shows an empty state in each block without data', async () => {
      adminApi.getAnalytics.mockResolvedValue({
        data: {
          ...analytics,
          revenue: { ...analytics.revenue, timeline: analytics.revenue.timeline.map((row) => ({ ...row, revenue: 0 })) },
          aiUsage: { ...analytics.aiUsage, timeline: [], topParents: [] },
        },
      });

      renderPortal();

      expect(await screen.findByText('Chưa có doanh thu')).toBeInTheDocument();
      expect(screen.getByText('Chưa có lượt hỏi AI')).toBeInTheDocument();
    });

    it('offers the date presets of the revenue page and changes the grouping with the range', async () => {
      renderPortal();
      await screen.findAllByText('1.248');

      fireEvent.click(screen.getByText('90 ngày'));

      await waitFor(() =>
        expect(adminApi.getAnalytics).toHaveBeenLastCalledWith(expect.objectContaining({ groupBy: 'week' }))
      );
      expect(screen.getByText('Năm nay')).toBeInTheDocument();
    });

    it('does not let a slow answer overwrite a newer one', async () => {
      let answerFirst;
      adminApi.getAnalytics.mockImplementationOnce(() => new Promise((resolve) => { answerFirst = resolve; }));
      adminApi.getAnalytics.mockResolvedValueOnce({
        data: { ...analytics, overview: { ...analytics.overview, totalParents: { value: 2222, previousValue: 1, changePercent: 1 } } },
      });

      renderPortal();
      await waitFor(() => expect(adminApi.getAnalytics).toHaveBeenCalledTimes(1));
      fireEvent.click(screen.getByText('7 ngày'));
      expect(await screen.findByText('2.222')).toBeInTheDocument();

      await act(async () => answerFirst({ data: analytics }));

      expect(screen.getByText('2.222')).toBeInTheDocument();
    });
  });

  describe('notification panel', () => {
    it('opens from the bell, from the statistics tab of the dashboard too', async () => {
      renderPortal();
      expect(screen.queryByText('Sự kiện hệ thống')).not.toBeInTheDocument();

      await openNotificationTab();

      expect(adminApi.getNotifications).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });

    it('bell does not blink and has the size of the parent bell', () => {
      adminApi.getUnreadNotificationCount.mockResolvedValue({ data: unread(3) });
      renderPortal();

      expect(bell().querySelector('svg').getAttribute('class')).toContain('w-6 h-6');
      expect(bell().querySelector('.animate-pulse')).toBeNull();
    });

    it('shows a new notification at the top and keeps bell and panel on the same count', async () => {
      adminApi.getNotifications.mockResolvedValue({ data: page([notification('old')]) });
      adminApi.getUnreadNotificationCount.mockResolvedValue({ data: unread(1) });
      renderPortal();
      await openNotificationTab();
      await screen.findByText('Tiêu đề old');

      act(() => {
        socketMock.emit(ADMIN_SOCKET_EVENTS.NOTIFICATION_NEW, notification('new'));
        socketMock.emit(ADMIN_SOCKET_EVENTS.UNREAD_COUNT, unread(2));
      });

      const titles = screen.getAllByText(/^Tiêu đề /).map((node) => node.textContent);
      expect(titles).toEqual(['Tiêu đề new', 'Tiêu đề old']);
      expect(within(bell()).getByText('2')).toBeInTheDocument();
      expect(within(screen.getByRole('button', { name: /Người dùng/ })).getByText('2')).toBeInTheDocument();
    });

    it('updates bell and panel together when one is marked as read, without the socket', async () => {
      adminApi.getNotifications.mockResolvedValue({ data: page([notification('a'), notification('b')]) });
      adminApi.getUnreadNotificationCount.mockResolvedValue({ data: unread(2) });
      renderPortal();
      await openNotificationTab();
      await screen.findByText('Tiêu đề a');
      await waitFor(() => expect(within(bell()).getByText('2')).toBeInTheDocument());

      adminApi.getUnreadNotificationCount.mockResolvedValue({ data: unread(1) });
      fireEvent.click(screen.getAllByRole('button', { name: 'Đánh dấu đã đọc' })[0]);

      await waitFor(() => expect(within(bell()).getByText('1')).toBeInTheDocument());
      expect(adminApi.markNotificationAsRead).toHaveBeenCalledWith('a');
      expect(screen.getAllByRole('button', { name: 'Đánh dấu đã đọc' })).toHaveLength(1);
    });

    it('toasts critical notifications only, once', () => {
      renderPortal();

      act(() => {
        socketMock.emit(ADMIN_SOCKET_EVENTS.NOTIFICATION_NEW, notification('w', { severity: 'warning' }));
        socketMock.emit(ADMIN_SOCKET_EVENTS.NOTIFICATION_NEW, notification('c', { severity: 'critical' }));
      });

      expect(toastMock.toast.error).toHaveBeenCalledTimes(1);
      expect(toastMock.toast.error).toHaveBeenCalledWith(
        'Tiêu đề c: Nội dung c',
        expect.objectContaining({ id: 'admin-notification-c' })
      );
    });

    it('reads the list again after a reconnection, keeping the filters', async () => {
      renderPortal();
      await openNotificationTab();
      fireEvent.click(screen.getByRole('button', { name: /An toàn/ }));
      await waitFor(() =>
        expect(adminApi.getNotifications).toHaveBeenLastCalledWith({ category: 'safety', page: 1, limit: 20 })
      );
      adminApi.getNotifications.mockClear();
      adminApi.getUnreadNotificationCount.mockClear();

      act(() => {
        socketMock.emit('disconnect');
        socketMock.emit('connect');
      });

      await waitFor(() =>
        expect(adminApi.getNotifications).toHaveBeenCalledWith({ category: 'safety', page: 1, limit: 20 })
      );
      expect(adminApi.getUnreadNotificationCount).toHaveBeenCalled();
    });

    it('filters through the API by category and severity', async () => {
      renderPortal();
      await openNotificationTab();

      fireEvent.click(screen.getByRole('button', { name: /Thanh toán/ }));

      await waitFor(() =>
        expect(adminApi.getNotifications).toHaveBeenLastCalledWith({ category: 'payments', page: 1, limit: 20 })
      );
    });

    it('loads the next page when the end of the list comes into view', async () => {
      let observerCallback;
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          constructor(callback) {
            observerCallback = callback;
          }
          observe = vi.fn();
          disconnect = vi.fn();
        }
      );
      adminApi.getNotifications.mockImplementation(async ({ page: current }) => ({
        data: page([notification(`p${current}`)], { current, totalPages: 2 }),
      }));
      renderPortal();
      await openNotificationTab();
      await screen.findByText('Tiêu đề p1');

      act(() => observerCallback([{ isIntersecting: true }]));

      expect(await screen.findByText('Tiêu đề p2')).toBeInTheDocument();
      expect(screen.getByText('Tiêu đề p1')).toBeInTheDocument();
      expect(adminApi.getNotifications).toHaveBeenLastCalledWith({ page: 2, limit: 20 });
    });

    it('opens the matching detail when a notification is clicked', async () => {
      adminApi.getNotifications.mockResolvedValue({ data: page([notification('a')]) });
      renderPortal();
      await openNotificationTab();

      fireEvent.click(await screen.findByText('Tiêu đề a'));

      expect(await screen.findByText(/Trang \/admin\/users user-a/)).toBeInTheDocument();
      expect(adminApi.markNotificationAsRead).toHaveBeenCalledWith('a');
    });

    it('stops the socket when the portal is left', () => {
      const { unmount } = renderPortal();

      unmount();

      expect(socketMock.disconnect).toHaveBeenCalled();
    });
  });
});
