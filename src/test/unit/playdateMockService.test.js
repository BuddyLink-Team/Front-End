import { describe, it, expect, beforeEach } from 'vitest';
import playdateMockService from '../../modules/playdate/mock/playdateMockService';

// Move a mock playdate to yesterday so its start time has passed
const moveToPast = (id) => {
  const list = playdateMockService._getStoredPlaydates();
  const item = list.find((p) => p.id === id);
  item.scheduledDate = new Date(Date.now() - 86400000).toISOString();
  playdateMockService._saveStoredPlaydates(list);
};

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
      scheduledDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      time: '09:00',
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

  it('completes a playdate only after its start time', async () => {
    await expect(playdateMockService.completePlaydate('pd-mock-1')).rejects.toMatchObject({
      response: { data: { error: { code: 'CANNOT_COMPLETE_YET' } } },
    });

    moveToPast('pd-mock-1');
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
    expect(res.data.cancellation.reason).toBe('Bận việc gia đình đột xuất');
  });

  it('rejects RSVP from the host like the API', async () => {
    await expect(playdateMockService.respondToPlaydate('pd-mock-2', 'accepted')).rejects.toMatchObject({
      response: { data: { error: { code: 'HOST_CANNOT_RSVP' } } },
    });
  });

  it('only lets the host complete or cancel', async () => {
    await expect(playdateMockService.completePlaydate('pd-mock-3')).rejects.toMatchObject({
      response: { status: 403, data: { error: { code: 'FORBIDDEN_COMPLETE_PLAYDATE' } } },
    });
    await expect(playdateMockService.cancelPlaydate('pd-mock-3')).rejects.toMatchObject({
      response: { status: 403, data: { error: { code: 'FORBIDDEN_CANCEL_PLAYDATE' } } },
    });
  });

  it('creates and votes on a reschedule proposal', async () => {
    // Host proposes for pd-mock-1: accepted participants must vote
    const createRes = await playdateMockService.createReschedule('pd-mock-1', {
      reason: 'Trời mưa bão',
      newDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      newStartTime: '10:00',
    });
    expect(createRes.success).toBe(true);
    expect(createRes.data.rescheduleRequest.reason).toBe('Trời mưa bão');
    expect(createRes.data.rescheduleRequest.status).toBe('pending');
    expect(createRes.data.rescheduleRequest.isRequester).toBe(true);
    expect(createRes.data.isAutoApplied).toBe(false);

    // Only the host can propose (pd-mock-3 is hosted by another parent)
    await expect(
      playdateMockService.createReschedule('pd-mock-3', {
        newDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        newStartTime: '10:00',
      }),
    ).rejects.toMatchObject({ response: { data: { error: { code: 'FORBIDDEN_RESCHEDULE' } } } });

    // Current parent is the only voter of pd-mock-3: accepting applies the new schedule
    const current = await playdateMockService.getReschedule('pd-mock-3');
    expect(current.data.myVote).toBe('pending');
    const voteRes = await playdateMockService.voteReschedule('pd-mock-3', {
      requestId: current.data.id,
      status: 'accepted',
    });
    expect(voteRes.success).toBe(true);
    expect(voteRes.data.rescheduleRequest.status).toBe('accepted');
    expect(voteRes.data.playdate.time).toBe('08:30');
  });

  it('searches nearby places with filtering by category and search keyword', async () => {
    const allPlaces = await playdateMockService.getNearbyPlaces();
    expect(allPlaces.data.length).toBe(10);

    const parksOnly = await playdateMockService.getNearbyPlaces({ type: 'park' });
    expect(parksOnly.data.every((p) => p.placeType === 'park')).toBe(true);

    expect(allPlaces.data.every((p) => Array.isArray(p.coordinates))).toBe(true);

    const searchTaoDan = await playdateMockService.getNearbyPlaces({ search: 'Tao Đàn' });
    expect(searchTaoDan.data).toHaveLength(1);
    expect(searchTaoDan.data[0].name).toBe('Công viên Tao Đàn');
  });

  it('returns mock children and friends', async () => {
    const childrenRes = await playdateMockService.getMyChildren();
    expect(childrenRes.data).toHaveLength(2);

    const friendsRes = await playdateMockService.getFriends();
    expect(friendsRes.data).toHaveLength(3);
    expect(friendsRes.data[0].location).toEqual({ area: 'Phường Tân Định', city: 'TP. Hồ Chí Minh' });
  });
});
