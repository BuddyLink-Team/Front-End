import { INITIAL_MOCK_BLOCKED_USERS, MOCK_EVIDENCE_URL } from './safetyMockData';
import { BLOCK_REASONS, REPORT_CATEGORIES, REPORT_TARGET_TYPES } from '../constants/safety.constants';

const STORAGE_KEY = 'buddylink_mock_blocked_users_v1';
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
const ok = (data, message = 'OK') => ({ success: true, message, data, error: null });

class SafetyMockService {
  _getAll() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    this._saveAll(INITIAL_MOCK_BLOCKED_USERS);
    return structuredClone(INITIAL_MOCK_BLOCKED_USERS);
  }

  _saveAll(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Storage unavailable
    }
  }

  resetFactoryData() {
    this._saveAll(INITIAL_MOCK_BLOCKED_USERS);
  }

  async getBlockedUsers({ page = 1, limit = 10, search = '' } = {}) {
    await delay();
    const keyword = String(search).trim().toLowerCase();
    const list = this._getAll().filter((u) => !keyword || u.fullName.toLowerCase().includes(keyword));

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const start = (pageNum - 1) * limitNum;

    return ok(
      {
        items: list.slice(start, start + limitNum),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: list.length,
          totalPages: Math.ceil(list.length / limitNum) || 1,
        },
      },
      'Blocked users retrieved successfully',
    );
  }

  async blockUser({ blockedId, targetParentId, reason } = {}) {
    await delay();
    const parentId = blockedId || targetParentId;
    const list = this._getAll().filter((u) => u.parentId !== parentId);
    const block = {
      id: `block-${Date.now()}`,
      parentId,
      fullName: 'Người dùng BuddyLink',
      avatarUrl: null,
      reason: reason || BLOCK_REASONS.DEFAULT,
      blockedAt: new Date().toISOString(),
    };
    this._saveAll([block, ...list]);
    return ok(block, 'User blocked successfully');
  }

  async unblockUser(parentId) {
    await delay();
    this._saveAll(this._getAll().filter((u) => u.parentId !== parentId));
    return ok({ success: true }, 'User unblocked successfully');
  }

  async createReport(body = {}) {
    await delay();
    return ok(
      {
        id: `rep-${Date.now()}`,
        reportedUserId: body.reportedUserId,
        targetType: body.targetType || REPORT_TARGET_TYPES.USER,
        category: body.category || REPORT_CATEGORIES.OTHER,
        reason: body.reason || body.category || '',
        description: body.description || '',
        evidenceUrls: body.evidenceUrls || [],
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      'Report submitted successfully',
    );
  }

  async uploadEvidence() {
    await delay();
    return ok({ url: MOCK_EVIDENCE_URL, publicId: `mock-evidence-${Date.now()}` }, 'Evidence uploaded successfully');
  }
}

export const safetyMockService = new SafetyMockService();
export default safetyMockService;
