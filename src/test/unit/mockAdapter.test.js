import { describe, it, expect, beforeEach } from 'vitest';
import { initMockServer } from '../../mock';
import { playdateApi } from '../../modules/playdate/api/playdateApi';
import { childApi } from '../../modules/child/api/childApi';
import playdateMockService from '../../modules/playdate/mock/playdateMockService';

describe('Centralized Mock Server Engine (Axios Adapter)', () => {
  beforeEach(() => {
    // Reset mock service data and initialize mock server
    playdateMockService.resetFactoryData();
    initMockServer();
  });

  it('intercepts playdateApi.getPlaydates() transparently through pure production playdateApi', async () => {
    const res = await playdateApi.getPlaydates();
    expect(res).toBeDefined();
    expect(res.data.playdates).toHaveLength(5);
    expect(res.data.counts.all).toBe(5);
  });

  it('intercepts childApi.getMyChildren() transparently through pure production childApi', async () => {
    const res = await childApi.getMyChildren();
    expect(res).toBeDefined();
    expect(res.data).toHaveLength(2);
    expect(res.data[0].displayName).toBe('Bé Bơ');
  });

  it('intercepts playdateApi.getPlaydateById()', async () => {
    const res = await playdateApi.getPlaydateById('pd-mock-1');
    expect(res).toBeDefined();
    expect(res.data.id).toBe('pd-mock-1');
    expect(res.data.activity).toContain('Thảo Cầm Viên');
  });

  it('intercepts playdateApi.createPlaydate() and reflects in list', async () => {
    const newPlaydateRes = await playdateApi.createPlaydate({
      hostChildId: 'child-host-1',
      activity: 'Buổi vẽ tranh ngoài trời',
      scheduledDate: '2026-10-20T09:00:00.000Z',
      time: '09:00',
      location: { name: 'Công viên Gia Định' },
    });

    expect(newPlaydateRes).toBeDefined();
    expect(newPlaydateRes.data.activity).toBe('Buổi vẽ tranh ngoài trời');

    const updatedListRes = await playdateApi.getPlaydates();
    expect(updatedListRes.data.playdates[0].id).toBe(newPlaydateRes.data.id);
  });

  it('intercepts playdateApi.completePlaydate()', async () => {
    // Completing needs the start time to have passed
    const list = playdateMockService._getStoredPlaydates();
    list.find((p) => p.id === 'pd-mock-1').scheduledDate = new Date(Date.now() - 86400000).toISOString();
    playdateMockService._saveStoredPlaydates(list);

    const res = await playdateApi.completePlaydate('pd-mock-1');
    expect(res.data.status).toBe('completed');
  });

  it('intercepts playdateApi.getNearbyPlaces()', async () => {
    const res = await playdateApi.getNearbyPlaces({ type: 'park' });
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data.every((p) => p.placeType === 'park')).toBe(true);
  });
});
