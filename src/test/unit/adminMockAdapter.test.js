import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initMockServer } from '../../mock';
import apiClient from '../../services/apiClient';
import { adminApi } from '../../modules/admin/api/adminApi';
import adminMockService from '../../modules/admin/mock/adminMockService';

describe('Admin Mock Server Engine (Axios Adapter)', () => {
  const originalBaseURL = apiClient.defaults.baseURL;

  beforeEach(() => {
    // Configure baseURL to simulate admin portal endpoint
    apiClient.defaults.baseURL = 'http://localhost:5001/api/v1/admin';
    adminMockService.resetFactoryData();
    initMockServer();
  });

  afterEach(() => {
    apiClient.defaults.baseURL = originalBaseURL;
  });

  describe('Playdates Oversight Mock API', () => {
    it('retrieves paginated playdates list with filters', async () => {
      const res = await adminApi.getPlaydates();
      expect(res).toBeDefined();
      expect(res.data.items.length).toBeGreaterThan(0);
      expect(res.data.pagination.total).toBe(5);
      expect(res.data.pagination.page).toBe(1);

      // Filter by status upcoming
      const upcomingRes = await adminApi.getPlaydates({ status: 'upcoming' });
      expect(upcomingRes.data.items.every((p) => p.status === 'upcoming')).toBe(true);

      // Search by keyword
      const searchRes = await adminApi.getPlaydates({ search: 'Thảo Cầm Viên' });
      expect(searchRes.data.items).toHaveLength(1);
      expect(searchRes.data.items[0].activity).toContain('Thảo Cầm Viên');
    });

    it('retrieves full single playdate detail by ID', async () => {
      const res = await adminApi.getPlaydateDetail('pd-admin-2');
      expect(res).toBeDefined();
      expect(res.data.id).toBe('pd-admin-2');
      expect(res.data.activity).toContain('Giao lưu bóng đá nhí');
      expect(res.data.pendingReschedule).toBeDefined();
      expect(res.data.pendingReschedule.status).toBe('pending');
      expect(res.data.pendingReschedule.newLocation.name).toContain('Sala');
    });

    it('force-cancels an upcoming playdate with required reason', async () => {
      const cancelRes = await adminApi.cancelPlaydate('pd-admin-1', 'Vi phạm quy tắc an toàn bảo vệ trẻ em');
      expect(cancelRes).toBeDefined();
      expect(cancelRes.data.status).toBe('cancelled');
      expect(cancelRes.data.cancellation.cancelledByAdmin).toBe(true);
      expect(cancelRes.data.cancellation.reason).toBe('Vi phạm quy tắc an toàn bảo vệ trẻ em');

      // Check detail reflects cancellation
      const detailRes = await adminApi.getPlaydateDetail('pd-admin-1');
      expect(detailRes.data.status).toBe('cancelled');
      expect(detailRes.data.cancellation.cancelledByAdmin).toBe(true);

      // Re-cancelling should fail
      await expect(adminApi.cancelPlaydate('pd-admin-1', 'Thử hủy lại')).rejects.toMatchObject({
        error: { code: 'ALREADY_CANCELLED' },
      });
    });

    it('rejects cancellation of completed playdate', async () => {
      await expect(adminApi.cancelPlaydate('pd-admin-3', 'Hủy buổi đã xong')).rejects.toMatchObject({
        error: { code: 'INVALID_PLAYDATE_STATUS' },
      });
    });
  });

  describe('Connections Oversight Mock API', () => {
    it('retrieves paginated connections list with status filter and search', async () => {
      const res = await adminApi.getConnections();
      expect(res).toBeDefined();
      expect(res.data.items.length).toBeGreaterThan(0);
      expect(res.data.pagination.total).toBe(5);

      // Filter by status accepted
      const acceptedRes = await adminApi.getConnections({ status: 'accepted' });
      expect(acceptedRes.data.items.every((c) => c.status === 'accepted')).toBe(true);

      // Search by parent name
      const searchRes = await adminApi.getConnections({ search: 'Mẹ Lan' });
      expect(searchRes.data.items.length).toBeGreaterThan(0);
    });

    it('retrieves full single connection detail with locked account status', async () => {
      const res = await adminApi.getConnectionDetail('conn-admin-3');
      expect(res).toBeDefined();
      expect(res.data.id).toBe('conn-admin-3');
      expect(res.data.requester.fullName).toBe('Bố Nam');
      expect(res.data.requester.isActive).toBe(false); // Locked user account
    });

    it('soft-removes a connection with reason', async () => {
      const removeRes = await adminApi.removeConnection('conn-admin-1', 'Phụ huynh yêu cầu can thiệp ngắt kết nối');
      expect(removeRes).toBeDefined();
      expect(removeRes.data.status).toBe('removed');
      expect(removeRes.data.removedByAdmin).toBe(true);
      expect(removeRes.data.removalReason).toBe('Phụ huynh yêu cầu can thiệp ngắt kết nối');

      // Check detail reflects removal
      const detailRes = await adminApi.getConnectionDetail('conn-admin-1');
      expect(detailRes.data.status).toBe('removed');
      expect(detailRes.data.removedByAdmin).toBe(true);

      // Removing an already removed connection should reject
      await expect(adminApi.removeConnection('conn-admin-1')).rejects.toMatchObject({
        error: { code: 'INVALID_CONNECTION_STATE' },
      });
    });
  });
});
