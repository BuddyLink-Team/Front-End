import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../services/apiClient';
import { adminApi } from '../../modules/admin/api/adminApi';

vi.mock('../../services/apiClient', () => ({
  default: { patch: vi.fn().mockResolvedValue({ success: true, data: {} }) },
}));

describe('adminApi.markAllNotificationsAsRead', () => {
  beforeEach(() => apiClient.patch.mockClear());

  // A null body is sent as the JSON text "null", which express.json() rejects with a 400
  it('sends a JSON object body, never null', async () => {
    await adminApi.markAllNotificationsAsRead();

    const [, body, config] = apiClient.patch.mock.calls[0];
    expect(body).toEqual({});
    expect(config).toEqual({ params: {} });
  });

  it('passes the category as a query parameter', async () => {
    await adminApi.markAllNotificationsAsRead('safety');

    expect(apiClient.patch.mock.calls[0][2]).toEqual({ params: { category: 'safety' } });
  });
});
