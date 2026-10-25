import { REPORT_CATEGORIES } from '../constants/safetyConstants';

let mockBlockedUsers = [
  {
    id: 'block-1',
    parentId: 'p-blocked-1',
    displayName: 'Phụ huynh Hoàng Nam',
    fullName: 'Hoàng Nam',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    reason: 'Nội dung tin nhắn không phù hợp',
    blockedAt: '2026-10-20T14:30:00.000Z',
  },
  {
    id: 'block-2',
    parentId: 'p-blocked-2',
    displayName: 'Mẹ Khánh Vy',
    fullName: 'Lê Thị Khánh Vy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
    reason: 'Quấy rối và gửi tin rác',
    blockedAt: '2026-10-22T09:15:00.000Z',
  },
];

export const resetMockBlockedUsers = () => {
  mockBlockedUsers = [
    {
      id: 'block-1',
      parentId: 'p-blocked-1',
      displayName: 'Phụ huynh Hoàng Nam',
      fullName: 'Hoàng Nam',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
      reason: 'Nội dung tin nhắn không phù hợp',
      blockedAt: '2026-10-20T14:30:00.000Z',
    },
    {
      id: 'block-2',
      parentId: 'p-blocked-2',
      displayName: 'Mẹ Khánh Vy',
      fullName: 'Lê Thị Khánh Vy',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
      reason: 'Quấy rối và gửi tin rác',
      blockedAt: '2026-10-22T09:15:00.000Z',
    },
  ];
};

export const safetyMockHandlers = [
  // GET /safety/blocked-users
  {
    method: 'GET',
    pattern: '/safety/blocked-users',
    handler: async ({ query = {} }) => {
      const page = Math.max(1, parseInt(query.page, 10) || 1);
      const limit = Math.max(1, parseInt(query.limit, 10) || 10);
      const start = (page - 1) * limit;
      const items = mockBlockedUsers.slice(start, start + limit);

      return {
        success: true,
        message: 'Blocked users retrieved successfully',
        data: {
          items,
          pagination: {
            page,
            limit,
            total: mockBlockedUsers.length,
            totalPages: Math.ceil(mockBlockedUsers.length / limit) || 1,
          },
        },
      };
    },
  },

  // DELETE /safety/unblock/:id
  {
    method: 'DELETE',
    pattern: '/safety/unblock/:id',
    handler: async ({ params }) => {
      const targetId = params.id;
      mockBlockedUsers = mockBlockedUsers.filter(
        (u) => u.parentId !== targetId && u.id !== targetId,
      );
      return {
        success: true,
        message: 'User unblocked successfully',
        data: { success: true },
      };
    },
  },

  // POST /safety/block
  {
    method: 'POST',
    pattern: '/safety/block',
    handler: async ({ body = {} }) => {
      const blockedId = body.blockedId || body.targetParentId;
      const newBlock = {
        id: `block-${Date.now()}`,
        parentId: blockedId,
        displayName: 'Người dùng BuddyLink',
        fullName: 'Người dùng BuddyLink',
        avatar: null,
        avatarUrl: null,
        reason: body.reason || 'Blocked by user',
        blockedAt: new Date().toISOString(),
      };
      mockBlockedUsers.unshift(newBlock);
      return {
        success: true,
        message: 'User blocked successfully',
        data: newBlock,
      };
    },
  },

  // POST /safety/reports
  {
    method: 'POST',
    pattern: '/safety/reports',
    handler: async ({ body = {} }) => {
      return {
        success: true,
        message: 'Report submitted successfully',
        data: {
          id: `rep-${Date.now()}`,
          reportedUserId: body.reportedUserId,
          targetType: body.targetType || 'user',
          category: body.category || REPORT_CATEGORIES.OTHER,
          reason: body.reason || '',
          description: body.description || '',
          evidenceUrls: body.evidenceUrls || [],
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      };
    },
  },
];

export default safetyMockHandlers;
