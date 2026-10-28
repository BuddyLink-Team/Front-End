import {
  INITIAL_MOCK_ADMIN_PLAYDATES,
  INITIAL_MOCK_ADMIN_CONNECTIONS,
} from './adminMockData';

const PLAYDATE_STORAGE_KEY = 'buddylink_mock_admin_playdates_v2';
const CONNECTION_STORAGE_KEY = 'buddylink_mock_admin_connections_v2';

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Stateful Mock Service for Admin Playdates & Connections oversight.
 * Simulates server filtering, searching, pagination, force-cancel and soft-remove.
 */
class AdminMockService {
  constructor() {
    this._initStorage();
  }

  _initStorage() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(PLAYDATE_STORAGE_KEY)) {
      this._savePlaydates(INITIAL_MOCK_ADMIN_PLAYDATES);
    }
    if (!localStorage.getItem(CONNECTION_STORAGE_KEY)) {
      this._saveConnections(INITIAL_MOCK_ADMIN_CONNECTIONS);
    }
  }

  _getPlaydates() {
    if (typeof window === 'undefined') return [...INITIAL_MOCK_ADMIN_PLAYDATES];
    try {
      const stored = localStorage.getItem(PLAYDATE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [...INITIAL_MOCK_ADMIN_PLAYDATES];
    } catch {
      return [...INITIAL_MOCK_ADMIN_PLAYDATES];
    }
  }

  _savePlaydates(items) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PLAYDATE_STORAGE_KEY, JSON.stringify(items));
  }

  _getConnections() {
    if (typeof window === 'undefined') return [...INITIAL_MOCK_ADMIN_CONNECTIONS];
    try {
      const stored = localStorage.getItem(CONNECTION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [...INITIAL_MOCK_ADMIN_CONNECTIONS];
    } catch {
      return [...INITIAL_MOCK_ADMIN_CONNECTIONS];
    }
  }

  _saveConnections(items) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CONNECTION_STORAGE_KEY, JSON.stringify(items));
  }

  /**
   * Reset local storage state back to factory seed data
   */
  resetFactoryData() {
    this._savePlaydates(INITIAL_MOCK_ADMIN_PLAYDATES);
    this._saveConnections(INITIAL_MOCK_ADMIN_CONNECTIONS);
  }

  /**
   * GET /api/v1/admin/playdates
   */
  async getPlaydateStats() {
    await delay();
    const items = this._getPlaydates();
    const countOf = (status) => items.filter((p) => p.status === status).length;
    return {
      success: true,
      data: { total: items.length, upcoming: countOf('upcoming'), completed: countOf('completed'), cancelled: countOf('cancelled') },
    };
  }

  async getPlaydates(params = {}) {
    await delay();
    const { status, search, fromDate, toDate, page = 1, limit = 10 } = params;

    let items = this._getPlaydates();

    // Filter by status
    if (status && status !== 'all') {
      items = items.filter((p) => p.status?.toLowerCase() === status.toLowerCase());
    }

    // Filter by search keyword
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.activity?.toLowerCase().includes(q) ||
          p.locationName?.toLowerCase().includes(q) ||
          p.location?.name?.toLowerCase().includes(q) ||
          p.host?.parent?.fullName?.toLowerCase().includes(q)
      );
    }

    // Filter by date range
    if (fromDate) {
      const from = new Date(fromDate).getTime();
      items = items.filter((p) => new Date(p.scheduledDate).getTime() >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      items = items.filter((p) => new Date(p.scheduledDate).getTime() <= to.getTime());
    }

    // Sort by scheduledDate desc
    items.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));

    const total = items.length;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const totalPages = Math.ceil(total / parsedLimit) || 1;
    const startIndex = (parsedPage - 1) * parsedLimit;
    const pagedItems = items.slice(startIndex, startIndex + parsedLimit);

    return {
      success: true,
      message: 'Admin playdates list retrieved successfully',
      data: {
        items: pagedItems,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages,
        },
      },
    };
  }

  /**
   * GET /api/v1/admin/playdates/:id
   */
  async getPlaydateDetail(id) {
    await delay();
    const items = this._getPlaydates();
    const item = items.find((p) => p.id === id);

    if (!item) {
      const error = new Error('Playdate not found');
      error.response = {
        status: 404,
        data: { success: false, message: 'Playdate not found', error: { code: 'PLAYDATE_NOT_FOUND' } },
      };
      throw error;
    }

    return {
      success: true,
      message: 'Admin playdate detail retrieved successfully',
      data: item,
    };
  }

  /**
   * PATCH /api/v1/admin/playdates/:id/cancel
   */
  async cancelPlaydate(id, body = {}) {
    await delay();
    const items = this._getPlaydates();
    const index = items.findIndex((p) => p.id === id);

    if (index === -1) {
      const error = new Error('Playdate not found');
      error.response = {
        status: 404,
        data: { success: false, message: 'Playdate not found', error: { code: 'PLAYDATE_NOT_FOUND' } },
      };
      throw error;
    }

    const current = items[index];
    if (current.status === 'cancelled') {
      const error = new Error('This playdate is already cancelled');
      error.response = {
        status: 400,
        data: { success: false, message: 'This playdate is already cancelled', error: { code: 'ALREADY_CANCELLED' } },
      };
      throw error;
    }
    if (current.status === 'completed') {
      const error = new Error('Cannot cancel a completed playdate');
      error.response = {
        status: 400,
        data: { success: false, message: 'Cannot cancel a completed playdate', error: { code: 'INVALID_PLAYDATE_STATUS' } },
      };
      throw error;
    }

    const updated = {
      ...current,
      status: 'cancelled',
      cancellation: {
        cancelledBy: null,
        cancelledByAdmin: true,
        reason: body.reason || 'Cancelled by admin',
        cancelledAt: new Date().toISOString(),
      },
      pendingReschedule: null, // Admin cancel automatically invalidates any pending reschedule
      updatedAt: new Date().toISOString(),
    };

    items[index] = updated;
    this._savePlaydates(items);

    return {
      success: true,
      message: 'Playdate cancelled by admin successfully',
      data: updated,
    };
  }

  /**
   * GET /api/v1/admin/connections
   */
  async getConnectionStats() {
    await delay();
    const items = this._getConnections();
    const countOf = (status) => items.filter((c) => c.status === status).length;
    return {
      success: true,
      data: {
        total: items.length,
        pending: countOf('pending'),
        accepted: countOf('accepted'),
        declined: countOf('declined'),
        removed: countOf('removed'),
      },
    };
  }

  async getConnections(params = {}) {
    await delay();
    const { status, search, page = 1, limit = 10 } = params;

    let items = this._getConnections();

    // Filter by status
    if (status && status !== 'all') {
      items = items.filter((c) => c.status?.toLowerCase() === status.toLowerCase());
    }

    // Filter by search keyword (parent names, emails)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (c) =>
          c.requester?.fullName?.toLowerCase().includes(q) ||
          c.requester?.email?.toLowerCase().includes(q) ||
          c.recipient?.fullName?.toLowerCase().includes(q) ||
          c.recipient?.email?.toLowerCase().includes(q)
      );
    }

    // Sort by createdAt desc
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = items.length;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const totalPages = Math.ceil(total / parsedLimit) || 1;
    const startIndex = (parsedPage - 1) * parsedLimit;
    const pagedItems = items.slice(startIndex, startIndex + parsedLimit);

    return {
      success: true,
      message: 'Admin connections list retrieved successfully',
      data: {
        items: pagedItems,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages,
        },
      },
    };
  }

  /**
   * GET /api/v1/admin/connections/:id
   */
  async getConnectionDetail(id) {
    await delay();
    const items = this._getConnections();
    const item = items.find((c) => c.id === id);

    if (!item) {
      const error = new Error('Connection not found');
      error.response = {
        status: 404,
        data: { success: false, message: 'Connection not found', error: { code: 'CONNECTION_NOT_FOUND' } },
      };
      throw error;
    }

    return {
      success: true,
      message: 'Admin connection detail retrieved successfully',
      data: item,
    };
  }

  /**
   * DELETE /api/v1/admin/connections/:id
   */
  async removeConnection(id, body = {}) {
    await delay();
    const items = this._getConnections();
    const index = items.findIndex((c) => c.id === id);

    if (index === -1) {
      const error = new Error('Connection not found');
      error.response = {
        status: 404,
        data: { success: false, message: 'Connection not found', error: { code: 'CONNECTION_NOT_FOUND' } },
      };
      throw error;
    }

    const current = items[index];
    if (current.status !== 'pending' && current.status !== 'accepted') {
      const error = new Error('Only pending or accepted connections can be removed');
      error.response = {
        status: 400,
        data: {
          success: false,
          message: 'Only pending or accepted connections can be removed',
          error: { code: 'INVALID_CONNECTION_STATE' },
        },
      };
      throw error;
    }

    const updated = {
      ...current,
      status: 'removed',
      removedAt: new Date().toISOString(),
      removedByAdmin: true,
      removalReason: body.reason || 'Removed by admin',
      updatedAt: new Date().toISOString(),
    };

    items[index] = updated;
    this._saveConnections(items);

    return {
      success: true,
      message: 'Connection removed by admin successfully',
      data: updated,
    };
  }
}

export const adminMockService = new AdminMockService();
export default adminMockService;
