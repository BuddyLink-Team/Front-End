import { INITIAL_MOCK_NOTIFICATIONS } from './notificationMockData';

const STORAGE_KEY = 'buddylink_mock_notifications_v1';
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
const ok = (data, message = 'OK') => ({ success: true, message, data, error: null });

class NotificationMockService {
  _getAll() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    this._saveAll(INITIAL_MOCK_NOTIFICATIONS);
    return structuredClone(INITIAL_MOCK_NOTIFICATIONS);
  }

  _saveAll(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Storage unavailable
    }
  }

  async getNotifications({ page = 1, limit = 10, type, isRead } = {}) {
    await delay();
    let list = this._getAll();

    if (type) {
      // Same contract as the BE: "a,b" or an array means any of these types
      const types = Array.isArray(type)
        ? type
        : String(type).split(',').map((t) => t.trim()).filter(Boolean);
      list = list.filter((n) => types.includes(n.type));
    }
    if (isRead === 'true' || isRead === true) {
      list = list.filter((n) => n.isRead === true);
    } else if (isRead === 'false' || isRead === false) {
      list = list.filter((n) => n.isRead === false);
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const total = list.length;
    const unreadCount = this._getAll().filter((n) => !n.isRead).length;

    const start = (pageNum - 1) * limitNum;
    const items = list.slice(start, start + limitNum);

    return ok({
      items,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  }

  async getUnreadCount() {
    await delay(50);
    const unreadCount = this._getAll().filter((n) => !n.isRead).length;
    return ok({ unreadCount });
  }

  async markAsRead(id) {
    await delay();
    const list = this._getAll();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      item.readAt = new Date().toISOString();
      this._saveAll(list);
    }
    const unreadCount = list.filter((n) => !n.isRead).length;
    return ok({ notification: item, unreadCount });
  }

  async markAllAsRead() {
    await delay();
    const list = this._getAll();
    let count = 0;
    list.forEach((n) => {
      if (!n.isRead) {
        n.isRead = true;
        n.readAt = new Date().toISOString();
        count += 1;
      }
    });
    this._saveAll(list);
    return ok({ updatedCount: count, unreadCount: 0 });
  }
}

export const notificationMockService = new NotificationMockService();
export default notificationMockService;
