import { describe, it, expect } from 'vitest';
import discoveryReducer, {
  fetchDiscoveryProfiles,
  swipeDiscoveryProfile,
  removeProfile,
  restoreProfile,
} from '../../modules/discovery/redux/discoverySlice';
import { DISCOVERY_PAGE_SIZE } from '../../modules/discovery/constants/discoveryConstants';

const action = (thunk, status, payload) => ({ type: thunk[status].type, payload });

const makeProfiles = (count) => Array.from({ length: count }, (_, i) => ({ childId: `c${i}` }));

describe('discoverySlice', () => {
  const initial = discoveryReducer(undefined, { type: 'init' });
  const loaded = discoveryReducer(
    initial,
    action(fetchDiscoveryProfiles, 'fulfilled', {
      profiles: makeProfiles(3),
      meta: { remainingViews: 5, isPremium: false },
    }),
  );

  it('stores profiles and meta, and flags no more pages when the page is not full', () => {
    expect(loaded.profiles).toHaveLength(3);
    expect(loaded.meta.remainingViews).toBe(5);
    expect(loaded.hasMore).toBe(false);
    expect(loaded.isLoading).toBe(false);
  });

  it('flags more pages when a full page is returned', () => {
    const state = discoveryReducer(
      initial,
      action(fetchDiscoveryProfiles, 'fulfilled', { profiles: makeProfiles(DISCOVERY_PAGE_SIZE), meta: null }),
    );
    expect(state.hasMore).toBe(true);
  });

  it('keeps the API error body when fetching fails', () => {
    const error = { message: 'x', error: { code: 'LOCATION_REQUIRED' } };
    const state = discoveryReducer(initial, action(fetchDiscoveryProfiles, 'rejected', error));
    expect(state.error).toEqual(error);
    expect(state.isLoading).toBe(false);
  });

  it('removes a swiped card and restores it on top without duplicating', () => {
    const removed = discoveryReducer(loaded, removeProfile('c0'));
    expect(removed.profiles.map((p) => p.childId)).toEqual(['c1', 'c2']);

    const restored = discoveryReducer(removed, restoreProfile({ childId: 'c0' }));
    expect(restored.profiles.map((p) => p.childId)).toEqual(['c0', 'c1', 'c2']);

    const restoredTwice = discoveryReducer(restored, restoreProfile({ childId: 'c0' }));
    expect(restoredTwice.profiles).toHaveLength(3);
  });

  it('updates remaining views after a successful swipe', () => {
    const state = discoveryReducer(loaded, action(swipeDiscoveryProfile, 'fulfilled', { remainingViews: 4 }));
    expect(state.meta.remainingViews).toBe(4);
  });
});
