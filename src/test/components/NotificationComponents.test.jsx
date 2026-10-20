import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../utils/testUtils';
import NotificationDropdown from '../../modules/notification/components/NotificationDropdown';
import NotificationPage from '../../modules/notification/pages/NotificationPage';

const { mockNotifications } = vi.hoisted(() => ({
  mockNotifications: [
    {
      id: 'notif-1',
      recipientId: 'user-1',
      type: 'connection_request',
      title: 'Lời mời kết nối mới',
      body: 'Trần Mai Hoa muốn kết nối với bạn',
      data: {
        senderId: 'parent-hoa',
        sender: {
          id: 'parent-hoa',
          fullName: 'Trần Mai Hoa',
          avatarUrl: '',
        },
      },
      isRead: false,
      readAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      recipientId: 'user-1',
      type: 'badge_unlocked',
      title: 'Huy hiệu mới!',
      body: 'Mở khóa huy hiệu Người kết nối',
      data: { badgeCode: 'SUPER_CONNECTOR' },
      isRead: true,
      readAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ],
}));

vi.mock('../../modules/notification/api/notification.api', () => ({
  notificationApi: {
    getNotifications: vi.fn().mockImplementation(() =>
      Promise.resolve({
        data: {
          success: true,
          data: {
            items: mockNotifications,
            unreadCount: 1,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
          },
        },
      })
    ),
    getUnreadCount: vi.fn().mockImplementation(() =>
      Promise.resolve({
        data: {
          success: true,
          data: { unreadCount: 1 },
        },
      })
    ),
    markAsRead: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: { notification: {}, unreadCount: 0 },
      },
    }),
    markAllAsRead: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: { updatedCount: 1, unreadCount: 0 },
      },
    }),
  },
  default: {
    getNotifications: vi.fn().mockImplementation(() =>
      Promise.resolve({
        data: {
          success: true,
          data: {
            items: mockNotifications,
            unreadCount: 1,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
          },
        },
      })
    ),
    getUnreadCount: vi.fn().mockImplementation(() =>
      Promise.resolve({
        data: {
          success: true,
          data: { unreadCount: 1 },
        },
      })
    ),
    markAsRead: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: { notification: {}, unreadCount: 0 },
      },
    }),
    markAllAsRead: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: { updatedCount: 1, unreadCount: 0 },
      },
    }),
  },
}));

describe('NotificationDropdown Component', () => {
  it('renders bell button with unread count badge', () => {
    renderWithProviders(<NotificationDropdown />, {
      preloadedState: {
        notification: {
          items: mockNotifications,
          unreadCount: 1,
          isLoading: false,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        },
      },
    });

    const bellBtn = screen.getByRole('button', { name: /thông báo/i });
    expect(bellBtn).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('opens popover on click and shows notifications with mark read action', async () => {
    const user = userEvent.setup();

    renderWithProviders(<NotificationDropdown />, {
      preloadedState: {
        notification: {
          items: mockNotifications,
          unreadCount: 1,
          isLoading: false,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        },
      },
    });

    const bellBtn = screen.getByRole('button', { name: /thông báo/i });
    await user.click(bellBtn);

    // Popover header
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: 'Thông báo' })).toBeInTheDocument();
      expect(screen.getByText('1 mới')).toBeInTheDocument();
      expect(screen.getByTitle('Đánh dấu tất cả đã đọc')).toBeInTheDocument();
    });

    // List items
    expect(screen.getByText('Lời mời kết nối mới')).toBeInTheDocument();
    expect(screen.getByText('Huy hiệu mới!')).toBeInTheDocument();
    expect(screen.getByText('Xem tất cả lịch sử thông báo')).toBeInTheDocument();
  });
});

describe('NotificationPage Component', () => {
  it('renders page header, category tabs, and notification cards', async () => {
    renderWithProviders(<NotificationPage />, {
      preloadedState: {
        notification: {
          items: mockNotifications,
          unreadCount: 1,
          isLoading: false,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
          activeTab: 'all',
        },
      },
    });

    // Heading
    expect(
      screen.getByRole('heading', { level: 1, name: 'Lịch sử thông báo' })
    ).toBeInTheDocument();

    // Tabs
    expect(screen.getByRole('button', { name: 'Tất cả' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kết nối' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lời mời Playdate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Huy hiệu & Thành tích' })).toBeInTheDocument();

    // Unread toggle
    expect(screen.getByRole('button', { name: /chỉ xem chưa đọc/i })).toBeInTheDocument();

    // Cards
    await waitFor(() => {
      expect(screen.getByText('Trần Mai Hoa muốn kết nối với bạn')).toBeInTheDocument();
      expect(screen.getByText('Mở khóa huy hiệu Người kết nối')).toBeInTheDocument();
    });
  });
});
