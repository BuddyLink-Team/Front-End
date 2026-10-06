import { createSlice } from '@reduxjs/toolkit';
import { createApiThunk } from '../../../utils/reduxUtils';
import { discoveryApi } from '../api/discoveryApi';
import { DISCOVERY_PAGE_SIZE } from '../constants/discoveryConstants';

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

/**
 * Keep profiles having at least one of the selected personalities
 * (the backend does not filter by personality).
 */
const filterByPersonalities = (profiles, personalities = []) => {
  if (personalities.length === 0) return profiles;
  return profiles.filter((p) => (p.personality || []).some((trait) => personalities.includes(trait)));
};

/**
 * Filters: { maxDistance, minAge, maxAge, personalities }. Empty filters let the backend
 * fall back to the parent's saved preferences.
 */
const initialState = {
  filters: {},
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
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
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

export const { setFilters, resetFilters, removeProfile, restoreProfile, clearChildDetail } =
  discoverySlice.actions;

export default discoverySlice.reducer;
