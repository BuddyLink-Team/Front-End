import { BLOCK_REASONS } from '../constants/safety.constants';

// Same shape as GET /safety/blocked-users items (SafetyDTO.toBlockedUserResponse)
export const INITIAL_MOCK_BLOCKED_USERS = [
  {
    id: 'block-1',
    parentId: 'p-blocked-1',
    fullName: 'Hoàng Nam',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    reason: BLOCK_REASONS.CHAT,
    blockedAt: '2026-10-20T14:30:00.000Z',
  },
  {
    id: 'block-2',
    parentId: 'p-blocked-2',
    fullName: 'Lê Thị Khánh Vy',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
    reason: BLOCK_REASONS.CONNECTION,
    blockedAt: '2026-10-22T09:15:00.000Z',
  },
];

export const MOCK_EVIDENCE_URL =
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=400';
