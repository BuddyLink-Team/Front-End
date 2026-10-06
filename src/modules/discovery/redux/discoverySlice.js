import { createSlice } from '@reduxjs/toolkit';
import { createApiThunk } from '../../../utils/reduxUtils';
import { discoveryApi } from '../api/discoveryApi';
import {
  AGE_RANGE_YEARS,
  DEFAULT_DISCOVERY_FILTERS,
  DISCOVERY_PAGE_SIZE,
  DISTANCE_RANGE_KM,
} from '../constants/discoveryConstants';

// ---- Thunks ----

export const fetchDiscoveryProfiles = createApiThunk('discovery/fetchProfiles', (filters) =>
  discoveryApi.getProfiles(filters),
);

export const swipeDiscoveryProfile = createApiThunk('discovery/swipe', ({ targetChildId, isLike }) =>
  discoveryApi.swipe({ targetChildId, isLike }),
);

export const fetchChildPublicProfile = createApiThunk('discovery/fetchChildPublicProfile', (childId) =>
  discoveryApi.getChildPublicProfile(childId),
);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const isSameFilters = (a, b) => Boolean(a && b) && JSON.stringify(a) === JSON.stringify(b);

/**
 * Default filters from the parent's preferences (maxDistanceKm, preferredAgeRange),
 * kept inside the filter modal bounds. Personality has no preference: none selected.
 * @param {Object} [preferences] - parent.preferences
 */
export const buildDefaultFilters = (preferences = {}) => {
  const maxDistance = Number(preferences.maxDistanceKm) || DEFAULT_DISCOVERY_FILTERS.maxDistance;
  const minAge = preferences.preferredAgeRange?.min ?? DEFAULT_DISCOVERY_FILTERS.minAge;
  const maxAge = preferences.preferredAgeRange?.max ?? DEFAULT_DISCOVERY_FILTERS.maxAge;
  const safeMinAge = clamp(minAge, AGE_RANGE_YEARS.MIN, AGE_RANGE_YEARS.MAX);

  return {
    maxDistance: clamp(Math.round(maxDistance), DISTANCE_RANGE_KM.MIN, DISTANCE_RANGE_KM.MAX),
    minAge: safeMinAge,
    maxAge: clamp(maxAge, safeMinAge, AGE_RANGE_YEARS.MAX),
    personalities: [],
  };
};

/**
 * Keep profiles having at least one of the selected personalities
 * (the backend does not filter by personality).
 */
const filterByPersonalities = (profiles, personalities = []) => {
  if (personalities.length === 0) return profiles;
  return profiles.filter((p) => (p.personality || []).some((trait) => personalities.includes(trait)));
};

/**
 * Filters: { maxDistance, minAge, maxAge, personalities }.
 * `defaultFilters` come from the parent's preferences; `filters` stays null until they are
 * known so the first fetch already uses them.
 */
const initialState = {
  defaultFilters: null,
  filters: null,
  // Child of the current parent the matches are for (several children → parent picks one)
  selectedChildId: null,
  profiles: [],
  meta: null,
  hasMore: false,
  isLoading: false,
  error: null,
  // Public profile shown in the child detail modal
  childDetail: {
    childId: null,
    profile: null,
    isLoading: false,
    error: null,
  },
};

const discoverySlice = createSlice({
  name: 'discovery',
  initialState,
  reducers: {
    // Set the defaults from the parent's preferences. Filters still equal to the previous
    // defaults follow the new ones; filters the user changed are kept.
    // No-op when the defaults did not change, so state references stay stable (no re-render loop).
    initFiltersFromPreferences(state, action) {
      const nextDefaults = buildDefaultFilters(action.payload);
      const previousDefaults = state.defaultFilters;
      if (state.filters && isSameFilters(previousDefaults, nextDefaults)) return;

      const isUntouched = !state.filters || isSameFilters(state.filters, previousDefaults);
      state.defaultFilters = nextDefaults;
      if (isUntouched) state.filters = nextDefaults;
    },
    // Applying / resetting filters starts a fresh search: drop the current stack
    setFilters(state, action) {
      state.filters = { ...(state.filters || state.defaultFilters), ...action.payload };
      state.profiles = [];
      state.hasMore = false;
    },
    resetFilters(state) {
      state.filters = state.defaultFilters || buildDefaultFilters();
      state.profiles = [];
      state.hasMore = false;
    },
    setSelectedChild(state, action) {
      if (state.selectedChildId === action.payload) return;
      state.selectedChildId = action.payload;
      state.profiles = [];
      state.hasMore = false;
    },
    // Optimistically drop a card as soon as it is swiped
    removeProfile(state, action) {
      state.profiles = state.profiles.filter((p) => p.childId !== action.payload);
    },
    // Put a card back on top of the stack when its swipe failed
    restoreProfile(state, action) {
      const profile = action.payload;
      if (!state.profiles.some((p) => p.childId === profile.childId)) {
        state.profiles.unshift(profile);
      }
    },
    clearChildDetail(state) {
      state.childDetail = initialState.childDetail;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscoveryProfiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDiscoveryProfiles.fulfilled, (state, action) => {
        const rawProfiles = action.payload?.profiles || [];
        const profiles = filterByPersonalities(rawProfiles, action.meta.arg?.personalities);
        state.isLoading = false;
        state.profiles = profiles;
        state.meta = action.payload?.meta || null;
        // Stop auto-loading when the personality filter left nothing to show,
        // otherwise the same unswiped page would be fetched again and again
        state.hasMore = rawProfiles.length >= DISCOVERY_PAGE_SIZE && profiles.length > 0;
      })
      .addCase(fetchDiscoveryProfiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || null;
      })
      .addCase(swipeDiscoveryProfile.fulfilled, (state, action) => {
        if (state.meta && action.payload?.remainingViews !== undefined) {
          state.meta.remainingViews = action.payload.remainingViews;
        }
      })
      .addCase(fetchChildPublicProfile.pending, (state, action) => {
        state.childDetail = { childId: action.meta.arg, profile: null, isLoading: true, error: null };
      })
      .addCase(fetchChildPublicProfile.fulfilled, (state, action) => {
        // Ignore responses for a child that is no longer selected
        if (state.childDetail.childId !== action.meta.arg) return;
        state.childDetail.profile = action.payload || null;
        state.childDetail.isLoading = false;
      })
      .addCase(fetchChildPublicProfile.rejected, (state, action) => {
        if (state.childDetail.childId !== action.meta.arg) return;
        state.childDetail.error = action.payload || null;
        state.childDetail.isLoading = false;
      });
  },
});

export const {
  initFiltersFromPreferences,
  setSelectedChild,
  setFilters,
  resetFilters,
  removeProfile,
  restoreProfile,
  clearChildDetail,
} = discoverySlice.actions;

export default discoverySlice.reducer;
