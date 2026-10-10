import { INITIAL_MOCK_CONNECTIONS } from './connectionMockData';

const STORAGE_KEY = 'buddylink_mock_connections_v1';

// Small artificial delay to simulate realistic network latency
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const ok = (data, message = 'OK') => ({ success: true, message, data, error: null });

class ConnectionMockService {
  _getAll() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Corrupted data: start again from the initial list
    }
    this._saveAll(INITIAL_MOCK_CONNECTIONS);
    return structuredClone(INITIAL_MOCK_CONNECTIONS);
  }

  _saveAll(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Storage full or disabled: changes only last for this page
    }
  }

  /**
   * Reject like the real API: { message, error: { code } } with an HTTP status
   */
  _fail(code, message, status = 400) {
    const err = new Error(message);
    err.response = { status, data: { success: false, message, error: { code, details: [] } } };
    throw err;
  }

  // Move a connection from one status to another (same rule as the backend)
  _transition(id, fromStatus, toStatus) {
    const list = this._getAll();
    const connection = list.find((c) => c.id === id);
    if (!connection) this._fail('CONNECTION_NOT_FOUND', 'Connection not found', 404);
    if (connection.status !== fromStatus) this._fail('INVALID_CONNECTION_STATE', `Connection is not ${fromStatus}`, 409);
    connection.status = toStatus;
    if (toStatus === 'accepted') connection.connectedAt = new Date().toISOString();
    this._saveAll(list);
    return ok(connection);
  }

  async getConnections({ status, direction, search, page = 1, limit = 10 } = {}) {
    await delay();
    const text = search?.trim().toLowerCase();
    const list = this._getAll().filter(
      (c) =>
        (!status || c.status === status) &&
        (!direction || c.direction === direction) &&
        (!text || [c.partner.fullName, c.partner.child?.displayName].some((name) => name?.toLowerCase().includes(text)))
    );
    const pageNumber = Number(page);
    const pageSize = Number(limit);
    return ok(
      {
        items: list.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
        pagination: { page: pageNumber, limit: pageSize, total: list.length, totalPages: Math.ceil(list.length / pageSize) || 1 },
      },
      'Connections retrieved successfully'
    );
  }

  async accept(id) {
    await delay();
    return this._transition(id, 'pending', 'accepted');
  }

  async decline(id) {
    await delay();
    return this._transition(id, 'pending', 'declined');
  }

  async remove(id) {
    await delay();
    const connection = this._getAll().find((c) => c.id === id);
    const fromStatus = connection?.status === 'pending' ? 'pending' : 'accepted';
    return this._transition(id, fromStatus, 'removed');
  }
}

export const connectionMockService = new ConnectionMockService();
export default connectionMockService;
