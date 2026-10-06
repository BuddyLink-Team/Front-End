import { describe, it, expect } from 'vitest';
import discoveryReducer, {
  fetchDiscoveryProfiles,
  swipeDiscoveryProfile,
  fetchChildPublicProfile,
  removeProfile,
  restoreProfile,
} from '../../modules/discovery/redux/discoverySlice';
import { DISCOVERY_PAGE_SIZE } from '../../modules/discovery/constants/discoveryConstants';

const action = (thunk, status, payload, arg) => ({ type: thunk[status].type, payload, meta: { arg } });

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

  it('filters by personality client-side and stops auto-loading when nothing matches', () => {
    const page = [
      ...makeProfiles(DISCOVERY_PAGE_SIZE - 1).map((p) => ({ ...p, personality: ['Nhút nhát'] })),
      { childId: 'match', personality: ['Hòa đồng'] },
    ];
    const matched = discoveryReducer(
      initial,
      action(fetchDiscoveryProfiles, 'fulfilled', { profiles: page, meta: null }, { personalities: ['Hòa đồng'] }),
    );
    expect(matched.profiles.map((p) => p.childId)).toEqual(['match']);
    expect(matched.hasMore).toBe(true);

    const none = discoveryReducer(
      initial,
      action(fetchDiscoveryProfiles, 'fulfilled', { profiles: page, meta: null }, { personalities: ['Vui tính'] }),
    );
    expect(none.profiles).toHaveLength(0);
    expect(none.hasMore).toBe(false);
  });

  it('ignores a child detail response for a child that is no longer selected', () => {
    const pendingA = discoveryReducer(initial, action(fetchChildPublicProfile, 'pending', undefined, 'a'));
    const pendingB = discoveryReducer(pendingA, action(fetchChildPublicProfile, 'pending', undefined, 'b'));
    const staleA = discoveryReducer(pendingB, action(fetchChildPublicProfile, 'fulfilled', { childId: 'a' }, 'a'));
    expect(staleA.childDetail.profile).toBeNull();
    expect(staleA.childDetail.isLoading).toBe(true);

    const loadedB = discoveryReducer(staleA, action(fetchChildPublicProfile, 'fulfilled', { childId: 'b' }, 'b'));
    expect(loadedB.childDetail.profile.childId).toBe('b');
    expect(loadedB.childDetail.isLoading).toBe(false);
  });
});

describe('discovery filter options', () => {
  it('uses the exact personality values stored on child profiles', async () => {
    const { PERSONALITY_FILTER_OPTIONS } = await import('../../modules/discovery/constants/discoveryConstants');
    const { PERSONALITY_TRAITS } = await import('../../modules/child/constants/childConstants');
    expect(PERSONALITY_FILTER_OPTIONS.map((o) => o.id)).toEqual(PERSONALITY_TRAITS);
  });
});

describe('discovery default filters from parent preferences', () => {
  it('builds defaults from maxDistanceKm and preferredAgeRange, kept within slider bounds', async () => {
    const { buildDefaultFilters } = await import('../../modules/discovery/redux/discoverySlice');
    expect(buildDefaultFilters({ maxDistanceKm: 8, preferredAgeRange: { min: 3, max: 6 } })).toEqual({
      maxDistance: 8,
      minAge: 3,
      maxAge: 6,
      personalities: [],
    });
    expect(buildDefaultFilters({ maxDistanceKm: 500, preferredAgeRange: { min: 9, max: 2 } })).toEqual({
      maxDistance: 100,
      minAge: 9,
      maxAge: 9,
      personalities: [],
    });
    expect(buildDefaultFilters()).toEqual({ maxDistance: 15, minAge: 1, maxAge: 12, personalities: [] });
  });

  it('starts with null filters, follows preference changes until the user customizes them', async () => {
    const reducerModule = await import('../../modules/discovery/redux/discoverySlice');
    const { default: reducer, initFiltersFromPreferences, setFilters, resetFilters } = reducerModule;

    const initial = reducer(undefined, { type: 'init' });
    expect(initial.filters).toBeNull();

    const prefsA = { maxDistanceKm: 10, preferredAgeRange: { min: 2, max: 5 } };
    const prefsB = { maxDistanceKm: 20, preferredAgeRange: { min: 4, max: 8 } };

    const withA = reducer(initial, initFiltersFromPreferences(prefsA));
    expect(withA.filters).toEqual(withA.defaultFilters);
    expect(withA.filters.maxDistance).toBe(10);

    // Untouched filters follow the new preferences
    const withB = reducer(withA, initFiltersFromPreferences(prefsB));
    expect(withB.filters.maxDistance).toBe(20);

    // Customized filters are kept, reset goes back to the preferences
    const customized = reducer(withB, setFilters({ maxDistance: 3 }));
    const afterPrefChange = reducer(customized, initFiltersFromPreferences(prefsA));
    expect(afterPrefChange.filters.maxDistance).toBe(3);
    expect(reducer(afterPrefChange, resetFilters()).filters).toEqual(afterPrefChange.defaultFilters);
  });
});

describe('discovery fresh search', () => {
  it('clears the current stack when filters are applied or another child is selected', async () => {
    const { default: reducer, setFilters, setSelectedChild, fetchDiscoveryProfiles } = await import(
      '../../modules/discovery/redux/discoverySlice'
    );
    const loaded = reducer(undefined, {
      type: fetchDiscoveryProfiles.fulfilled.type,
      payload: { profiles: [{ childId: 'a' }], meta: null },
      meta: { arg: {} },
    });
    expect(loaded.profiles).toHaveLength(1);
    expect(reducer(loaded, setFilters({ maxDistance: 5 })).profiles).toHaveLength(0);
    expect(reducer(loaded, setSelectedChild('k2')).profiles).toHaveLength(0);
  });
});
