import { describe, it, expect } from 'vitest';
import reducer, {
  fetchNotifications,
  receiveRealtimeNotification,
  realtimeNotificationRead,
  realtimeAllRead,
  setActiveTab,
  clearNotifications,
} from '../../modules/notification/redux/notificationSlice';
import { NOTIFICATION_TABS } from '../../modules/notification/constants/notification.constants';

const sampleNotification = (id = 'n1', isRead = false) => ({
  id,
  type: 'connection_request',
  title: 'Lời mời kết nối mới',
  body: 'Trần Mai Hoa đã gửi lời mời kết nối',
  data: { senderId: 'p1' },
  isRead,
  readAt: isRead ? '2026-10-19T10:00:00.000Z' : null,
  createdAt: '2026-10-19T09:00:00.000Z',
});

describe('notificationSlice', () => {
  it('returns initial state with empty items and zero unreadCount', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state.items).toEqual([]);
    expect(state.unreadCount).toBe(0);
    expect(state.activeTab).toBe(NOTIFICATION_TABS.ALL);
    expect(state.isLoading).toBe(false);
  });

  it('fetchNotifications.fulfilled stores notifications, unreadCount, and pagination', () => {
    const payload = {
      items: [sampleNotification('n1'), sampleNotification('n2', true)],
      unreadCount: 1,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    };
    const state = reducer(undefined, fetchNotifications.fulfilled(payload, 'req', {}));
    expect(state.items).toHaveLength(2);
    expect(state.unreadCount).toBe(1);
    expect(state.pagination.total).toBe(2);
    expect(state.isLoading).toBe(false);
  });

  it('receiveRealtimeNotification prepends item and increments unreadCount', () => {
    const initial = reducer(
      undefined,
      fetchNotifications.fulfilled(
        { items: [sampleNotification('n1')], unreadCount: 1, pagination: { total: 1 } },
        'req',
        {}
      )
    );

    const newNotif = sampleNotification('n2');
    const state = reducer(initial, receiveRealtimeNotification(newNotif));

    expect(state.items).toHaveLength(2);
    expect(state.items[0].id).toBe('n2');
    expect(state.unreadCount).toBe(2);
    expect(state.pagination.total).toBe(2);

    // Duplicate notifications are ignored
    const dupState = reducer(state, receiveRealtimeNotification(newNotif));
    expect(dupState.items).toHaveLength(2);
  });

  it('realtimeNotificationRead marks notification as read and updates unreadCount', () => {
    const initial = reducer(
      undefined,
      fetchNotifications.fulfilled(
        { items: [sampleNotification('n1', false)], unreadCount: 1 },
        'req',
        {}
      )
    );

    const state = reducer(
      initial,
      realtimeNotificationRead({ notificationId: 'n1', unreadCount: 0 })
    );

    expect(state.items[0].isRead).toBe(true);
    expect(state.items[0].readAt).toBeTruthy();
    expect(state.unreadCount).toBe(0);
  });

  it('realtimeAllRead marks all notifications as read and resets unreadCount', () => {
    const initial = reducer(
      undefined,
      fetchNotifications.fulfilled(
        {
          items: [sampleNotification('n1', false), sampleNotification('n2', false)],
          unreadCount: 2,
        },
        'req',
        {}
      )
    );

    const state = reducer(initial, realtimeAllRead());
    expect(state.items.every((n) => n.isRead)).toBe(true);
    expect(state.unreadCount).toBe(0);
  });

  it('setActiveTab changes the current active tab', () => {
    const state = reducer(undefined, setActiveTab(NOTIFICATION_TABS.PLAYDATE));
    expect(state.activeTab).toBe(NOTIFICATION_TABS.PLAYDATE);
  });

  it('clearNotifications resets state on logout', () => {
    const loaded = reducer(
      undefined,
      fetchNotifications.fulfilled(
        { items: [sampleNotification('n1')], unreadCount: 1 },
        'req',
        {}
      )
    );
    const cleared = reducer(loaded, clearNotifications());
    expect(cleared.items).toEqual([]);
    expect(cleared.unreadCount).toBe(0);
  });
});
