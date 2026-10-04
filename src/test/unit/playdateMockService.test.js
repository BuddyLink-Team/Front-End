import { describe, it, expect, beforeEach } from 'vitest';
import playdateMockService from '../../modules/playdate/mock/playdateMockService';
import { MOCK_CURRENT_PARENT } from '../../modules/playdate/mock/playdateMockData';

describe('playdateMockService', () => {
  beforeEach(() => {
    // Reset to factory data before each test
    playdateMockService.resetFactoryData();
  });

  it('retrieves initial playdates with accurate tab counts and search filtering', async () => {
    const res = await playdateMockService.getPlaydates();
    expect(res.success).toBe(true);
    expect(res.data.playdates).toHaveLength(5);
    expect(res.data.counts.all).toBe(5);
    expect(res.data.counts.upcoming).toBe(3);
    expect(res.data.counts.completed).toBe(1);
    expect(res.data.counts.cancelled).toBe(1);

    // Filter by completed status
    const completedRes = await playdateMockService.getPlaydates({ status: 'completed' });
    expect(completedRes.data.playdates).toHaveLength(1);
    expect(completedRes.data.playdates[0].status).toBe('completed');

    // Search by query
    const searchRes = await playdateMockService.getPlaydates({ search: 'Lego' });
    expect(searchRes.data.playdates.length).toBeGreaterThanOrEqual(1);
    expect(searchRes.data.playdates[0].activity).toContain('Lego');
  });

  it('fetches a single playdate by ID and throws on missing ID', async () => {
    const res = await playdateMockService.getPlaydateById('pd-mock-1');
    expect(res.success).toBe(true);
    expect(res.data.id).toBe('pd-mock-1');

    await expect(playdateMockService.getPlaydateById('non-existent')).rejects.toThrow();
  });

  it('creates a new playdate and unshifts to top of list', async () => {
    const payload = {
      hostChildId: 'child-host-1',
      activity: 'Chơi bóng đá tại sân mini',
      scheduledDate: '2026-10-10T09:00:00.000Z',
      time: '09:00 - 11:00',
      location: { name: 'Sân bóng mini', address: 'Quận 1' },
      participants: [{ parentId: 'parent-friend-1', childId: 'child-friend-1' }],
      note: 'Giao lưu bóng đá giao hữu',
    };

    const res = await playdateMockService.createPlaydate(payload);
    expect(res.success).toBe(true);
    expect(res.data.activity).toBe('Chơi bóng đá tại sân mini');
    expect(res.data.isHost).toBe(true);

    const listRes = await playdateMockService.getPlaydates();
    expect(listRes.data.playdates[0].id).toBe(res.data.id);
  });

  it('completes a playdate', async () => {
    const res = await playdateMockService.completePlaydate('pd-mock-1');
    expect(res.success).toBe(true);
    expect(res.data.status).toBe('completed');
  });

  it('cancels a playdate with custom reason', async () => {
    const res = await playdateMockService.cancelPlaydate('pd-mock-1', {
      reason: 'Bận việc gia đình đột xuất',
    });
    expect(res.success).toBe(true);
    expect(res.data.status).toBe('cancelled');
    expect(res.data.cancellationReason).toBe('Bận việc gia đình đột xuất');
  });

  it('handles participant RSVP response', async () => {
    const res = await playdateMockService.respondToPlaydate('pd-mock-2', 'accepted');
    expect(res.success).toBe(true);
    expect(res.data.myParticipantStatus).toBe('accepted');
    expect(res.data.displayStatus).toBe('confirmed');
  });

  it('creates and votes on a reschedule proposal', async () => {
    // Propose reschedule for pd-mock-1
    const createRes = await playdateMockService.createReschedule('pd-mock-1', {
      reason: 'Trời mưa bão',
      newDate: '2026-10-15T09:00:00.000Z',
      newStartTime: '10:00 - 12:00',
    });
    expect(createRes.success).toBe(true);
    expect(createRes.data.rescheduleRequest.reason).toBe('Trời mưa bão');

    // Vote accept on active proposal pd-mock-3
    const voteRes = await playdateMockService.voteReschedule('pd-mock-3', {
      status: 'accepted',
    });
    expect(voteRes.success).toBe(true);
    expect(voteRes.data.rescheduleRequest.status).toBe('accepted');
    expect(voteRes.data.playdate.time).toBe('08:30 - 11:00');
  });

  it('searches nearby places with filtering by category and search keyword', async () => {
    const allPlaces = await playdateMockService.getNearbyPlaces();
    expect(allPlaces.data.length).toBe(10);

    const parksOnly = await playdateMockService.getNearbyPlaces({ type: 'park' });
    expect(parksOnly.data.every((p) => p.placeType === 'park')).toBe(true);

    const searchTaoDan = await playdateMockService.getNearbyPlaces({ search: 'Tao Đàn' });
    expect(searchTaoDan.data).toHaveLength(1);
    expect(searchTaoDan.data[0].name).toBe('Công viên Tao Đàn');
  });

  it('returns mock children and friends', async () => {
    const childrenRes = await playdateMockService.getMyChildren();
    expect(childrenRes.data).toHaveLength(2);

    const friendsRes = await playdateMockService.getFriends();
    expect(friendsRes.data.friends).toHaveLength(3);
  });
});
